-- ============================================
-- AI Web Planner - 数据库初始化脚本
-- ============================================
-- 
-- 使用说明：
-- 1. 登录 Supabase Dashboard
-- 2. 进入 SQL Editor
-- 3. 复制并执行此脚本
--
-- ============================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. 旅行计划表 (travel_plans)
-- ============================================

CREATE TABLE IF NOT EXISTS travel_plans (
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_travel_plans_user_id ON travel_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_plans_status ON travel_plans(status);
CREATE INDEX IF NOT EXISTS idx_travel_plans_start_date ON travel_plans(start_date);

-- 添加注释
COMMENT ON TABLE travel_plans IS '旅行计划表';
COMMENT ON COLUMN travel_plans.id IS '计划唯一标识';
COMMENT ON COLUMN travel_plans.user_id IS '用户ID';
COMMENT ON COLUMN travel_plans.name IS '计划名称';
COMMENT ON COLUMN travel_plans.destination IS '目的地';
COMMENT ON COLUMN travel_plans.start_date IS '开始日期';
COMMENT ON COLUMN travel_plans.end_date IS '结束日期';
COMMENT ON COLUMN travel_plans.budget IS '总预算';
COMMENT ON COLUMN travel_plans.travelers IS '同行人数';
COMMENT ON COLUMN travel_plans.preferences IS '旅行偏好（JSON数组）';
COMMENT ON COLUMN travel_plans.status IS '计划状态：draft-草稿, confirmed-已确认, completed-已完成, archived-已归档';
COMMENT ON COLUMN travel_plans.itinerary IS '行程详情（JSON数组）';

-- ============================================
-- 2. 费用记录表 (expenses)
-- ============================================

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES travel_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('transportation', 'accommodation', 'food', 'attraction', 'shopping', 'other')),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'CNY',
  description TEXT,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_expenses_plan_id ON expenses(plan_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- 添加注释
COMMENT ON TABLE expenses IS '费用记录表';
COMMENT ON COLUMN expenses.id IS '费用记录唯一标识';
COMMENT ON COLUMN expenses.plan_id IS '关联的旅行计划ID';
COMMENT ON COLUMN expenses.user_id IS '用户ID';
COMMENT ON COLUMN expenses.category IS '费用类别：transportation-交通, accommodation-住宿, food-餐饮, attraction-景点, shopping-购物, other-其他';
COMMENT ON COLUMN expenses.amount IS '金额';
COMMENT ON COLUMN expenses.currency IS '货币类型';
COMMENT ON COLUMN expenses.description IS '费用描述';
COMMENT ON COLUMN expenses.date IS '费用发生日期';

-- ============================================
-- 3. 用户偏好表 (user_preferences)
-- ============================================

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  default_currency VARCHAR(10) DEFAULT 'CNY',
  default_travelers INTEGER DEFAULT 1,
  favorite_destinations JSONB DEFAULT '[]',
  travel_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- 添加注释
COMMENT ON TABLE user_preferences IS '用户偏好设置表';
COMMENT ON COLUMN user_preferences.user_id IS '用户ID';
COMMENT ON COLUMN user_preferences.default_currency IS '默认货币';
COMMENT ON COLUMN user_preferences.default_travelers IS '默认同行人数';
COMMENT ON COLUMN user_preferences.favorite_destinations IS '收藏的目的地（JSON数组）';
COMMENT ON COLUMN user_preferences.travel_preferences IS '旅行偏好（JSON对象）';

-- ============================================
-- 4. 触发器：自动更新 updated_at
-- ============================================

-- 创建更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 travel_plans 表添加触发器
DROP TRIGGER IF EXISTS update_travel_plans_updated_at ON travel_plans;
CREATE TRIGGER update_travel_plans_updated_at
  BEFORE UPDATE ON travel_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为 user_preferences 表添加触发器
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. Row Level Security (RLS) 策略
-- ============================================

-- 启用 RLS
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- travel_plans 表的 RLS 策略
DROP POLICY IF EXISTS "Users can view their own travel plans" ON travel_plans;
CREATE POLICY "Users can view their own travel plans"
  ON travel_plans FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own travel plans" ON travel_plans;
CREATE POLICY "Users can insert their own travel plans"
  ON travel_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own travel plans" ON travel_plans;
CREATE POLICY "Users can update their own travel plans"
  ON travel_plans FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own travel plans" ON travel_plans;
CREATE POLICY "Users can delete their own travel plans"
  ON travel_plans FOR DELETE
  USING (auth.uid() = user_id);

-- expenses 表的 RLS 策略
DROP POLICY IF EXISTS "Users can view their own expenses" ON expenses;
CREATE POLICY "Users can view their own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own expenses" ON expenses;
CREATE POLICY "Users can insert their own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own expenses" ON expenses;
CREATE POLICY "Users can update their own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own expenses" ON expenses;
CREATE POLICY "Users can delete their own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);

-- user_preferences 表的 RLS 策略
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own preferences" ON user_preferences;
CREATE POLICY "Users can delete their own preferences"
  ON user_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. 示例数据（可选）
-- ============================================

-- 注意：以下示例数据仅用于测试，生产环境请删除

-- 插入示例旅行计划（需要替换 user_id 为实际用户ID）
-- INSERT INTO travel_plans (user_id, name, destination, start_date, end_date, budget, travelers, preferences, status)
-- VALUES (
--   'your-user-id-here',
--   '日本东京5日游',
--   '日本东京',
--   '2024-06-01',
--   '2024-06-05',
--   10000.00,
--   2,
--   '["美食", "动漫", "购物"]'::jsonb,
--   'draft'
-- );

-- ============================================
-- 完成！
-- ============================================

-- 验证表是否创建成功
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('travel_plans', 'expenses', 'user_preferences')
ORDER BY table_name;

