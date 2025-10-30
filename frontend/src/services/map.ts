import { useApiConfigStore } from '../store/apiConfigStore';

/**
 * 高德地图服务
 * 使用高德地图 Web 服务 API
 */

// 高德地图 API 基础 URL
const AMAP_API_BASE = 'https://restapi.amap.com/v3';

/**
 * 获取高德地图 API Key
 */
const getAmapKey = (): string => {
  const { config } = useApiConfigStore.getState();
  const key = config.amap_key || import.meta.env.VITE_AMAP_KEY;

  if (!key || key.includes('your_')) {
    throw new Error('高德地图 API Key 未配置，请在设置页面配置');
  }

  return key;
};

/**
 * 地理编码：地址转坐标
 */
export const geocode = async (
  address: string,
  city?: string
): Promise<{ lat: number; lng: number; formattedAddress: string } | null> => {
  const key = getAmapKey();

  try {
    const params = new URLSearchParams({
      key,
      address,
      ...(city && { city }),
    });

    const response = await fetch(`${AMAP_API_BASE}/geocode/geo?${params}`);
    const data = await response.json();

    if (data.status === '1' && data.geocodes && data.geocodes.length > 0) {
      const location = data.geocodes[0].location.split(',');
      return {
        lng: parseFloat(location[0]),
        lat: parseFloat(location[1]),
        formattedAddress: data.geocodes[0].formatted_address,
      };
    }

    return null;
  } catch (error) {
    console.error('地理编码失败:', error);
    throw new Error('地址解析失败');
  }
};

/**
 * 逆地理编码：坐标转地址
 */
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<{
  formattedAddress: string;
  province: string;
  city: string;
  district: string;
} | null> => {
  const key = getAmapKey();

  try {
    const params = new URLSearchParams({
      key,
      location: `${lng},${lat}`,
    });

    const response = await fetch(`${AMAP_API_BASE}/geocode/regeo?${params}`);
    const data = await response.json();

    if (data.status === '1' && data.regeocode) {
      const addressComponent = data.regeocode.addressComponent;
      return {
        formattedAddress: data.regeocode.formatted_address,
        province: addressComponent.province,
        city: addressComponent.city,
        district: addressComponent.district,
      };
    }

    return null;
  } catch (error) {
    console.error('逆地理编码失败:', error);
    throw new Error('坐标解析失败');
  }
};

/**
 * POI 搜索
 */
export interface POI {
  id: string;
  name: string;
  type: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  tel?: string;
  distance?: number;
  rating?: number;
}

export const searchPOI = async (
  keyword: string,
  city?: string,
  types?: string
): Promise<POI[]> => {
  const key = getAmapKey();

  try {
    const params = new URLSearchParams({
      key,
      keywords: keyword,
      ...(city && { city }),
      ...(types && { types }),
      offset: '20',
    });

    const response = await fetch(`${AMAP_API_BASE}/place/text?${params}`);
    const data = await response.json();

    if (data.status === '1' && data.pois) {
      return data.pois.map((poi: any) => {
        const location = poi.location.split(',');
        return {
          id: poi.id,
          name: poi.name,
          type: poi.type,
          address: poi.address,
          location: {
            lng: parseFloat(location[0]),
            lat: parseFloat(location[1]),
          },
          tel: poi.tel,
        };
      });
    }

    return [];
  } catch (error) {
    console.error('POI 搜索失败:', error);
    throw new Error('搜索失败');
  }
};

/**
 * 周边搜索
 */
export const searchNearby = async (
  lat: number,
  lng: number,
  keyword: string,
  radius: number = 1000
): Promise<POI[]> => {
  const key = getAmapKey();

  try {
    const params = new URLSearchParams({
      key,
      location: `${lng},${lat}`,
      keywords: keyword,
      radius: radius.toString(),
      offset: '20',
    });

    const response = await fetch(`${AMAP_API_BASE}/place/around?${params}`);
    const data = await response.json();

    if (data.status === '1' && data.pois) {
      return data.pois.map((poi: any) => {
        const location = poi.location.split(',');
        return {
          id: poi.id,
          name: poi.name,
          type: poi.type,
          address: poi.address,
          location: {
            lng: parseFloat(location[0]),
            lat: parseFloat(location[1]),
          },
          tel: poi.tel,
          distance: parseInt(poi.distance),
        };
      });
    }

    return [];
  } catch (error) {
    console.error('周边搜索失败:', error);
    throw new Error('周边搜索失败');
  }
};

