import { getSupabaseClient } from './supabase';
import type { TravelPlan } from '../types/common';

/**
 * 旅行计划 CRUD 服务
 */

/**
 * 获取当前用户的所有旅行计划
 */
export const getPlans = async (): Promise<TravelPlan[]> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('travel_plans')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * 根据ID获取单个旅行计划
 */
export const getPlanById = async (id: string): Promise<TravelPlan | null> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('travel_plans')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // 未找到记录
      return null;
    }
    throw error;
  }
  return data;
};

/**
 * 创建新的旅行计划
 */
export const createPlan = async (
  plan: Omit<TravelPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<TravelPlan> => {
  console.log('📝 createPlan 开始执行...');
  console.log('计划数据:', plan);

  try {
    const supabase = getSupabaseClient();
    console.log('✅ Supabase 客户端获取成功');

    // 获取当前用户ID
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error('❌ 获取用户信息失败:', authError);
      throw new Error(`获取用户信息失败: ${authError.message}`);
    }

    if (!user) {
      console.error('❌ 用户未登录');
      throw new Error('用户未登录，请先登录后再保存行程');
    }

    console.log('✅ 用户已登录:', user.id);

    const planToInsert = {
      ...plan,
      user_id: user.id,
    };

    console.log('💾 准备插入数据库:', planToInsert);

    const { data, error } = await supabase
      .from('travel_plans')
      .insert([planToInsert])
      .select()
      .single();

    if (error) {
      console.error('❌ 数据库插入失败:', error);
      throw new Error(`保存行程失败: ${error.message}`);
    }

    console.log('✅ 行程保存成功:', data);
    return data;
  } catch (error: any) {
    console.error('❌ createPlan 执行失败:', error);
    throw error;
  }
};

/**
 * 更新旅行计划
 */
export const updatePlan = async (
  id: string,
  updates: Partial<Omit<TravelPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<TravelPlan> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('travel_plans')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * 删除旅行计划
 */
export const deletePlan = async (id: string): Promise<void> => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('travel_plans').delete().eq('id', id);

  if (error) throw error;
};

/**
 * 根据状态获取旅行计划
 */
export const getPlansByStatus = async (
  status: 'draft' | 'confirmed' | 'completed' | 'archived'
): Promise<TravelPlan[]> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('travel_plans')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * 获取最近的旅行计划（限制数量）
 */
export const getRecentPlans = async (limit: number = 5): Promise<TravelPlan[]> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('travel_plans')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

/**
 * 搜索旅行计划（按名称或目的地）
 */
export const searchPlans = async (keyword: string): Promise<TravelPlan[]> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('travel_plans')
    .select('*')
    .or(`name.ilike.%${keyword}%,destination.ilike.%${keyword}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * 获取旅行计划统计信息
 */
export const getPlanStats = async (): Promise<{
  total: number;
  draft: number;
  confirmed: number;
  completed: number;
  archived: number;
  totalBudget: number;
}> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('travel_plans').select('status, budget');

  if (error) throw error;

  const stats = {
    total: data?.length || 0,
    draft: 0,
    confirmed: 0,
    completed: 0,
    archived: 0,
    totalBudget: 0,
  };

  data?.forEach((plan) => {
    stats[plan.status as keyof typeof stats]++;
    stats.totalBudget += Number(plan.budget) || 0;
  });

  return stats;
};

/**
 * 复制旅行计划
 */
export const duplicatePlan = async (id: string): Promise<TravelPlan> => {
  const originalPlan = await getPlanById(id);
  if (!originalPlan) {
    throw new Error('原计划不存在');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, user_id: _user_id, created_at: _created_at, updated_at: _updated_at, ...planData } = originalPlan;

  return createPlan({
    ...planData,
    name: `${planData.name} (副本)`,
    status: 'draft',
  });
};

/**
 * 归档旅行计划
 */
export const archivePlan = async (id: string): Promise<TravelPlan> => {
  return updatePlan(id, { status: 'archived' });
};

/**
 * 订阅旅行计划变化（实时更新）
 */
export const subscribeToPlanChanges = (
  callback: (payload: { eventType: string; new: TravelPlan; old: TravelPlan }) => void
) => {
  const supabase = getSupabaseClient();
  
  const subscription = supabase
    .channel('travel_plans_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'travel_plans',
      },
      (payload: any) => {
        callback({
          eventType: payload.eventType,
          new: payload.new,
          old: payload.old,
        });
      }
    )
    .subscribe();

  return subscription;
};

