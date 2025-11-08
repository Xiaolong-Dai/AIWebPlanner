import { Carousel, Card, Typography, Space } from 'antd';
import {
  BulbOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  RocketOutlined,
  HeartOutlined,
  StarOutlined,
} from '@ant-design/icons';
import './index.css';

const { Text, Title } = Typography;

interface Tip {
  icon: React.ReactNode;
  title: string;
  content: string;
  color: string;
}

const tips: Tip[] = [
  {
    icon: <BulbOutlined />,
    title: '💡 使用语音输入更快捷',
    content: '点击麦克风图标，直接说出旅行需求，AI 会自动识别并生成行程。例如："我想去东京，5天，预算1万"',
    color: '#1890ff',
  },
  {
    icon: <ThunderboltOutlined />,
    title: '⚡ AI 生成需要 3-5 分钟',
    content: '生成详细行程需要一些时间，请耐心等待。系统会显示实时进度，您可以看到 AI 正在做什么。',
    color: '#faad14',
  },
  {
    icon: <SafetyOutlined />,
    title: '🔒 数据自动云端保存',
    content: '所有旅行计划和费用记录都会自动保存到云端，不用担心数据丢失。支持多设备同步查看。',
    color: '#52c41a',
  },
  {
    icon: <RocketOutlined />,
    title: '🚀 一次性说明所有需求',
    content: '与 AI 对话时，可以一次性说明目的地、天数、预算、人数、偏好等信息，AI 会更快生成行程。',
    color: '#722ed1',
  },
  {
    icon: <HeartOutlined />,
    title: '💰 语音快速记录费用',
    content: '在预算管理页面，使用语音说"午餐50" "出租车30"，系统会自动识别金额和类别，快速记录。',
    color: '#eb2f96',
  },
  {
    icon: <StarOutlined />,
    title: '✨ 随时调整和优化',
    content: '生成行程后，可以继续与 AI 对话调整。例如："增加一天" "预算改为1.5万" "增加购物时间"。',
    color: '#13c2c2',
  },
];

const TipsCarousel = () => {
  return (
    <Card className="tips-carousel-card" bordered={false}>
      <Carousel autoplay autoplaySpeed={5000} dotPosition="bottom">
        {tips.map((tip, index) => (
          <div key={index}>
            <div className="tip-content">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div className="tip-header">
                  <div className="tip-icon" style={{ color: tip.color }}>
                    {tip.icon}
                  </div>
                  <Title level={4} style={{ margin: 0, color: tip.color }}>
                    {tip.title}
                  </Title>
                </div>
                <Text className="tip-text">{tip.content}</Text>
              </Space>
            </div>
          </div>
        ))}
      </Carousel>
    </Card>
  );
};

export default TipsCarousel;

