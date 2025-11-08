import { message } from 'antd';

/**
 * 错误处理工具函数
 * 将技术性错误转换为用户友好的提示
 */

export interface ErrorInfo {
  title: string;
  description: string;
  action?: string;
}

/**
 * 解析错误并返回友好的错误信息
 */
export const parseError = (error: any): ErrorInfo => {
  // 网络超时错误
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return {
      title: '⏱️ 请求超时',
      description: '网络连接较慢，请检查网络后重试',
      action: 'retry',
    };
  }

  // 认证错误
  if (error.response?.status === 401 || error.code === 'PGRST301') {
    return {
      title: '🔐 认证失败',
      description: '登录已过期，请重新登录',
      action: 'login',
    };
  }

  // 权限错误
  if (error.response?.status === 403) {
    return {
      title: '🚫 权限不足',
      description: '您没有权限执行此操作',
      action: 'none',
    };
  }

  // 资源不存在
  if (error.response?.status === 404 || error.code === 'PGRST116') {
    return {
      title: '❓ 资源不存在',
      description: '请求的资源未找到',
      action: 'refresh',
    };
  }

  // 服务器错误
  if (error.response?.status >= 500) {
    return {
      title: '🔧 服务器错误',
      description: '服务器暂时无法处理请求，请稍后重试',
      action: 'retry',
    };
  }

  // 网络错误
  if (error.message?.includes('Network Error') || !navigator.onLine) {
    return {
      title: '📡 网络错误',
      description: '无法连接到服务器，请检查网络连接',
      action: 'retry',
    };
  }

  // Supabase 特定错误
  if (error.code) {
    switch (error.code) {
      case '23505': // 唯一约束冲突
        return {
          title: '⚠️ 数据冲突',
          description: '该记录已存在',
          action: 'none',
        };
      case '23503': // 外键约束冲突
        return {
          title: '⚠️ 关联数据错误',
          description: '相关数据不存在或已被删除',
          action: 'refresh',
        };
      case '42501': // 权限不足
        return {
          title: '🚫 权限不足',
          description: '您没有权限执行此操作',
          action: 'none',
        };
      default:
        break;
    }
  }

  // 默认错误
  return {
    title: '❌ 操作失败',
    description: error.message || '发生未知错误，请重试',
    action: 'retry',
  };
};

/**
 * 显示友好的错误消息
 */
export const showErrorMessage = (error: any, duration: number = 5) => {
  const errorInfo = parseError(error);

  message.error({
    content: (
      <div>
        <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{errorInfo.title}</div>
        <div>{errorInfo.description}</div>
        {errorInfo.action === 'retry' && (
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
            💡 提示：请稍后重试
          </div>
        )}
        {errorInfo.action === 'login' && (
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
            💡 提示：请重新登录
          </div>
        )}
        {errorInfo.action === 'refresh' && (
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
            💡 提示：请刷新页面
          </div>
        )}
      </div>
    ),
    duration,
  });
};

/**
 * 显示成功消息
 */
export const showSuccessMessage = (title: string, description?: string, duration: number = 3) => {
  message.success({
    content: (
      <div>
        <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{title}</div>
        {description && <div>{description}</div>}
      </div>
    ),
    duration,
  });
};

/**
 * 显示警告消息
 */
export const showWarningMessage = (title: string, description?: string, duration: number = 4) => {
  message.warning({
    content: (
      <div>
        <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{title}</div>
        {description && <div>{description}</div>}
      </div>
    ),
    duration,
  });
};

/**
 * 显示信息消息
 */
export const showInfoMessage = (title: string, description?: string, duration: number = 3) => {
  message.info({
    content: (
      <div>
        <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{title}</div>
        {description && <div>{description}</div>}
      </div>
    ),
    duration,
  });
};

