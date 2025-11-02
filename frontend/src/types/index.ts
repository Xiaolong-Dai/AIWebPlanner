// 用户类型
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// 旅行计划类型
export interface TravelPlan {
  id: string;
  user_id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  travelers: number;
  preferences: string[];
  status: 'draft' | 'confirmed' | 'completed' | 'archived';
  itinerary: DayItinerary[];
  created_at: string;
  updated_at: string;
}

// 每日行程类型
export interface DayItinerary {
  day: number;
  date?: string;
  theme?: string;
  summary?: string;
  activities: Activity[];
  accommodation?: Accommodation;
  transportation?: Transportation[];
  meals?: Meal[];
  notes?: string;
}

// 活动类型
export interface Activity {
  id?: string;
  type: 'attraction' | 'restaurant' | 'shopping' | 'transport' | 'entertainment' | 'other';
  name: string;
  time?: string;
  location?: string;
  coordinates?: [number, number]; // [lng, lat]
  address?: string;
  start_time?: string;
  end_time?: string;
  duration?: string;
  cost?: number;
  ticket_price?: number;
  description?: string;
  opening_hours?: string;
  tips?: string;
}

// 住宿类型
export interface Accommodation {
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  price_per_night: number;
  price?: number; // 总价
  rating?: number;
  check_in?: string;
  check_out?: string;
}

// 交通类型
export interface Transportation {
  type: 'flight' | 'train' | 'bus' | 'taxi' | 'subway' | 'walk';
  from: string;
  to: string;
  from_coordinates?: [number, number]; // 出发地坐标 [经度, 纬度]
  to_coordinates?: [number, number]; // 目的地坐标 [经度, 纬度]
  departure_time?: string;
  arrival_time?: string;
  price?: number;
  duration?: string; // 时长描述,如"2小时30分钟"
  flight_number?: string; // 航班号
  train_number?: string; // 车次号
  notes?: string; // 注意事项
  details?: string;
}

// 餐饮类型
export interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  restaurant?: string; // 餐厅名称
  address: string;
  location?: {
    lat: number;
    lng: number;
  };
  cuisine: string;
  price_per_person?: number;
  price?: number; // 总价
  rating?: number;
}

// 费用记录类型
export interface Expense {
  id: string;
  plan_id: string;
  user_id: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  description: string;
  date: string;
  notes?: string;
  created_at: string;
}

// 费用类别
export type ExpenseCategory =
  | 'transportation'
  | 'accommodation'
  | 'food'
  | 'attraction'
  | 'shopping'
  | 'other';

// 预算分析类型
export interface BudgetAnalysis {
  total_budget: number;
  totalSpent: number;
  remaining: number;
  percentage: number;
  categories: {
    category: ExpenseCategory;
    allocated: number;
    spent: number;
    percentage: number;
  }[];
}

// API Key 配置类型
export interface ApiKeyConfig {
  supabase_url?: string;
  supabase_key?: string;
  xfei_app_id?: string;
  xfei_api_key?: string;
  xfei_api_secret?: string;
  amap_key?: string;
  amap_secret?: string;
  llm_api_key?: string;
  llm_endpoint?: string;
}

// AI 对话消息类型
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

// 语音识别结果类型
export interface SpeechRecognitionResult {
  text: string;
  confidence: number;
  is_final: boolean;
}
