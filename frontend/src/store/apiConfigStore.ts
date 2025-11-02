import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../constants';

// 直接定义 ApiKeyConfig 类型，避免循环依赖
interface ApiKeyConfig {
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

interface ApiConfigState {
  config: ApiKeyConfig;
  setConfig: (config: Partial<ApiKeyConfig>) => void;
  clearConfig: () => void;
  isConfigured: () => boolean;
}

const defaultConfig: ApiKeyConfig = {
  supabase_url: import.meta.env.VITE_SUPABASE_URL || '',
  supabase_key: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  xfei_app_id: import.meta.env.VITE_XFEI_APP_ID || '',
  xfei_api_key: import.meta.env.VITE_XFEI_API_KEY || '',
  xfei_api_secret: import.meta.env.VITE_XFEI_API_SECRET || '',
  amap_key: import.meta.env.VITE_AMAP_KEY || '',
  amap_secret: import.meta.env.VITE_AMAP_SECRET || '',
  llm_api_key: import.meta.env.VITE_ALIYUN_LLM_API_KEY || '',
  llm_endpoint: import.meta.env.VITE_ALIYUN_LLM_ENDPOINT || '',
};

export const useApiConfigStore = create<ApiConfigState>()(
  persist(
    (set, get) => ({
      config: defaultConfig,
      setConfig: (newConfig) =>
        set((state) => ({
          config: { ...state.config, ...newConfig },
        })),
      clearConfig: () => set({ config: defaultConfig }),
      isConfigured: () => {
        const { config } = get();
        return !!(
          config.supabase_url &&
          config.supabase_key &&
          config.amap_key &&
          config.llm_api_key
        );
      },
    }),
    {
      name: STORAGE_KEYS.API_CONFIG,
      // 合并策略：localStorage 中的值优先，但如果为空则使用环境变量
      merge: (persistedState: any, currentState: ApiConfigState) => {
        const merged = { ...currentState };
        if (persistedState && persistedState.config) {
          // 对每个配置项，如果 localStorage 中有值则使用，否则使用环境变量
          merged.config = {
            supabase_url: persistedState.config.supabase_url || defaultConfig.supabase_url,
            supabase_key: persistedState.config.supabase_key || defaultConfig.supabase_key,
            xfei_app_id: persistedState.config.xfei_app_id || defaultConfig.xfei_app_id,
            xfei_api_key: persistedState.config.xfei_api_key || defaultConfig.xfei_api_key,
            xfei_api_secret: persistedState.config.xfei_api_secret || defaultConfig.xfei_api_secret,
            amap_key: persistedState.config.amap_key || defaultConfig.amap_key,
            amap_secret: persistedState.config.amap_secret || defaultConfig.amap_secret,
            llm_api_key: persistedState.config.llm_api_key || defaultConfig.llm_api_key,
            llm_endpoint: persistedState.config.llm_endpoint || defaultConfig.llm_endpoint,
          };
        }
        return merged;
      },
    }
  )
);

