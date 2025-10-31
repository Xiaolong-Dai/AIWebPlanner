/**
 * 交通枢纽坐标映射表
 * 包含常见机场、火车站的精确坐标
 */

export interface TransportHub {
  name: string;
  coordinates: [number, number]; // [经度, 纬度]
  city: string;
  type: 'airport' | 'train_station';
  aliases: string[]; // 别名,用于模糊匹配
}

// 中国主要机场坐标
export const AIRPORTS: TransportHub[] = [
  // 北京
  {
    name: '北京首都国际机场',
    coordinates: [116.584556, 40.080111],
    city: '北京',
    type: 'airport',
    aliases: ['首都机场', '北京机场', 'PEK', 'Beijing Capital Airport'],
  },
  {
    name: '北京大兴国际机场',
    coordinates: [116.410556, 39.509167],
    city: '北京',
    type: 'airport',
    aliases: ['大兴机场', 'PKX', 'Beijing Daxing Airport'],
  },
  // 上海
  {
    name: '上海浦东国际机场',
    coordinates: [121.805214, 31.143378],
    city: '上海',
    type: 'airport',
    aliases: ['浦东机场', 'PVG', 'Shanghai Pudong Airport'],
  },
  {
    name: '上海虹桥国际机场',
    coordinates: [121.336319, 31.197875],
    city: '上海',
    type: 'airport',
    aliases: ['虹桥机场', 'SHA', 'Shanghai Hongqiao Airport'],
  },
  // 广州
  {
    name: '广州白云国际机场',
    coordinates: [113.298786, 23.392436],
    city: '广州',
    type: 'airport',
    aliases: ['白云机场', '广州机场', 'CAN', 'Guangzhou Baiyun Airport'],
  },
  // 深圳
  {
    name: '深圳宝安国际机场',
    coordinates: [113.810833, 22.639444],
    city: '深圳',
    type: 'airport',
    aliases: ['宝安机场', '深圳机场', 'SZX', 'Shenzhen Baoan Airport'],
  },
  // 成都
  {
    name: '成都双流国际机场',
    coordinates: [103.947086, 30.578528],
    city: '成都',
    type: 'airport',
    aliases: ['双流机场', '成都机场', 'CTU', 'Chengdu Shuangliu Airport'],
  },
  {
    name: '成都天府国际机场',
    coordinates: [104.445556, 30.308611],
    city: '成都',
    type: 'airport',
    aliases: ['天府机场', 'TFU', 'Chengdu Tianfu Airport'],
  },
  // 杭州
  {
    name: '杭州萧山国际机场',
    coordinates: [120.434453, 30.229503],
    city: '杭州',
    type: 'airport',
    aliases: ['萧山机场', '杭州机场', 'HGH', 'Hangzhou Xiaoshan Airport'],
  },
  // 西安
  {
    name: '西安咸阳国际机场',
    coordinates: [108.751592, 34.447119],
    city: '西安',
    type: 'airport',
    aliases: ['咸阳机场', '西安机场', 'XIY', 'Xi\'an Xianyang Airport'],
  },
  // 重庆
  {
    name: '重庆江北国际机场',
    coordinates: [106.641678, 29.719217],
    city: '重庆',
    type: 'airport',
    aliases: ['江北机场', '重庆机场', 'CKG', 'Chongqing Jiangbei Airport'],
  },
  // 南京
  {
    name: '南京禄口国际机场',
    coordinates: [118.862025, 31.742042],
    city: '南京',
    type: 'airport',
    aliases: ['禄口机场', '南京机场', 'NKG', 'Nanjing Lukou Airport'],
  },
  // 武汉
  {
    name: '武汉天河国际机场',
    coordinates: [114.208333, 30.783611],
    city: '武汉',
    type: 'airport',
    aliases: ['天河机场', '武汉机场', 'WUH', 'Wuhan Tianhe Airport'],
  },
  // 厦门
  {
    name: '厦门高崎国际机场',
    coordinates: [118.127739, 24.544036],
    city: '厦门',
    type: 'airport',
    aliases: ['高崎机场', '厦门机场', 'XMN', 'Xiamen Gaoqi Airport'],
  },
  // 青岛
  {
    name: '青岛胶东国际机场',
    coordinates: [120.374722, 36.266389],
    city: '青岛',
    type: 'airport',
    aliases: ['胶东机场', '青岛机场', 'TAO', 'Qingdao Jiaodong Airport'],
  },
  // 昆明
  {
    name: '昆明长水国际机场',
    coordinates: [102.929167, 25.101944],
    city: '昆明',
    type: 'airport',
    aliases: ['长水机场', '昆明机场', 'KMG', 'Kunming Changshui Airport'],
  },
  // 海口
  {
    name: '海口美兰国际机场',
    coordinates: [110.458961, 19.934856],
    city: '海口',
    type: 'airport',
    aliases: ['美兰机场', '海口机场', 'HAK', 'Haikou Meilan Airport'],
  },
  // 三亚
  {
    name: '三亚凤凰国际机场',
    coordinates: [109.412272, 18.302897],
    city: '三亚',
    type: 'airport',
    aliases: ['凤凰机场', '三亚机场', 'SYX', 'Sanya Phoenix Airport'],
  },
];

