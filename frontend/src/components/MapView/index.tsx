import { useEffect, useRef, useState } from 'react';
import { Spin, Button, Space } from 'antd';
import { CarOutlined, ManOutlined } from '@ant-design/icons';
import { useApiConfigStore } from '../../store/apiConfigStore';
import type { DayItinerary } from '../../types/common';
import { findTransportCoordinates } from '../../utils/transportationCoordinates';
import './index.css';

export interface MapViewProps {
  itinerary?: DayItinerary[];
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  height?: string | number;
  destination?: string; // 目的地城市名称,用于初始定位
  onMarkerClick?: (activity: any, dayIndex: number, activityIndex: number) => void; // 标记点击回调
}

// 声明高德地图全局变量
declare global {
  interface Window {
    AMap: any;
    _AMapSecurityConfig: any;
  }
}

// 路线模式类型
type RouteMode = 'driving' | 'walking';

const MapView: React.FC<MapViewProps> = ({
  itinerary,
  center = [116.397428, 39.90923], // 默认北京天安门
  zoom = 12,
  height = 500,
  destination,
  onMarkerClick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]); // 保存标记点引用
  const polylinesRef = useRef<any[]>([]); // 保存路线引用
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [routeMode, setRouteMode] = useState<RouteMode>('driving'); // 路线模式
  const { config } = useApiConfigStore();

  // 根据目的地获取地图中心点
  useEffect(() => {
    if (destination && window.AMap && window.AMap.Geocoder) {
      try {
        // 使用高德地图地理编码服务获取目的地坐标
        const geocoder = new window.AMap.Geocoder();
        geocoder.getLocation(destination, (status: string, result: any) => {
          if (status === 'complete' && result.geocodes && result.geocodes.length > 0) {
            const location = result.geocodes[0].location;
            setMapCenter([location.lng, location.lat]);
            if (mapRef.current) {
              mapRef.current.setCenter([location.lng, location.lat]);
              mapRef.current.setZoom(12);
            }
          }
        });
      } catch (err) {
        console.error('地理编码失败:', err);
      }
    }
  }, [destination]);

  // 加载高德地图 JS API
  useEffect(() => {
    if (!config.amap_key) {
      setError('高德地图 API Key 未配置');
      setLoading(false);
      return;
    }

    // 设置安全密钥(如果有)
    if (config.amap_secret) {
      window._AMapSecurityConfig = {
        securityJsCode: config.amap_secret,
      };
      console.log('✅ 高德地图安全密钥已设置');
    }

    // 检查是否已加载
    if (window.AMap) {
      initMap();
      return;
    }

    // 动态加载高德地图 JS API (包含必要的插件)
    const script = document.createElement('script');
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${config.amap_key}&plugin=AMap.Geocoder,AMap.Driving,AMap.Walking`;
    script.async = true;
    script.onload = () => {
      // 等待 AMap 完全初始化
      if (window.AMap) {
        initMap();
      } else {
        setError('高德地图 API 加载异常');
        setLoading(false);
      }
    };
    script.onerror = () => {
      setError('加载高德地图失败');
      setLoading(false);
    };
    document.head.appendChild(script);

    return () => {
      // 清理地图实例
      if (mapRef.current) {
        mapRef.current.destroy();
      }
    };
  }, [config.amap_key]);

  // 初始化地图
  const initMap = () => {
    if (!mapContainerRef.current) return;

    try {
      const map = new window.AMap.Map(mapContainerRef.current, {
        zoom,
        center: mapCenter,
        viewMode: '2D', // 改为 2D 平面视图，更直观
        mapStyle: 'amap://styles/normal', // 使用标准地图样式
        features: ['bg', 'road', 'building', 'point'], // 显示背景、道路、建筑物、POI
        resizeEnable: true, // 允许地图自适应容器大小
      });

      mapRef.current = map;
      setLoading(false);
      setError(null);

      console.log('✅ 地图初始化成功');
    } catch (err: any) {
      console.error('❌ 地图初始化失败:', err);
      setError(`初始化地图失败: ${err.message}`);
      setLoading(false);
    }
  };

  // 获取活动类型对应的标记点样式
  const getMarkerStyle = (type: string) => {
    const styles: Record<string, { color: string; icon: string }> = {
      attraction: { color: '#1890ff', icon: '📍' }, // 蓝色 - 景点
      restaurant: { color: '#ff7a45', icon: '🍴' }, // 橙色 - 餐厅
      shopping: { color: '#52c41a', icon: '🛍️' }, // 绿色 - 购物
      transport: { color: '#722ed1', icon: '🚗' }, // 紫色 - 交通
      accommodation: { color: '#eb2f96', icon: '🏨' }, // 粉色 - 住宿
      entertainment: { color: '#faad14', icon: '🎭' }, // 黄色 - 娱乐
      other: { color: '#8c8c8c', icon: '📌' }, // 灰色 - 其他
    };
    return styles[type] || styles.other;
  };

  // 当行程数据或路线模式变化时，更新地图标记和路线
  useEffect(() => {
    if (!mapRef.current || !itinerary || itinerary.length === 0) return;

    // 检查高德地图 API 是否完全加载
    if (!window.AMap || !window.AMap.Marker || !window.AMap.Polyline) {
      console.warn('⚠️ 高德地图 API 尚未完全加载，跳过标记和路线绘制');
      return;
    }

    // 清除现有标记和路线
    mapRef.current.clearMap();
    markersRef.current = [];
    polylinesRef.current = [];

    const markers: any[] = [];
    const points: [number, number][] = [];

    // 遍历每天的行程
    itinerary.forEach((day, dayIndex) => {
      const dayPoints: [number, number][] = [];

      // 添加活动标记
      day.activities.forEach((activity, actIndex) => {
        // 检查是否有坐标信息
        if (!activity.coordinates || !Array.isArray(activity.coordinates) || activity.coordinates.length !== 2) {
          console.warn(`⚠️ Day${dayIndex + 1}-${actIndex + 1} "${activity.name}" 缺少坐标信息`, activity);
          return;
        }

        const [lng, lat] = activity.coordinates;

        // 验证坐标有效性
        if (typeof lng !== 'number' || typeof lat !== 'number' || isNaN(lng) || isNaN(lat)) {
          console.warn(`⚠️ Day${dayIndex + 1}-${actIndex + 1} "${activity.name}" 坐标无效: [${lng}, ${lat}]`);
          return;
        }

        points.push([lng, lat]);
        dayPoints.push([lng, lat]);

        const style = getMarkerStyle(activity.type);

        console.log(`✅ 添加标记: Day${dayIndex + 1}-${actIndex + 1} "${activity.name}" (${activity.type}) at [${lng}, ${lat}]`);

        // 创建自定义标记内容
        const markerContent = document.createElement('div');
        markerContent.style.cssText = `
          background: ${style.color};
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          white-space: nowrap;
        `;
        markerContent.innerHTML = `${style.icon} Day${dayIndex + 1}-${actIndex + 1}`;

        // 创建标记
        const marker = new window.AMap.Marker({
          position: [lng, lat],
          content: markerContent,
          title: activity.name,
          offset: new window.AMap.Pixel(-20, -10),
        });

        // 添加点击事件
        marker.on('click', () => {
          const infoWindow = new window.AMap.InfoWindow({
            content: `
              <div style="padding: 12px; min-width: 200px;">
                <h4 style="margin: 0 0 8px 0; color: ${style.color};">${style.icon} ${activity.name}</h4>
                ${activity.address ? `<p style="margin: 4px 0; color: #666; font-size: 12px;">📍 ${activity.address}</p>` : ''}
                ${activity.start_time && activity.end_time ? `<p style="margin: 4px 0; color: #666; font-size: 12px;">⏰ ${activity.start_time} - ${activity.end_time}</p>` : ''}
                ${activity.duration ? `<p style="margin: 4px 0; color: #666; font-size: 12px;">⏱️ 时长: ${activity.duration}</p>` : ''}
                ${activity.ticket_price ? `<p style="margin: 4px 0; color: #ff4d4f; font-size: 12px;">💰 门票: ¥${activity.ticket_price}</p>` : ''}
                ${activity.description ? `<p style="margin: 8px 0 0 0; font-size: 12px; line-height: 1.5;">${activity.description}</p>` : ''}
              </div>
            `,
          });
          infoWindow.open(mapRef.current, [lng, lat]);

          // 触发回调
          if (onMarkerClick) {
            onMarkerClick(activity, dayIndex, actIndex);
          }
        });

        markers.push(marker);
        markersRef.current.push(marker);
      });

      // 添加住宿标记
      if (day.accommodation && day.accommodation.location) {
        const { lng, lat } = day.accommodation.location;
        points.push([lng, lat]);
        dayPoints.push([lng, lat]);

        const style = getMarkerStyle('accommodation');
        const markerContent = document.createElement('div');
        markerContent.style.cssText = `
          background: ${style.color};
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        `;
        markerContent.innerHTML = `${style.icon} 住宿`;

        const marker = new window.AMap.Marker({
          position: [lng, lat],
          content: markerContent,
          title: day.accommodation.name,
          offset: new window.AMap.Pixel(-20, -10),
        });

        marker.on('click', () => {
          const infoWindow = new window.AMap.InfoWindow({
            content: `
              <div style="padding: 12px; min-width: 200px;">
                <h4 style="margin: 0 0 8px 0; color: ${style.color};">${style.icon} ${day.accommodation.name}</h4>
                <p style="margin: 4px 0; color: #666; font-size: 12px;">📍 ${day.accommodation.address}</p>
                ${day.accommodation.price_per_night ? `<p style="margin: 4px 0; color: #ff4d4f; font-size: 12px;">💰 ¥${day.accommodation.price_per_night}/晚</p>` : ''}
                ${day.accommodation.rating ? `<p style="margin: 4px 0; color: #faad14; font-size: 12px;">⭐ ${day.accommodation.rating}分</p>` : ''}
              </div>
            `,
          });
          infoWindow.open(mapRef.current, [lng, lat]);
        });

        markers.push(marker);
        markersRef.current.push(marker);
      }

      // 添加餐饮标记
      if (day.meals && day.meals.length > 0) {
        day.meals.forEach((meal) => {
          if (meal.location) {
            const { lng, lat } = meal.location;
            points.push([lng, lat]);
            dayPoints.push([lng, lat]);

            const style = getMarkerStyle('restaurant');
            const markerContent = document.createElement('div');
            markerContent.style.cssText = `
              background: ${style.color};
              color: white;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: bold;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            `;
            markerContent.innerHTML = `${style.icon} ${meal.type}`;

            const marker = new window.AMap.Marker({
              position: [lng, lat],
              content: markerContent,
              title: meal.name,
              offset: new window.AMap.Pixel(-20, -10),
            });

            marker.on('click', () => {
              const infoWindow = new window.AMap.InfoWindow({
                content: `
                  <div style="padding: 12px; min-width: 200px;">
                    <h4 style="margin: 0 0 8px 0; color: ${style.color};">${style.icon} ${meal.name}</h4>
                    <p style="margin: 4px 0; color: #666; font-size: 12px;">📍 ${meal.address}</p>
                    <p style="margin: 4px 0; color: #666; font-size: 12px;">🍽️ ${meal.cuisine}</p>
                    ${meal.price_per_person ? `<p style="margin: 4px 0; color: #ff4d4f; font-size: 12px;">💰 ¥${meal.price_per_person}/人</p>` : ''}
                  </div>
                `,
              });
              infoWindow.open(mapRef.current, [lng, lat]);
            });

            markers.push(marker);
            markersRef.current.push(marker);
          }
        });
      }

      // 添加交通枢纽标记(机场、火车站)
      if (day.transportation && day.transportation.length > 0) {
        day.transportation.forEach((transport) => {
          // 处理出发地
          if (transport.from) {
            let fromCoords = transport.from_coordinates;

            // 如果没有坐标,尝试从预设映射表中查找
            if (!fromCoords || !Array.isArray(fromCoords) || fromCoords.length !== 2) {
              fromCoords = findTransportCoordinates(transport.from);
            }

            if (fromCoords) {
              const [lng, lat] = fromCoords;
              points.push([lng, lat]);
              dayPoints.push([lng, lat]);

              const icon = transport.type === 'flight' ? '✈️' : '🚄';
              const color = transport.type === 'flight' ? '#1890ff' : '#52c41a';

              const markerContent = document.createElement('div');
              markerContent.style.cssText = `
                background: ${color};
                color: white;
                padding: 6px 12px;
                border-radius: 16px;
                font-size: 14px;
                font-weight: bold;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                border: 2px solid white;
              `;
              markerContent.innerHTML = `${icon} ${transport.from}`;

              const marker = new window.AMap.Marker({
                position: [lng, lat],
                content: markerContent,
                title: transport.from,
                offset: new window.AMap.Pixel(-30, -15),
                zIndex: 200, // 提高层级,确保显示在最上层
              });

              marker.on('click', () => {
                const infoWindow = new window.AMap.InfoWindow({
                  content: `
                    <div style="padding: 12px; min-width: 250px;">
                      <h4 style="margin: 0 0 8px 0; color: ${color};">${icon} ${transport.from}</h4>
                      <p style="margin: 4px 0; color: #666; font-size: 12px;">🎯 目的地: ${transport.to}</p>
                      ${transport.departure_time ? `<p style="margin: 4px 0; color: #666; font-size: 12px;">🕐 出发: ${transport.departure_time}</p>` : ''}
                      ${transport.arrival_time ? `<p style="margin: 4px 0; color: #666; font-size: 12px;">🕐 到达: ${transport.arrival_time}</p>` : ''}
                      ${transport.duration ? `<p style="margin: 4px 0; color: #666; font-size: 12px;">⏱️ 时长: ${transport.duration}</p>` : ''}
                      ${transport.flight_number ? `<p style="margin: 4px 0; color: #666; font-size: 12px;">✈️ 航班: ${transport.flight_number}</p>` : ''}
                      ${transport.train_number ? `<p style="margin: 4px 0; color: #666; font-size: 12px;">🚄 车次: ${transport.train_number}</p>` : ''}
                      ${transport.price ? `<p style="margin: 4px 0; color: #ff4d4f; font-size: 12px;">💰 ¥${transport.price}</p>` : ''}
                      ${transport.notes ? `<p style="margin: 4px 0; color: #faad14; font-size: 11px;">💡 ${transport.notes}</p>` : ''}
                    </div>
                  `,
                });
                infoWindow.open(mapRef.current, [lng, lat]);
              });

              markers.push(marker);
              markersRef.current.push(marker);
              console.log(`✅ 添加交通枢纽标记: ${transport.from} at [${lng}, ${lat}]`);
            } else {
              console.warn(`⚠️ 无法获取交通枢纽坐标: ${transport.from}`);
            }
          }

          // 处理目的地
          if (transport.to) {
            let toCoords = transport.to_coordinates;

            // 如果没有坐标,尝试从预设映射表中查找
            if (!toCoords || !Array.isArray(toCoords) || toCoords.length !== 2) {
              toCoords = findTransportCoordinates(transport.to);
            }

            if (toCoords) {
              const [lng, lat] = toCoords;
              points.push([lng, lat]);
              dayPoints.push([lng, lat]);

              const icon = transport.type === 'flight' ? '✈️' : '🚄';
              const color = transport.type === 'flight' ? '#1890ff' : '#52c41a';

              const markerContent = document.createElement('div');
              markerContent.style.cssText = `
                background: ${color};
                color: white;
                padding: 6px 12px;
                border-radius: 16px;
                font-size: 14px;
                font-weight: bold;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                border: 2px solid white;
              `;
              markerContent.innerHTML = `${icon} ${transport.to}`;

              const marker = new window.AMap.Marker({
                position: [lng, lat],
                content: markerContent,
                title: transport.to,
                offset: new window.AMap.Pixel(-30, -15),
                zIndex: 200,
              });

              marker.on('click', () => {
                const infoWindow = new window.AMap.InfoWindow({
                  content: `
                    <div style="padding: 12px; min-width: 250px;">
                      <h4 style="margin: 0 0 8px 0; color: ${color};">${icon} ${transport.to}</h4>
                      <p style="margin: 4px 0; color: #666; font-size: 12px;">🎯 出发地: ${transport.from}</p>
                      ${transport.departure_time ? `<p style="margin: 4px 0; color: #666; font-size: 12px;">🕐 出发: ${transport.departure_time}</p>` : ''}
                      ${transport.arrival_time ? `<p style="margin: 4px 0; color: #666; font-size: 12px;">🕐 到达: ${transport.arrival_time}</p>` : ''}
                      ${transport.duration ? `<p style="margin: 4px 0; color: #666; font-size: 12px;">⏱️ 时长: ${transport.duration}</p>` : ''}
                      ${transport.flight_number ? `<p style="margin: 4px 0; color: #666; font-size: 12px;">✈️ 航班: ${transport.flight_number}</p>` : ''}
                      ${transport.train_number ? `<p style="margin: 4px 0; color: #666; font-size: 12px;">🚄 车次: ${transport.train_number}</p>` : ''}
                      ${transport.price ? `<p style="margin: 4px 0; color: #ff4d4f; font-size: 12px;">💰 ¥${transport.price}</p>` : ''}
                      ${transport.notes ? `<p style="margin: 4px 0; color: #faad14; font-size: 11px;">💡 ${transport.notes}</p>` : ''}
                    </div>
                  `,
                });
                infoWindow.open(mapRef.current, [lng, lat]);
              });

              markers.push(marker);
              markersRef.current.push(marker);
              console.log(`✅ 添加交通枢纽标记: ${transport.to} at [${lng}, ${lat}]`);
            } else {
              console.warn(`⚠️ 无法获取交通枢纽坐标: ${transport.to}`);
            }
          }
        });
      }

      // 绘制每天的路线(使用真实路线规划)
      if (dayPoints.length > 1) {
        const colors = ['#1890ff', '#52c41a', '#faad14', '#eb2f96', '#722ed1', '#13c2c2'];

        // 检查路线规划服务是否可用
        if (!window.AMap.Driving || !window.AMap.Walking || !window.AMap.GeometryUtil) {
          console.warn('⚠️ 路线规划服务未加载，跳过路线绘制');
          return;
        }

        // 遍历相邻点，计算真实路线
        for (let i = 0; i < dayPoints.length - 1; i++) {
          const startPoint = dayPoints[i];
          const endPoint = dayPoints[i + 1];

          // 计算直线距离
          const straightDistance = window.AMap.GeometryUtil.distance(startPoint, endPoint);
          const distanceKm = straightDistance / 1000;

          // 根据用户选择的路线模式和距离决定交通方式
          let useWalking = routeMode === 'walking';
          let transportMode = routeMode === 'walking' ? '步行' : '驾车';

          // 如果选择驾车但距离太近(<0.5km),自动切换为步行
          if (routeMode === 'driving' && distanceKm < 0.5) {
            useWalking = true;
            transportMode = '步行';
          }

          // 创建路线规划服务
          const routeService = useWalking
            ? new window.AMap.Walking({
                map: mapRef.current,
                hideMarkers: true,
              })
            : new window.AMap.Driving({
                map: mapRef.current,
                policy: window.AMap.DrivingPolicy?.LEAST_TIME || 0, // 最快路线,如果未定义则使用默认值0
                hideMarkers: true,
              });

          // 搜索路线
          routeService.search(startPoint, endPoint, (status: string, result: any) => {
            if (status === 'complete' && result.routes && result.routes.length > 0) {
              const route = result.routes[0];
              const distance = (route.distance / 1000).toFixed(1); // 公里
              const duration = Math.round(route.time / 60); // 分钟

              // 绘制路线
              const path = route.steps.flatMap((step: any) => step.path);
              const polyline = new window.AMap.Polyline({
                path: path,
                strokeColor: colors[dayIndex % colors.length],
                strokeWeight: 4,
                strokeOpacity: 0.8,
                strokeStyle: 'solid',
                showDir: true, // 显示方向箭头
              });
              mapRef.current.add(polyline);
              polylinesRef.current.push(polyline); // 保存路线引用

              // 计算路线中点位置
              const midIndex = Math.floor(path.length / 2);
              const midPoint = path[midIndex];

              // 创建距离和时间标签
              const labelContent = document.createElement('div');
              labelContent.style.cssText = `
                background: rgba(255, 255, 255, 0.95);
                color: ${colors[dayIndex % colors.length]};
                padding: 6px 10px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: bold;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                white-space: nowrap;
                border: 2px solid ${colors[dayIndex % colors.length]};
                cursor: pointer;
              `;
              labelContent.innerHTML = `${transportMode} ${distance}km / ${duration}分钟`;

              const labelMarker = new window.AMap.Marker({
                position: midPoint,
                content: labelContent,
                offset: new window.AMap.Pixel(-40, -15),
                zIndex: 200,
              });

              // 添加点击事件显示详细路线
              labelMarker.on('click', () => {
                const steps = route.steps.map((step: any, idx: number) =>
                  `${idx + 1}. ${step.instruction}`
                ).join('<br>');

                const infoWindow = new window.AMap.InfoWindow({
                  content: `
                    <div style="padding: 12px; max-width: 300px;">
                      <h4 style="margin: 0 0 8px 0; color: ${colors[dayIndex % colors.length]};">
                        ${transportMode}路线详情
                      </h4>
                      <p style="margin: 4px 0; font-weight: bold;">
                        📏 距离: ${distance} 公里
                      </p>
                      <p style="margin: 4px 0; font-weight: bold;">
                        ⏱️ 时间: ${duration} 分钟
                      </p>
                      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee;">
                        <p style="margin: 0 0 8px 0; font-weight: bold;">详细步骤:</p>
                        <div style="font-size: 12px; line-height: 1.6; max-height: 200px; overflow-y: auto;">
                          ${steps}
                        </div>
                      </div>
                    </div>
                  `,
                });
                infoWindow.open(mapRef.current, midPoint);
              });

              markers.push(labelMarker);
            } else {
              console.warn(`路线规划失败: ${startPoint} -> ${endPoint}`, status, result);

              // 如果路线规划失败，回退到直线显示
              const polyline = new window.AMap.Polyline({
                path: [startPoint, endPoint],
                strokeColor: colors[dayIndex % colors.length],
                strokeWeight: 3,
                strokeOpacity: 0.6,
                strokeStyle: 'dashed', // 使用虚线表示这是估算路线
              });
              mapRef.current.add(polyline);
              polylinesRef.current.push(polyline); // 保存路线引用

              // 仍然显示直线距离和估算时间
              const distance = (straightDistance / 1000).toFixed(1);
              const estimatedTime = Math.round((straightDistance / 1000) / 5 * 60);
              const midLng = (startPoint[0] + endPoint[0]) / 2;
              const midLat = (startPoint[1] + endPoint[1]) / 2;

              const labelContent = document.createElement('div');
              labelContent.style.cssText = `
                background: rgba(255, 255, 255, 0.95);
                color: ${colors[dayIndex % colors.length]};
                padding: 4px 8px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: bold;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                white-space: nowrap;
                border: 1px solid ${colors[dayIndex % colors.length]};
              `;
              labelContent.innerHTML = `约${distance}km / ${estimatedTime}分钟`;

              const labelMarker = new window.AMap.Marker({
                position: [midLng, midLat],
                content: labelContent,
                offset: new window.AMap.Pixel(-30, -10),
                zIndex: 200,
              });

              markers.push(labelMarker);
            }
          });
        }
      }
    });

    // 添加标记到地图
    mapRef.current.add(markers);

    // 自动调整视野以显示所有点
    if (points.length > 0) {
      mapRef.current.setFitView();
    }
  }, [itinerary, onMarkerClick, routeMode]); // 添加routeMode依赖

  // 暴露定位到特定坐标的方法
  useEffect(() => {
    if (mapRef.current && (window as any).focusMapLocation) {
      (window as any).focusMapLocation = (lng: number, lat: number) => {
        mapRef.current.setCenter([lng, lat]);
        mapRef.current.setZoom(16);
      };
    }
  }, []);

  if (error) {
    return (
      <div className="map-error" style={{ height }}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="map-view" style={{ height, position: 'relative' }}>
      {/* 交通方式切换按钮 */}
      {!loading && itinerary && itinerary.length > 0 && (
        <div className="route-mode-selector">
          <Space>
            <Button
              type={routeMode === 'driving' ? 'primary' : 'default'}
              icon={<CarOutlined />}
              onClick={() => setRouteMode('driving')}
              size="small"
            >
              驾车
            </Button>
            <Button
              type={routeMode === 'walking' ? 'primary' : 'default'}
              icon={<ManOutlined />}
              onClick={() => setRouteMode('walking')}
              size="small"
            >
              步行
            </Button>
          </Space>
        </div>
      )}

      {loading && (
        <div className="map-loading">
          <Spin size="large" tip="加载地图中...">
            <div style={{ minHeight: 100 }} />
          </Spin>
        </div>
      )}
      <div ref={mapContainerRef} className="map-container" style={{ height: '100%' }} />
    </div>
  );
};

export default MapView;

