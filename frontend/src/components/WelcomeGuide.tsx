import { useState, useEffect } from 'react';
import { Modal, Steps, Button, Typography, Space, Alert } from 'antd';
import {
  SettingOutlined,
  RocketOutlined,
  DollarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useApiConfigStore } from '../store/apiConfigStore';
import { ROUTES } from '../constants';

const { Title, Paragraph, Text } = Typography;

const WelcomeGuide = () => {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const { isConfigured } = useApiConfigStore();

  useEffect(() => {
    // 检查是否是首次访问
    const hasSeenGuide = localStorage.getItem('hasSeenWelcomeGuide');
    if (!hasSeenGuide && !isConfigured()) {
      setVisible(true);
    }
  }, [isConfigured]);

  const handleClose = () => {
    localStorage.setItem('hasSeenWelcomeGuide', 'true');
    setVisible(false);
  };

  const handleNext = () => {
    if (current < 3) {
      setCurrent(current + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  const handleGoToSettings = () => {
    handleClose();
    navigate(ROUTES.SETTINGS);
  };

  const steps = [
    {
      title: '欢迎使用 AI Web Planner',
      icon: <RocketOutlined />,
      content: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={3}>🎉 欢迎来到 AI Web Planner!</Title>
          <Paragraph>
            这是一款智能旅行规划应用,通过AI帮助您:
          </Paragraph>
          <ul>
            <li>🤖 <strong>AI智能规划</strong>: 自动生成详细旅行路线</li>
            <li>🎤 <strong>语音输入</strong>: 支持语音描述旅行需求</li>
            <li>🗺️ <strong>地图可视化</strong>: 在地图上查看行程安排</li>
            <li>💰 <strong>预算管理</strong>: 智能预算分配和费用追踪</li>
            <li>☁️ <strong>云端同步</strong>: 多设备数据同步</li>
          </ul>
          <Alert
            message="提示"
            description="首次使用需要配置API密钥,请按照引导完成设置。"
            type="info"
            showIcon
          />
        </Space>
      ),
    },
    {
      title: '配置API密钥',
      icon: <SettingOutlined />,
      content: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={3}>⚙️ 配置API密钥</Title>
          <Paragraph>
            为了使用完整功能,您需要配置以下服务的API密钥:
          </Paragraph>
          
          <div>
            <Title level={5}>1. Supabase (必需)</Title>
            <Paragraph>
              用于数据存储和用户认证
              <br />
              <Text type="secondary">获取地址: </Text>
              <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
                https://supabase.com
              </a>
            </Paragraph>
          </div>

          <div>
            <Title level={5}>2. 阿里云通义千问 (必需)</Title>
            <Paragraph>
              用于AI智能规划
              <br />
              <Text type="secondary">获取地址: </Text>
              <a href="https://bailian.console.aliyun.com" target="_blank" rel="noopener noreferrer">
                https://bailian.console.aliyun.com
              </a>
            </Paragraph>
          </div>

          <div>
            <Title level={5}>3. 高德地图 (可选)</Title>
            <Paragraph>
              用于地图展示和路线规划
              <br />
              <Text type="secondary">获取地址: </Text>
              <a href="https://lbs.amap.com" target="_blank" rel="noopener noreferrer">
                https://lbs.amap.com
              </a>
            </Paragraph>
          </div>

          <div>
            <Title level={5}>4. 科大讯飞 (可选)</Title>
            <Paragraph>
              用于语音识别
              <br />
              <Text type="secondary">获取地址: </Text>
              <a href="https://www.xfyun.cn" target="_blank" rel="noopener noreferrer">
                https://www.xfyun.cn
              </a>
            </Paragraph>
          </div>

          <Alert
            message="安全提示"
            description="API密钥将保存在浏览器本地存储中,不会上传到服务器。"
            type="warning"
            showIcon
          />
        </Space>
      ),
    },
    {
      title: '快速开始',
      icon: <DollarOutlined />,
      content: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={3}>🚀 快速开始</Title>
          <Paragraph>
            完成配置后,您可以:
          </Paragraph>

          <div>
            <Title level={5}>1️⃣ 创建旅行计划</Title>
            <Paragraph>
              点击"创建计划"按钮,通过AI对话或语音输入描述您的旅行需求,
              AI会自动生成详细的行程安排。
            </Paragraph>
          </div>

          <div>
            <Title level={5}>2️⃣ 查看和编辑计划</Title>
            <Paragraph>
              在"我的行程"页面查看所有计划,点击计划可查看详情,
              包括地图视图、费用记录等。
            </Paragraph>
          </div>

          <div>
            <Title level={5}>3️⃣ 管理预算</Title>
            <Paragraph>
              在"预算管理"页面记录旅行费用,查看统计图表,
              使用AI分析预算分配是否合理。
            </Paragraph>
          </div>

          <Alert
            message="小贴士"
            description="建议先在设置页面测试API连接,确保所有服务正常工作。"
            type="success"
            showIcon
          />
        </Space>
      ),
    },
    {
      title: '完成设置',
      icon: <CheckCircleOutlined />,
      content: (
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <Title level={3}>✅ 准备就绪!</Title>
          <Paragraph style={{ fontSize: '16px' }}>
            现在您可以开始使用 AI Web Planner 规划您的旅行了!
          </Paragraph>
          <div style={{ margin: '40px 0' }}>
            <CheckCircleOutlined style={{ fontSize: '80px', color: '#52c41a' }} />
          </div>
          <Space direction="vertical" size="middle">
            <Button type="primary" size="large" onClick={handleGoToSettings}>
              前往设置页面配置
            </Button>
            <Button size="large" onClick={handleClose}>
              稍后配置,先浏览应用
            </Button>
          </Space>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={700}
      centered
      closable={false}
    >
      <div style={{ padding: '20px 0' }}>
        <Steps current={current} style={{ marginBottom: 30 }}>
          {steps.map((item) => (
            <Steps.Step key={item.title} title={item.title} icon={item.icon} />
          ))}
        </Steps>

        <div style={{ minHeight: '400px', marginBottom: 20 }}>
          {steps[current].content}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={handlePrev} disabled={current === 0}>
            上一步
          </Button>
          <Button type="primary" onClick={handleNext}>
            {current === steps.length - 1 ? '完成' : '下一步'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default WelcomeGuide;

