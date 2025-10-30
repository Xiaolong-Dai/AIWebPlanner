import { getSupabaseClient } from './supabase';

// 直接定义 User 类型，避免循环依赖
interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

/**
 * 用户注册
 */
export const signUp = async (email: string, password: string) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

/**
 * 用户登录
 */
export const signIn = async (email: string, password: string) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

/**
 * 用户登出
 */
export const signOut = async () => {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * 获取当前用户
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const supabase = getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    email: user.email || '',
    created_at: user.created_at,
    updated_at: user.updated_at || user.created_at,
  };
};

/**
 * 监听认证状态变化
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  const supabase = getSupabaseClient();
  const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const user: User = {
        id: session.user.id,
        email: session.user.email || '',
        created_at: session.user.created_at,
        updated_at: session.user.updated_at || session.user.created_at,
      };
      callback(user);
    } else {
      callback(null);
    }
  });

  return data.subscription;
};

