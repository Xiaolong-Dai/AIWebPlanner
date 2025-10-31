import { getSupabaseClient } from './supabase';
import type { Expense, ExpenseCategory, BudgetAnalysis } from '../types/common';

/**
 * 费用记录 CRUD 服务
 */

/**
 * 获取指定计划的所有费用记录
 */
export const getExpensesByPlanId = async (planId: string): Promise<Expense[]> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('plan_id', planId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * 获取当前用户的所有费用记录
 */
export const getAllExpenses = async (): Promise<Expense[]> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * 根据ID获取单个费用记录
 */
export const getExpenseById = async (id: string): Promise<Expense | null> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }
  return data;
};

/**
 * 创建新的费用记录
 */
export const createExpense = async (
  expense: Omit<Expense, 'id' | 'user_id' | 'created_at'>
): Promise<Expense> => {
  console.log('💾 createExpense 被调用，参数:', expense);

  const supabase = getSupabaseClient();

  // 获取当前用户ID
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('用户未登录');
  }

  console.log('👤 当前用户ID:', user.id);

  const expenseData = {
    ...expense,
    user_id: user.id,
  };

  console.log('📤 准备插入数据库:', expenseData);

  const { data, error } = await supabase
    .from('expenses')
    .insert([expenseData])
    .select()
    .single();

  if (error) {
    console.error('❌ 数据库插入失败:', error);
    throw error;
  }

  console.log('✅ 数据库插入成功，返回数据:', data);
  return data;
};

/**
 * 更新费用记录
 */
export const updateExpense = async (
  id: string,
  updates: Partial<Omit<Expense, 'id' | 'user_id' | 'created_at'>>
): Promise<Expense> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * 删除费用记录
 */
export const deleteExpense = async (id: string): Promise<void> => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('expenses').delete().eq('id', id);

  if (error) throw error;
};

/**
 * 批量删除费用记录
 */
export const deleteExpensesByPlanId = async (planId: string): Promise<void> => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('expenses').delete().eq('plan_id', planId);

  if (error) throw error;
};

/**
 * 根据类别获取费用记录
 */
export const getExpensesByCategory = async (
  planId: string,
  category: ExpenseCategory
): Promise<Expense[]> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('plan_id', planId)
    .eq('category', category)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * 获取指定日期范围的费用记录
 */
export const getExpensesByDateRange = async (
  planId: string,
  startDate: string,
  endDate: string
): Promise<Expense[]> => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('plan_id', planId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * 计算指定计划的总费用
 */
export const getTotalExpenses = async (planId: string): Promise<number> => {
  const expenses = await getExpensesByPlanId(planId);
  return expenses.reduce((total, expense) => total + Number(expense.amount), 0);
};

/**
 * 按类别统计费用
 */
export const getExpensesByCategories = async (
  planId: string
): Promise<Record<ExpenseCategory, number>> => {
  const expenses = await getExpensesByPlanId(planId);
  
  const categoryTotals: Record<ExpenseCategory, number> = {
    transportation: 0,
    accommodation: 0,
    food: 0,
    attraction: 0,
    shopping: 0,
    other: 0,
  };

  expenses.forEach((expense) => {
    categoryTotals[expense.category] += Number(expense.amount);
  });

  return categoryTotals;
};

/**
 * 获取预算分析
 */
export const getBudgetAnalysis = async (
  planId: string,
  totalBudget: number
): Promise<BudgetAnalysis> => {
  const expenses = await getExpensesByPlanId(planId);
  const categoryTotals = await getExpensesByCategories(planId);
  
  const totalSpent = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  
  const categories = Object.entries(categoryTotals).map(([category, spent]) => ({
    category: category as ExpenseCategory,
    allocated: 0, // 可以根据默认分配比例计算
    spent,
    percentage: totalBudget > 0 ? (spent / totalBudget) * 100 : 0,
  }));

  const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return {
    total_budget: totalBudget,
    totalSpent,
    remaining: totalBudget - totalSpent,
    percentage,
    categories,
  };
};

/**
 * 获取每日费用统计
 */
export const getDailyExpenses = async (
  planId: string
): Promise<{ date: string; total: number }[]> => {
  const expenses = await getExpensesByPlanId(planId);
  
  const dailyMap = new Map<string, number>();
  
  expenses.forEach((expense) => {
    const date = expense.date;
    const current = dailyMap.get(date) || 0;
    dailyMap.set(date, current + Number(expense.amount));
  });

  return Array.from(dailyMap.entries())
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * 订阅费用记录变化（实时更新）
 */
export const subscribeToExpenseChanges = (
  planId: string,
  callback: (payload: { eventType: string; new: Expense; old: Expense }) => void
) => {
  const supabase = getSupabaseClient();
  
  const subscription = supabase
    .channel(`expenses_changes_${planId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'expenses',
        filter: `plan_id=eq.${planId}`,
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

