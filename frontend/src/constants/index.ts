// 应用常量
export const APP_NAME = 'AI Web Planner';
export const APP_VERSION = '1.0.0';

// 路由路径
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PLAN_CREATE: '/plan/create',
  PLAN_DETAIL: '/plan/:id',
  PLAN_EDIT: '/plan/:id/edit',
  BUDGET: '/budget',
  MY_PLANS: '/my-plans',
  SETTINGS: '/settings',
  SERVICE_TEST: '/service-test',
} as const;

// 费用类别
export const EXPENSE_CATEGORIES = {
  transportation: '交通',
  accommodation: '住宿',
  food: '餐饮',
  attraction: '景点',
  shopping: '购物',
  other: '其他',
} as const;

// 费用类别颜色
export const EXPENSE_CATEGORY_COLORS = {
  transportation: '#1890ff',
  accommodation: '#52c41a',
  food: '#faad14',
  attraction: '#eb2f96',
  shopping: '#722ed1',
  other: '#8c8c8c',
} as const;

// 旅行计划状态
export const PLAN_STATUS = {
  draft: '草稿',
  confirmed: '已确认',
  completed: '已完成',
  archived: '已归档',
} as const;

// 活动类型
export const ACTIVITY_TYPES = {
  attraction: '景点',
  shopping: '购物',
  entertainment: '娱乐',
  other: '其他',
} as const;

// 交通方式
export const TRANSPORTATION_TYPES = {
  flight: '飞机',
  train: '火车',
  bus: '公交',
  taxi: '出租车',
  subway: '地铁',
  walk: '步行',
} as const;

// 餐饮类型
export const MEAL_TYPES = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '小吃',
} as const;

// LocalStorage Keys
export const STORAGE_KEYS = {
  API_CONFIG: 'ai_planner_api_config',
  USER_PREFERENCES: 'ai_planner_user_preferences',
  THEME: 'ai_planner_theme',
} as const;

// 默认预算分配比例
export const DEFAULT_BUDGET_ALLOCATION = {
  transportation: 0.3,
  accommodation: 0.25,
  food: 0.2,
  attraction: 0.15,
  shopping: 0.05,
  other: 0.05,
} as const;

// API 端点
export const API_ENDPOINTS = {
  // Supabase 会自动处理这些
  AUTH_LOGIN: '/auth/v1/token?grant_type=password',
  AUTH_SIGNUP: '/auth/v1/signup',
  AUTH_LOGOUT: '/auth/v1/logout',
} as const;

// 地图配置
export const MAP_CONFIG = {
  DEFAULT_CENTER: [116.397428, 39.90923], // 北京天安门
  DEFAULT_ZOOM: 12,
  MIN_ZOOM: 3,
  MAX_ZOOM: 18,
} as const;

// 语音识别配置
export const SPEECH_CONFIG = {
  LANGUAGE: 'zh_cn',
  ACCENT: 'mandarin',
  MAX_DURATION: 60000, // 60秒
} as const;

// AI 提示词模板
export const AI_PROMPTS = {
  PLAN_GENERATION: `你是一个专业的旅行规划助手。请根据用户的需求生成详细的旅行计划。
要求：
1. 返回 JSON 格式的数据
2. 包含每日详细行程
3. 包含交通、住宿、餐饮、景点推荐
4. 考虑时间安排的合理性
5. 提供预算建议

用户需求：`,

  BUDGET_ANALYSIS: `请分析以下旅行计划的预算分配，给出合理的建议。
要求：
1. 返回 JSON 格式
2. 按类别分配预算
3. 给出每个类别的建议金额和占比
4. 考虑目的地的消费水平

计划信息：`,
} as const;