// 日本主要机场
export const JAPAN_AIRPORTS: TransportHub[] = [
  {
    name: '东京成田国际机场',
    coordinates: [140.386389, 35.764722],
    city: '东京',
    type: 'airport',
    aliases: ['成田机场', 'NRT', 'Narita Airport', '成田空港'],
  },
  {
    name: '东京羽田机场',
    coordinates: [139.781111, 35.553333],
    city: '东京',
    type: 'airport',
    aliases: ['羽田机场', 'HND', 'Haneda Airport', '羽田空港'],
  },
  {
    name: '大阪关西国际机场',
    coordinates: [135.244167, 34.434722],
    city: '大阪',
    type: 'airport',
    aliases: ['关西机场', 'KIX', 'Kansai Airport', '関西空港'],
  },
  {
    name: '名古屋中部国际机场',
    coordinates: [136.805278, 34.858333],
    city: '名古屋',
    type: 'airport',
    aliases: ['中部机场', 'NGO', 'Chubu Airport', '中部国際空港'],
  },
  {
    name: '福冈机场',
    coordinates: [130.450833, 33.585833],
    city: '福冈',
    type: 'airport',
    aliases: ['FUK', 'Fukuoka Airport', '福岡空港'],
  },
  {
    name: '札幌新千岁机场',
    coordinates: [141.692222, 42.775],
    city: '札幌',
    type: 'airport',
    aliases: ['新千岁机场', 'CTS', 'New Chitose Airport', '新千歳空港'],
  },
];

// 中国主要火车站坐标
export const TRAIN_STATIONS: TransportHub[] = [
  // 北京
  {
    name: '北京站',
    coordinates: [116.427188, 39.902486],
    city: '北京',
    type: 'train_station',
    aliases: ['Beijing Railway Station'],
  },
  {
    name: '北京西站',
    coordinates: [116.322056, 39.893611],
    city: '北京',
    type: 'train_station',
    aliases: ['北京西', 'Beijing West Railway Station'],
  },
  {
    name: '北京南站',
    coordinates: [116.378889, 39.865],
    city: '北京',
    type: 'train_station',
    aliases: ['北京南', 'Beijing South Railway Station'],
  },
  // 上海
  {
    name: '上海站',
    coordinates: [121.455472, 31.249722],
    city: '上海',
    type: 'train_station',
    aliases: ['上海火车站', 'Shanghai Railway Station'],
  },
  {
    name: '上海虹桥站',
    coordinates: [121.320278, 31.194167],
    city: '上海',
    type: 'train_station',
    aliases: ['虹桥站', 'Shanghai Hongqiao Railway Station'],
  },
  {
    name: '上海南站',
    coordinates: [121.432778, 31.154167],
    city: '上海',
    type: 'train_station',
    aliases: ['上海南', 'Shanghai South Railway Station'],
  },
  // 广州
  {
    name: '广州站',
    coordinates: [113.256667, 23.148889],
    city: '广州',
    type: 'train_station',
    aliases: ['广州火车站', 'Guangzhou Railway Station'],
  },
  {
    name: '广州南站',
    coordinates: [113.272222, 23.003889],
    city: '广州',
    type: 'train_station',
    aliases: ['广州南', 'Guangzhou South Railway Station'],
  },
  {
    name: '广州东站',
    coordinates: [113.330556, 23.155556],
    city: '广州',
    type: 'train_station',
    aliases: ['广州东', 'Guangzhou East Railway Station'],
  },
  // 深圳
  {
    name: '深圳站',
    coordinates: [114.116667, 22.533333],
    city: '深圳',
    type: 'train_station',
    aliases: ['深圳火车站', 'Shenzhen Railway Station'],
  },
  {
    name: '深圳北站',
    coordinates: [114.030278, 22.608889],
    city: '深圳',
    type: 'train_station',
    aliases: ['深圳北', 'Shenzhen North Railway Station'],
  },
  // 杭州
  {
    name: '杭州站',
    coordinates: [120.185278, 30.242778],
    city: '杭州',
    type: 'train_station',
    aliases: ['杭州火车站', 'Hangzhou Railway Station'],
  },
  {
    name: '杭州东站',
    coordinates: [120.213056, 30.290556],
    city: '杭州',
    type: 'train_station',
    aliases: ['杭州东', 'Hangzhou East Railway Station'],
  },
];

