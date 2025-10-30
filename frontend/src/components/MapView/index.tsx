import { useEffect, useRef, useState } from 'react';
import { Spin } from 'antd';
import { useApiConfigStore } from '../../store/apiConfigStore';
import type { DayItinerary } from '../../types/common';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
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

    // 检查是否已加载
    if (window.AMap) {
      initMap();
      return;
    }

    // 动态加载高德地图 JS API
    const script = document.createElement('script');
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${config.amap_key}`;
    script.async = true;
    script.onload = () => {
      initMap();
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
      });

      mapRef.current = map;
      setLoading(false);
      setError(null);
    } catch (err: any) {
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

  // 当行程数据变化时，更新地图标记
  useEffect(() => {
    if (!mapRef.current || !itinerary || itinerary.length === 0) return;

    // 清除现有标记
    mapRef.current.clearMap();
    markersRef.current = [];

    const markers: any[] = [];
    const points: [number, number][] = [];
    const polylines: any[] = []; // 存储每天的路线

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

      // 绘制每天的路线(不同颜色)并计算距离和时间
      if (dayPoints.length > 1) {
        const colors = ['#1890ff', '#52c41a', '#faad14', '#eb2f96', '#722ed1', '#13c2c2'];
        const polyline = new window.AMap.Polyline({
          path: dayPoints,
          strokeColor: colors[dayIndex % colors.length],
          strokeWeight: 3,
          strokeOpacity: 0.6,
          strokeStyle: 'solid',
        });
        polylines.push(polyline);

        // 计算相邻点之间的距离和时间
        for (let i = 0; i < dayPoints.length - 1; i++) {
          const startPoint = dayPoints[i];
          const endPoint = dayPoints[i + 1];

          // 计算直线距离 (米)
          const distance = window.AMap.GeometryUtil.distance(startPoint, endPoint);
          const distanceKm = (distance / 1000).toFixed(1);

          // 估算时间 (假设步行速度 5km/h)
          const walkingTimeMinutes = Math.round((distance / 1000) / 5 * 60);

          // 计算中点位置
          const midLng = (startPoint[0] + endPoint[0]) / 2;
          const midLat = (startPoint[1] + endPoint[1]) / 2;

          // 创建距离和时间标签
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
          labelContent.innerHTML = `${distanceKm}km / ${walkingTimeMinutes}分钟`;

          const labelMarker = new window.AMap.Marker({
            position: [midLng, midLat],
            content: labelContent,
            offset: new window.AMap.Pixel(-30, -10),
            zIndex: 200,
          });

          markers.push(labelMarker);
        }
      }
    });

    // 添加标记到地图
    mapRef.current.add(markers);

    // 添加路线到地图
    if (polylines.length > 0) {
      mapRef.current.add(polylines);
    }

    // 自动调整视野以显示所有点
    if (points.length > 0) {
      mapRef.current.setFitView();
    }
  }, [itinerary, onMarkerClick]);

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
    <div className="map-view" style={{ height }}>
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

