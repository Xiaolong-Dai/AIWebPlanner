import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useApiConfigStore } from '../store/apiConfigStore';

let supabaseInstance: SupabaseClient | null = null;
let currentUrl: string | null = null;
let currentKey: string | null = null;

/**
 * 获取 Supabase 客户端实例
 * 优先使用用户配置的 API Key，其次使用环境变量
 */
export const getSupabaseClient = (): SupabaseClient => {
  const { config } = useApiConfigStore.getState();

  const supabaseUrl = config.supabase_url || import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = config.supabase_key || import.meta.env.VITE_SUPABASE_ANON_KEY;

  // 仅在开发环境输出配置检查信息（不包含敏感信息）
  if (import.meta.env.DEV) {
    console.log('🔧 Supabase 配置检查:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlSource: config.supabase_url ? '用户配置' : '环境变量',
      keySource: config.supabase_key ? '用户配置' : '环境变量',
    });
  }

  // 检查是否为占位符
  const isPlaceholder =
    !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl.includes('your_') ||
    supabaseKey.includes('your_');

  if (isPlaceholder) {
    console.error('❌ Supabase 未配置或配置无效');
    throw new Error('Supabase URL 和 Key 未配置，请在设置页面配置或检查环境变量');
  }

  // 如果配置改变，重新创建实例
  if (!supabaseInstance || currentUrl !== supabaseUrl || currentKey !== supabaseKey) {
    if (import.meta.env.DEV) {
      console.log('✅ 创建新的 Supabase 客户端实例');
    }
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      currentUrl = supabaseUrl;
      currentKey = supabaseKey;
      if (import.meta.env.DEV) {
        console.log('✅ Supabase 客户端创建成功');
      }
    } catch (error) {
      console.error('❌ Supabase 客户端创建失败');
      throw new Error('Supabase 客户端创建失败，请检查配置是否正确');
    }
  }

  return supabaseInstance;
};

/**
 * 重置 Supabase 客户端（当配置更新时调用）
 */
export const resetSupabaseClient = () => {
  supabaseInstance = null;
};

