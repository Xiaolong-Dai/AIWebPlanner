import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Tabs, Alert, Space, Divider, Tag, Typography } from 'antd';
import {
  KeyOutlined,
  SaveOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useApiConfigStore } from '../store/apiConfigStore';
import { resetSupabaseClient } from '../services/supabase';
import './Settings.css';

const { Paragraph, Text } = Typography;

const Settings = () => {
  const { config, setConfig, isConfigured } = useApiConfigStore();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 跟踪哪些字段正在编辑（显示输入框而不是掩码）
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({});

  // 测试状态
  const [testResults, setTestResults] = useState<Record<string, 'idle' | 'testing' | 'success' | 'error'>>({
    supabase: 'idle',
    llm: 'idle',
    map: 'idle',
  });
  const [testOutputs, setTestOutputs] = useState<Record<string, any>>({});

  // 密钥掩码函数 - 只显示前4位和后4位
  const maskKey = (key?: string) => {
    if (!key) return '';
    if (key.length <= 8) return '****';
    return `${key.substring(0, 4)}${'*'.repeat(Math.min(key.length - 8, 20))}${key.substring(key.length - 4)}`;
  };

  // 检查字段是否已配置
  const isFieldConfigured = (fieldName: string) => {
    const value = config[fieldName as keyof typeof config];
    return value && value.length > 0 && !value.includes('your_');
  };

  // 切换字段编辑状态
  const toggleFieldEdit = (fieldName: string) => {
    const isEnteringEditMode = !editingFields[fieldName];

    setEditingFields(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));

    // 进入编辑模式时，清空该字段的值（防止显示完整密钥）
    if (isEnteringEditMode) {
      form.setFieldValue(fieldName, '');
    }
  };

  // 当配置更新时，重置编辑状态
  useEffect(() => {
    setEditingFields({});
  }, [config]);

  const handleSave = async (values: Record<string, string>) => {
    setLoading(true);
    try {
      // 过滤掉空值，只保存非空字段（防止误删除原有配置）
      const filteredValues: Record<string, string> = {};
      Object.keys(values).forEach(key => {
        const value = values[key];
        // 只保存非空字符串
        if (value && value.trim() !== '') {
          filteredValues[key] = value.trim();
        }
      });

      // 合并到现有配置（保留未修改的字段）
      setConfig(filteredValues);

      // 重置 Supabase 客户端以使用新配置
      resetSupabaseClient();

      // 保存后重置编辑状态
      setEditingFields({});

      message.success({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>✅ 配置保存成功！</div>
            <div>API配置已更新并生效</div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              建议点击下方"测试连接"按钮验证配置是否正确
            </div>
          </div>
        ),
        duration: 5,
      });
    } catch (error) {
      console.error('保存配置失败');
      message.error({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>❌ 保存失败</div>
            <div>配置保存时发生错误</div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              请检查浏览器控制台获取详细错误信息
            </div>
          </div>
        ),
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  // 清除指定字段的配置
  const handleClearFields = (fields: string[], serviceName: string) => {
    if (import.meta.env.DEV) {
      console.log(`🗑️ 清除 ${serviceName} 配置`, fields);
    }

    // 构建要清空的字段对象
    const clearValues: Record<string, string> = {};
    fields.forEach(field => {
      clearValues[field] = '';
    });

    // 更新配置（只清空指定字段）
    setConfig(clearValues);

    // 清空表单中的对应字段
    form.setFieldsValue(clearValues);

    // 重置这些字段的编辑状态
    const newEditingFields = { ...editingFields };
    fields.forEach(field => {
      delete newEditingFields[field];
    });
    setEditingFields(newEditingFields);

    // 如果清除的是 Supabase 配置，重置客户端
    if (fields.includes('supabase_url') || fields.includes('supabase_key')) {
      resetSupabaseClient();
    }

    if (import.meta.env.DEV) {
      console.log(`✅ ${serviceName} 配置已清除`);
    }

    // 显示成功消息
    message.warning({
      content: (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>🗑️ {serviceName} 配置已清除</div>
          <div>相关字段已重置为空</div>
        </div>
      ),
      duration: 3,
    });
  };

  // 测试 Supabase
  const testSupabase = async () => {
    setTestResults((prev) => ({ ...prev, supabase: 'testing' }));
    try {
      const { getPlans, createPlan, deletePlan } = await import('../services/plan');
      const plans = await getPlans();

      const testPlan = await createPlan({
        name: '测试计划',
        destination: '北京',
        start_date: '2024-06-01',
        end_date: '2024-06-03',
        budget: 5000,
        travelers: 2,
        preferences: ['美食'],
        status: 'draft',
        itinerary: [],
      });

      await deletePlan(testPlan.id);

      setTestResults((prev) => ({ ...prev, supabase: 'success' }));
      setTestOutputs((prev) => ({ ...prev, supabase: `成功！现有计划数: ${plans.length}` }));
      message.success({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>✅ Supabase 连接成功！</div>
            <div>数据库读写测试通过</div>
            <div style={{ marginTop: 8, fontSize: 12 }}>
              <div>• 成功获取计划列表</div>
              <div>• 成功创建测试数据</div>
              <div>• 成功删除测试数据</div>
              <div style={{ marginTop: 4 }}>当前计划数: {plans.length}</div>
            </div>
          </div>
        ),
        duration: 5,
      });
    } catch (error: any) {
      setTestResults((prev) => ({ ...prev, supabase: 'error' }));
      setTestOutputs((prev) => ({ ...prev, supabase: error.message }));

      let errorTip = '';
      if (error.message.includes('未配置')) {
        errorTip = '请先填写并保存 Supabase URL 和 Key';
      } else if (error.message.includes('Invalid API key')) {
        errorTip = 'API Key 无效，请检查是否正确复制';
      } else if (error.message.includes('Failed to fetch')) {
        errorTip = 'URL 无法访问，请检查 Supabase URL 是否正确';
      } else if (error.message.includes('permission denied')) {
        errorTip = '权限不足，请检查数据库 RLS 策略';
      } else {
        errorTip = '请检查配置是否正确';
      }

      message.error({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>❌ Supabase 测试失败</div>
            <div>{errorTip}</div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              错误详情: {error.message}
            </div>
          </div>
        ),
        duration: 8,
      });
    }
  };

  // 测试 AI 服务
  const testLLM = async () => {
    setTestResults((prev) => ({ ...prev, llm: 'testing' }));
    try {
      const { chatWithAI } = await import('../services/llm');
      const response = await chatWithAI('你好，请用一句话介绍北京');

      setTestResults((prev) => ({ ...prev, llm: 'success' }));
      setTestOutputs((prev) => ({ ...prev, llm: response.substring(0, 100) + '...' }));
      message.success({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>✅ AI 服务连接成功！</div>
            <div>大语言模型响应正常</div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              AI 回复: {response.substring(0, 50)}...
            </div>
          </div>
        ),
        duration: 5,
      });
    } catch (error: any) {
      setTestResults((prev) => ({ ...prev, llm: 'error' }));
      setTestOutputs((prev) => ({ ...prev, llm: error.message }));

      let errorTip = '';
      if (error.message.includes('未配置')) {
        errorTip = '请先填写并保存 LLM API Key';
      } else if (error.message.includes('Invalid API key') || error.message.includes('Unauthorized')) {
        errorTip = 'API Key 无效或已过期';
      } else if (error.message.includes('quota')) {
        errorTip = 'API 配额已用完，请充值或更换 Key';
      } else if (error.message.includes('rate limit')) {
        errorTip = '请求过于频繁，请稍后再试';
      } else {
        errorTip = '请检查 API Key 和 Endpoint 配置';
      }

      message.error({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>❌ AI 服务测试失败</div>
            <div>{errorTip}</div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              错误详情: {error.message}
            </div>
          </div>
        ),
        duration: 8,
      });
    }
  };

  // 测试高德地图
  const testMap = async () => {
    setTestResults((prev) => ({ ...prev, map: 'testing' }));
    try {
      const { geocode, searchPOI } = await import('../services/map');
      const location = await geocode('天安门', '北京');
      const pois = await searchPOI('故宫', '北京');

      setTestResults((prev) => ({ ...prev, map: 'success' }));
      setTestOutputs((prev) => ({
        ...prev,
        map: `地址: ${location?.formattedAddress}, POI数: ${pois.length}`
      }));
      message.success({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>✅ 高德地图连接成功！</div>
            <div>地图服务响应正常</div>
            <div style={{ marginTop: 8, fontSize: 12 }}>
              <div>• 地理编码测试通过</div>
              <div>• POI搜索测试通过</div>
              <div style={{ marginTop: 4, opacity: 0.8 }}>
                找到 {pois.length} 个相关地点
              </div>
            </div>
          </div>
        ),
        duration: 5,
      });
    } catch (error: any) {
      setTestResults((prev) => ({ ...prev, map: 'error' }));
      setTestOutputs((prev) => ({ ...prev, map: error.message }));

      let errorTip = '';
      if (error.message.includes('未配置')) {
        errorTip = '请先填写并保存高德地图 API Key';
      } else if (error.message.includes('Invalid key') || error.message.includes('INVALID_USER_KEY')) {
        errorTip = 'API Key 无效，请检查是否正确';
      } else if (error.message.includes('DAILY_QUERY_OVER_LIMIT')) {
        errorTip = '今日调用次数已用完';
      } else if (error.message.includes('USERKEY_PLAT_NOMATCH')) {
        errorTip = 'Key 的平台设置不匹配';
      } else {
        errorTip = '请检查 API Key 配置';
      }

      message.error({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>❌ 高德地图测试失败</div>
            <div>{errorTip}</div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              错误详情: {error.message}
            </div>
          </div>
        ),
        duration: 8,
      });
    }
  };

  // 一键测试所有服务
  const testAllServices = async () => {
    message.info('开始测试所有服务...');
    await testSupabase();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await testLLM();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await testMap();
    message.success('所有服务测试完成！');
  };

  const supabaseTab = (
    <Form
      form={form}
      layout="vertical"
      initialValues={config}
      onFinish={handleSave}
      autoComplete="off"
    >
      <Alert
        message="Supabase 配置"
        description="用于用户认证和数据存储。请在 Supabase 控制台获取这些信息。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Alert
        message="🔒 安全提示"
        description='已配置的密钥将以掩码形式显示。点击"重新配置"按钮可修改密钥。'
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form.Item
        label="Supabase URL"
        name="supabase_url"
        rules={[{ required: true, message: '请输入 Supabase URL' }]}
      >
        <Input
          placeholder="https://your-project.supabase.co"
          prefix={<KeyOutlined />}
          size="large"
        />
      </Form.Item>

      {isFieldConfigured('supabase_key') && !editingFields['supabase_key'] ? (
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
            <Space>
              <span>Supabase Anon Key</span>
              <Tag color="success">已配置</Tag>
            </Space>
          </div>
          <Input
            value={maskKey(config.supabase_key)}
            disabled
            prefix={<KeyOutlined />}
            size="large"
            addonAfter={
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => toggleFieldEdit('supabase_key')}
                size="small"
              >
                重新配置
              </Button>
            }
          />
        </div>
      ) : (
        <Form.Item
          label="Supabase Anon Key"
          name="supabase_key"
          rules={[{ required: true, message: '请输入 Supabase Anon Key' }]}
        >
          <Input.Password
            placeholder="your-anon-key"
            prefix={<KeyOutlined />}
            size="large"
          />
        </Form.Item>
      )}

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
            保存配置
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleClearFields(['supabase_url', 'supabase_key'], 'Supabase')}
          >
            清除配置
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );

  const mapTab = (
    <Form
      form={form}
      layout="vertical"
      initialValues={config}
      onFinish={handleSave}
      autoComplete="off"
    >
      <Alert
        message="高德地图配置"
        description="用于地图展示和路线规划。请在高德开放平台申请 Web 服务 Key。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Alert
        message="🔒 安全提示"
        description='已配置的密钥将以掩码形式显示。点击"重新配置"按钮可修改密钥。'
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {isFieldConfigured('amap_key') && !editingFields['amap_key'] ? (
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
            <Space>
              <span>高德地图 Key</span>
              <Tag color="success">已配置</Tag>
            </Space>
          </div>
          <Input
            value={maskKey(config.amap_key)}
            disabled
            prefix={<KeyOutlined />}
            size="large"
            addonAfter={
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => toggleFieldEdit('amap_key')}
                size="small"
              >
                重新配置
              </Button>
            }
          />
        </div>
      ) : (
        <Form.Item
          label="高德地图 Key"
          name="amap_key"
          rules={[{ required: true, message: '请输入高德地图 Key' }]}
        >
          <Input.Password
            placeholder="your-amap-key"
            prefix={<KeyOutlined />}
            size="large"
          />
        </Form.Item>
      )}

      <Form.Item
        label={
          <Space>
            <span>高德地图 Secret（可选）</span>
            {isFieldConfigured('amap_secret') && !editingFields['amap_secret'] && (
              <Tag color="success">已配置</Tag>
            )}
          </Space>
        }
        name="amap_secret"
      >
        {isFieldConfigured('amap_secret') && !editingFields['amap_secret'] ? (
          <Input
            value={maskKey(config.amap_secret)}
            disabled
            prefix={<KeyOutlined />}
            size="large"
            addonAfter={
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => toggleFieldEdit('amap_secret')}
                size="small"
              >
                重新配置
              </Button>
            }
          />
        ) : (
          <Input.Password placeholder="your-amap-secret" prefix={<KeyOutlined />} size="large" />
        )}
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
            保存配置
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleClearFields(['amap_key', 'amap_secret'], '高德地图')}
          >
            清除配置
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );

  const speechTab = (
    <Form
      form={form}
      layout="vertical"
      initialValues={config}
      onFinish={handleSave}
      autoComplete="off"
    >
      <Alert
        message="科大讯飞语音识别配置"
        description="用于语音输入功能。请在讯飞开放平台申请语音识别服务。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Alert
        message="🔒 安全提示"
        description='已配置的密钥将以掩码形式显示。点击"重新配置"按钮可修改密钥。'
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {isFieldConfigured('xfei_app_id') && !editingFields['xfei_app_id'] ? (
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
            <Space>
              <span>App ID</span>
              <Tag color="success">已配置</Tag>
            </Space>
          </div>
          <Input
            value={maskKey(config.xfei_app_id)}
            disabled
            prefix={<KeyOutlined />}
            size="large"
            addonAfter={
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => toggleFieldEdit('xfei_app_id')}
                size="small"
              >
                重新配置
              </Button>
            }
          />
        </div>
      ) : (
        <Form.Item label="App ID" name="xfei_app_id">
          <Input.Password placeholder="your-app-id" prefix={<KeyOutlined />} size="large" />
        </Form.Item>
      )}

      {isFieldConfigured('xfei_api_key') && !editingFields['xfei_api_key'] ? (
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
            <Space>
              <span>API Key</span>
              <Tag color="success">已配置</Tag>
            </Space>
          </div>
          <Input
            value={maskKey(config.xfei_api_key)}
            disabled
            prefix={<KeyOutlined />}
            size="large"
            addonAfter={
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => toggleFieldEdit('xfei_api_key')}
                size="small"
              >
                重新配置
              </Button>
            }
          />
        </div>
      ) : (
        <Form.Item label="API Key" name="xfei_api_key">
          <Input.Password placeholder="your-api-key" prefix={<KeyOutlined />} size="large" />
        </Form.Item>
      )}

      {isFieldConfigured('xfei_api_secret') && !editingFields['xfei_api_secret'] ? (
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
            <Space>
              <span>API Secret</span>
              <Tag color="success">已配置</Tag>
            </Space>
          </div>
          <Input
            value={maskKey(config.xfei_api_secret)}
            disabled
            prefix={<KeyOutlined />}
            size="large"
            addonAfter={
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => toggleFieldEdit('xfei_api_secret')}
                size="small"
              >
                重新配置
              </Button>
            }
          />
        </div>
      ) : (
        <Form.Item label="API Secret" name="xfei_api_secret">
          <Input.Password placeholder="your-api-secret" prefix={<KeyOutlined />} size="large" />
        </Form.Item>
      )}

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
            保存配置
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleClearFields(['xfei_app_id', 'xfei_api_key', 'xfei_api_secret'], '语音识别')}
          >
            清除配置
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );

  const llmTab = (
    <Form
      form={form}
      layout="vertical"
      initialValues={config}
      onFinish={handleSave}
      autoComplete="off"
    >
      <Alert
        message="AI 大语言模型配置"
        description="用于智能行程规划和预算分析。推荐使用阿里云通义千问（百炼平台）。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Alert
        message="🔒 安全提示"
        description='已配置的密钥将以掩码形式显示。点击"重新配置"按钮可修改密钥。'
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {isFieldConfigured('llm_api_key') && !editingFields['llm_api_key'] ? (
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
            <Space>
              <span>API Key</span>
              <Tag color="success">已配置</Tag>
            </Space>
          </div>
          <Input
            value={maskKey(config.llm_api_key)}
            disabled
            prefix={<KeyOutlined />}
            size="large"
            addonAfter={
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => toggleFieldEdit('llm_api_key')}
                size="small"
              >
                重新配置
              </Button>
            }
          />
        </div>
      ) : (
        <Form.Item
          label="API Key"
          name="llm_api_key"
          rules={[{ required: true, message: '请输入 LLM API Key' }]}
          tooltip="在阿里云百炼控制台获取 API Key"
        >
          <Input.Password
            placeholder="sk-xxxxxxxxxxxxxxxx"
            prefix={<KeyOutlined />}
            size="large"
          />
        </Form.Item>
      )}

      <Form.Item
        label="API Endpoint"
        name="llm_endpoint"
        rules={[{ required: true, message: '请输入 API Endpoint' }]}
        tooltip="使用 DashScope API endpoint"
        extra={
          <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
            <div>✅ 正确示例: https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation</div>
            <div style={{ marginTop: 4 }}>
              💡 获取方式:
              <a href="https://help.aliyun.com/zh/model-studio/getting-started/first-api-call-to-qwen" target="_blank" rel="noopener noreferrer" style={{ marginLeft: 4 }}>
                查看文档
              </a>
            </div>
          </div>
        }
      >
        <Input
          placeholder="https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"
          prefix={<KeyOutlined />}
          size="large"
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
            保存配置
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleClearFields(['llm_api_key', 'llm_endpoint'], 'AI 模型')}
          >
            清除配置
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );

  // 渲染测试状态图标
  const renderTestStatus = (status: string) => {
    if (status === 'testing') return <LoadingOutlined style={{ color: '#1890ff' }} />;
    if (status === 'success') return <CheckCircleFilled style={{ color: '#52c41a' }} />;
    if (status === 'error') return <CloseCircleFilled style={{ color: '#ff4d4f' }} />;
    return null;
  };

  const testTab = (
    <div>
      <Alert
        message="服务测试"
        description="测试所有已配置的 API 服务是否正常工作。请先保存配置后再进行测试。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Button type="primary" size="large" onClick={testAllServices} block style={{ marginBottom: 24 }}>
        🚀 一键测试所有服务
      </Button>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Supabase 测试 */}
        <Card
          title={
            <Space>
              {renderTestStatus(testResults.supabase)}
              <span>Supabase 数据库</span>
            </Space>
          }
          extra={
            <Button
              onClick={testSupabase}
              loading={testResults.supabase === 'testing'}
              size="small"
            >
              测试
            </Button>
          }
        >
          <Paragraph>测试内容：创建计划、读取计划、删除计划</Paragraph>
          {testOutputs.supabase && (
            <div>
              {testResults.supabase === 'success' ? (
                <Tag color="success">测试通过</Tag>
              ) : (
                <Tag color="error">测试失败</Tag>
              )}
              <Paragraph>
                <Text>{testOutputs.supabase}</Text>
              </Paragraph>
            </div>
          )}
        </Card>

        {/* AI 服务测试 */}
        <Card
          title={
            <Space>
              {renderTestStatus(testResults.llm)}
              <span>AI 大语言模型</span>
            </Space>
          }
          extra={
            <Button
              onClick={testLLM}
              loading={testResults.llm === 'testing'}
              size="small"
            >
              测试
            </Button>
          }
        >
          <Paragraph>测试内容：AI 对话功能</Paragraph>
          {testOutputs.llm && (
            <div>
              {testResults.llm === 'success' ? (
                <Tag color="success">测试通过</Tag>
              ) : (
                <Tag color="error">测试失败</Tag>
              )}
              <Paragraph>
                <Text>{testOutputs.llm}</Text>
              </Paragraph>
            </div>
          )}
        </Card>

        {/* 高德地图测试 */}
        <Card
          title={
            <Space>
              {renderTestStatus(testResults.map)}
              <span>高德地图</span>
            </Space>
          }
          extra={
            <Button
              onClick={testMap}
              loading={testResults.map === 'testing'}
              size="small"
            >
              测试
            </Button>
          }
        >
          <Paragraph>测试内容：地理编码、POI 搜索</Paragraph>
          {testOutputs.map && (
            <div>
              {testResults.map === 'success' ? (
                <Tag color="success">测试通过</Tag>
              ) : (
                <Tag color="error">测试失败</Tag>
              )}
              <Paragraph>
                <Text>{testOutputs.map}</Text>
              </Paragraph>
            </div>
          )}
        </Card>
      </Space>
    </div>
  );

  return (
    <div className="settings-container">
      <div className="settings-content">
        <div className="settings-header">
          <h1>API 配置</h1>
          {isConfigured() && (
            <Alert
              message="配置完成"
              description="所有必需的 API Key 已配置完成"
              type="success"
              icon={<CheckCircleOutlined />}
              showIcon
            />
          )}
        </div>

        <Card>
          <Tabs
            defaultActiveKey="test"
            items={[
              {
                key: 'test',
                label: '🧪 服务测试',
                children: testTab,
              },
              {
                key: 'supabase',
                label: 'Supabase',
                children: supabaseTab,
              },
              {
                key: 'map',
                label: '高德地图',
                children: mapTab,
              },
              {
                key: 'speech',
                label: '语音识别',
                children: speechTab,
              },
              {
                key: 'llm',
                label: 'AI 模型',
                children: llmTab,
              },
            ]}
          />
        </Card>

        <Divider />

        <Card title="使用说明">
          <div className="settings-help">
            <h3>如何获取 API Keys？</h3>
            <ul>
              <li>
                <strong>Supabase:</strong> 访问{' '}
                <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
                  supabase.com
                </a>{' '}
                创建项目，在项目设置中获取 URL 和 Anon Key
              </li>
              <li>
                <strong>高德地图:</strong> 访问{' '}
                <a href="https://lbs.amap.com" target="_blank" rel="noopener noreferrer">
                  lbs.amap.com
                </a>{' '}
                注册并申请 Web 服务 Key
              </li>
              <li>
                <strong>科大讯飞:</strong> 访问{' '}
                <a href="https://www.xfyun.cn" target="_blank" rel="noopener noreferrer">
                  xfyun.cn
                </a>{' '}
                注册并创建语音识别应用
              </li>
              <li>
                <strong>阿里云通义千问:</strong> 访问{' '}
                <a
                  href="https://bailian.console.aliyun.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  百炼平台
                </a>{' '}
                获取 API Key
              </li>
            </ul>

            <h3>安全提示</h3>
            <p>
              所有 API Key 仅保存在您的浏览器本地存储中，不会上传到任何服务器。
              请妥善保管您的密钥，不要分享给他人。
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;