// 合并所有交通枢纽
export const ALL_TRANSPORT_HUBS: TransportHub[] = [
  ...AIRPORTS,
  ...JAPAN_AIRPORTS,
  ...TRAIN_STATIONS,
];

/**
 * 根据名称查找交通枢纽坐标
 * @param name 机场或车站名称
 * @returns 坐标 [经度, 纬度] 或 null
 */
export function findTransportCoordinates(name: string): [number, number] | null {
  if (!name) return null;

  const normalizedName = name.trim().toLowerCase();

  // 精确匹配
  const exactMatch = ALL_TRANSPORT_HUBS.find(
    (hub) => hub.name.toLowerCase() === normalizedName
  );
  if (exactMatch) return exactMatch.coordinates;

  // 别名匹配
  const aliasMatch = ALL_TRANSPORT_HUBS.find((hub) =>
    hub.aliases.some((alias) => alias.toLowerCase() === normalizedName)
  );
  if (aliasMatch) return aliasMatch.coordinates;

  // 模糊匹配(包含关系)
  const fuzzyMatch = ALL_TRANSPORT_HUBS.find(
    (hub) =>
      hub.name.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(hub.name.toLowerCase()) ||
      hub.aliases.some(
        (alias) =>
          alias.toLowerCase().includes(normalizedName) ||
          normalizedName.includes(alias.toLowerCase())
      )
  );
  if (fuzzyMatch) return fuzzyMatch.coordinates;

  console.warn(`⚠️ 未找到交通枢纽坐标: ${name}`);
  return null;
}

/**
 * 获取交通枢纽信息
 * @param name 机场或车站名称
 * @returns 交通枢纽信息或 null
 */
export function getTransportHub(name: string): TransportHub | null {
  if (!name) return null;

  const normalizedName = name.trim().toLowerCase();

  // 精确匹配
  const exactMatch = ALL_TRANSPORT_HUBS.find(
    (hub) => hub.name.toLowerCase() === normalizedName
  );
  if (exactMatch) return exactMatch;

  // 别名匹配
  const aliasMatch = ALL_TRANSPORT_HUBS.find((hub) =>
    hub.aliases.some((alias) => alias.toLowerCase() === normalizedName)
  );
  if (aliasMatch) return aliasMatch;

  // 模糊匹配
  const fuzzyMatch = ALL_TRANSPORT_HUBS.find(
    (hub) =>
      hub.name.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(hub.name.toLowerCase()) ||
      hub.aliases.some(
        (alias) =>
          alias.toLowerCase().includes(normalizedName) ||
          normalizedName.includes(alias.toLowerCase())
      )
  );
  if (fuzzyMatch) return fuzzyMatch;

  return null;
}

