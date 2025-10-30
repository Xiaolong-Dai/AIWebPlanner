# 数据库设计文档

## 概述

本项目使用 Supabase PostgreSQL 数据库，采用关系型数据库设计。

## 数据表结构

### 1. users 表（由 Supabase Auth 自动管理）

Supabase Auth 自动创建和管理用户表，无需手动创建。

### 2. travel_plans 表 - 旅行计划

```sql
CREATE TABLE travel_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget DECIMAL(10, 2) NOT NULL,
  travelers INTEGER NOT NULL DEFAULT 1,
  preferences JSONB DEFAULT '[]',
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'completed', 'archived')),
  itinerary JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_travel_plans_user_id ON travel_plans(user_id);
CREATE INDEX idx_travel_plans_status ON travel_plans(status);
CREATE INDEX idx_travel_plans_start_date ON travel_plans(start_date);

-- RLS 策略
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plans"
  ON travel_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plans"
  ON travel_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
  ON travel_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans"
  ON travel_plans FOR DELETE
  USING (auth.uid() = user_id);
```

### 3. expenses 表 - 费用记录

```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES travel_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('transportation', 'accommodation', 'food', 'attraction', 'shopping', 'other')),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'CNY',
  description TEXT,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_expenses_plan_id ON expenses(plan_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_date ON expenses(expense_date);

-- RLS 策略
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);
```

### 4. user_preferences 表 - 用户偏好设置

```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'zh-CN',
  default_currency VARCHAR(3) DEFAULT 'CNY',
  notification_enabled BOOLEAN DEFAULT true,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- RLS 策略
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);
```

## 触发器

### 自动更新 updated_at 字段

```sql
-- 创建更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 travel_plans 表添加触发器
CREATE TRIGGER update_travel_plans_updated_at
  BEFORE UPDATE ON travel_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为 user_preferences 表添加触发器
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## JSONB 字段说明

### travel_plans.preferences (旅行偏好)

```json
[
  "美食",
  "购物",
  "文化",
  "自然风光",
  "亲子游"
]
```

### travel_plans.itinerary (行程安排)

```json
[
  {
    "day": 1,
    "date": "2024-12-20",
    "activities": [
      {
        "id": "act_1",
        "type": "attraction",
        "name": "东京塔",
        "address": "东京都港区芝公园4-2-8",
        "location": {
          "lat": 35.6586,
          "lng": 139.7454
        },
        "start_time": "09:00",
        "end_time": "11:00",
        "duration": 120,
        "ticket_price": 1200,
        "description": "东京地标性建筑"
      }
    ],
    "accommodation": {
      "name": "东京希尔顿酒店",
      "address": "东京都新宿区西新宿6-6-2",
      "location": {
        "lat": 35.6938,
        "lng": 139.6917
      },
      "price_per_night": 1500,
      "rating": 4.5
    },
    "transportation": [
      {
        "type": "flight",
        "from": "北京首都国际机场",
        "to": "东京成田国际机场",
        "departure_time": "08:00",
        "arrival_time": "12:00",
        "price": 3000,
        "duration": 240
      }
    ],
    "meals": [
      {
        "type": "lunch",
        "name": "一兰拉面",
        "address": "东京都新宿区歌舞伎町1-22-7",
        "cuisine": "日本料理",
        "price_per_person": 80
      }
    ]
  }
]
```

## 数据迁移

在 Supabase 控制台的 SQL Editor 中执行以上 SQL 语句即可创建所有表和策略。

## 注意事项

1. **Row Level Security (RLS)**: 所有表都启用了 RLS，确保用户只能访问自己的数据
2. **级联删除**: 删除用户时会自动删除相关的计划和费用记录
3. **JSONB 类型**: 使用 JSONB 存储复杂的嵌套数据，便于查询和更新
4. **时区**: 所有时间戳使用 `TIMESTAMP WITH TIME ZONE` 类型
5. **索引**: 为常用查询字段创建索引以提高性能