/**
 * 路径规划 - 驾车
 */
export interface RouteResult {
  distance: number; // 米
  duration: number; // 秒
  tolls: number; // 过路费（元）
  steps: {
    instruction: string;
    distance: number;
    duration: number;
  }[];
}

export const getDrivingRoute = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<RouteResult | null> => {
  const key = getAmapKey();

  try {
    const params = new URLSearchParams({
      key,
      origin: `${origin.lng},${origin.lat}`,
      destination: `${destination.lng},${destination.lat}`,
    });

    const response = await fetch(`${AMAP_API_BASE}/direction/driving?${params}`);
    const data = await response.json();

    if (data.status === '1' && data.route && data.route.paths && data.route.paths.length > 0) {
      const path = data.route.paths[0];
      return {
        distance: parseInt(path.distance),
        duration: parseInt(path.duration),
        tolls: parseFloat(path.tolls || 0),
        steps: path.steps.map((step: any) => ({
          instruction: step.instruction,
          distance: parseInt(step.distance),
          duration: parseInt(step.duration),
        })),
      };
    }

    return null;
  } catch (error) {
    console.error('路径规划失败:', error);
    throw new Error('路径规划失败');
  }
};

/**
 * 路径规划 - 公交
 */
export const getTransitRoute = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  city: string
): Promise<RouteResult | null> => {
  const key = getAmapKey();

  try {
    const params = new URLSearchParams({
      key,
      origin: `${origin.lng},${origin.lat}`,
      destination: `${destination.lng},${destination.lat}`,
      city,
    });

    const response = await fetch(`${AMAP_API_BASE}/direction/transit/integrated?${params}`);
    const data = await response.json();

    if (data.status === '1' && data.route && data.route.transits && data.route.transits.length > 0) {
      const transit = data.route.transits[0];
      return {
        distance: parseInt(transit.distance),
        duration: parseInt(transit.duration),
        tolls: 0,
        steps: transit.segments.map((segment: any) => ({
          instruction: segment.walking?.instruction || segment.bus?.buslines?.[0]?.name || '',
          distance: parseInt(segment.walking?.distance || 0),
          duration: parseInt(segment.walking?.duration || segment.bus?.duration || 0),
        })),
      };
    }

    return null;
  } catch (error) {
    console.error('公交路径规划失败:', error);
    throw new Error('公交路径规划失败');
  }
};

/**
 * 路径规划 - 步行
 */
export const getWalkingRoute = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<RouteResult | null> => {
  const key = getAmapKey();

  try {
    const params = new URLSearchParams({
      key,
      origin: `${origin.lng},${origin.lat}`,
      destination: `${destination.lng},${destination.lat}`,
    });

    const response = await fetch(`${AMAP_API_BASE}/direction/walking?${params}`);
    const data = await response.json();

    if (data.status === '1' && data.route && data.route.paths && data.route.paths.length > 0) {
      const path = data.route.paths[0];
      return {
        distance: parseInt(path.distance),
        duration: parseInt(path.duration),
        tolls: 0,
        steps: path.steps.map((step: any) => ({
          instruction: step.instruction,
          distance: parseInt(step.distance),
          duration: parseInt(step.duration),
        })),
      };
    }

    return null;
  } catch (error) {
    console.error('步行路径规划失败:', error);
    throw new Error('步行路径规划失败');
  }
};

/**
 * 计算两点之间的距离（米）
 */
export const calculateDistance = (
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number => {
  const R = 6371000; // 地球半径（米）
  const lat1 = (point1.lat * Math.PI) / 180;
  const lat2 = (point2.lat * Math.PI) / 180;
  const deltaLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const deltaLng = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

