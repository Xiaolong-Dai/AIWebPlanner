import { useState } from 'react';
import { Card, Descriptions, Button, Space, Tag } from 'antd';
import { BugOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useApiConfigStore } from '../store/apiConfigStore';

const DebugPanel = () => {
  const [visible, setVisible] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const { config, isConfigured } = useApiConfigStore();

  if (!visible) {
    return (
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
        <Button
          type="primary"
          icon={<BugOutlined />}
          onClick={() => setVisible(true)}
          size="large"
        >
          调试面板
        </Button>
      </div>
    );
  }

  const maskKey = (key?: string) => {
    if (!key) return '未配置';
    if (!showKeys) {
      return key.substring(0, 8) + '***';
    }
    return key;
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
        width: 500,
        maxHeight: '80vh',
        overflow: 'auto',
      }}
    >
      <Card
        title={
          <Space>
            <BugOutlined />
            调试信息
            <Tag color={isConfigured() ? 'success' : 'error'}>
              {isConfigured() ? '已配置' : '未配置'}
            </Tag>
          </Space>
        }
        extra={
          <Space>
            <Button
              size="small"
              icon={showKeys ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => setShowKeys(!showKeys)}
            >
              {showKeys ? '隐藏' : '显示'}密钥
            </Button>
            <Button size="small" onClick={() => setVisible(false)}>
              关闭
            </Button>
          </Space>
        }
        size="small"
      >
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label="Supabase URL">
            {config.supabase_url || '未配置'}
          </Descriptions.Item>
          <Descriptions.Item label="Supabase Key">
            {maskKey(config.supabase_key)}
          </Descriptions.Item>
          <Descriptions.Item label="LLM API Key">
            {maskKey(config.llm_api_key)}
          </Descriptions.Item>
          <Descriptions.Item label="LLM Endpoint">
            {config.llm_endpoint || '未配置'}
          </Descriptions.Item>
          <Descriptions.Item label="高德地图 Key">
            {maskKey(config.amap_key)}
          </Descriptions.Item>
          <Descriptions.Item label="科大讯飞 App ID">
            {maskKey(config.xfei_app_id)}
          </Descriptions.Item>
          <Descriptions.Item label="科大讯飞 API Key">
            {maskKey(config.xfei_api_key)}
          </Descriptions.Item>
          <Descriptions.Item label="科大讯飞 API Secret">
            {maskKey(config.xfei_api_secret)}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 16 }}>
          <Button
            type="primary"
            block
            onClick={() => {
              console.log('当前配置:', config);
              console.log('是否已配置:', isConfigured());
              console.log('LocalStorage:', localStorage.getItem('api-config'));
            }}
          >
            打印配置到控制台
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DebugPanel;

