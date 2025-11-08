import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Card, Button, Row, Col, Statistic, Spin, message, List, Tag, Space } from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  RightOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';
import { usePlanStore } from '../store/planStore';
import { getPlans, getPlanStats } from '../services/plan';
import TipsCarousel from '../components/TipsCarousel';
import { ROUTES } from '../constants';
import './Dashboard.css';

const { Content } = Layout;

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { plans, setPlans, setLoading, isLoading } = usePlanStore();
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    confirmed: 0,
    completed: 0,
    archived: 0,
    totalBudget: 0,
  });

  // 加载旅行计划数据
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        const [plansData, statsData] = await Promise.all([getPlans(), getPlanStats()]);
        setPlans(plansData);
        setStats(statsData);
      } catch (error) {
        console.error('加载计划失败:', error);
        const err = error as Error;
        if (err.message.includes('未配置')) {
          message.warning({
            content: (
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: 8 }}>⚠️ 配置缺失</div>
                <div>请先配置 Supabase API Key</div>
                <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                  点击右上角"设置"按钮进行配置
                </div>
              </div>
            ),
            duration: 6,
          });
        } else {
          message.error({
            content: (
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: 8 }}>❌ 加载失败</div>
                <div>无法获取仪表盘数据</div>
                <div style={{ marginTop: 8, fontSize: 12 }}>
                  <div>错误原因: {err.message}</div>
                  <div style={{ marginTop: 4, opacity: 0.8 }}>
                    • 请检查网络连接
                  </div>
                  <div style={{ opacity: 0.8 }}>
                    • 请刷新页面重试
                  </div>
                </div>
              </div>
            ),
            duration: 6,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadPlans();
    }
  }, [user, setPlans, setLoading]);

  const handleCreatePlan = () => {
    navigate(ROUTES.PLAN_CREATE);
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <Spin size="large" />
          <div className="loading-text">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container fade-in">
      <Content>
        {/* 欢迎卡片 */}
        <Card
          className="custom-card"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ color: 'white', fontSize: 28, marginBottom: 8, fontWeight: 600 }}>
                👋 欢迎回来，{user?.email?.split('@')[0]}！
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, marginBottom: 0 }}>
                开始规划您的下一次精彩旅程
              </p>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCreatePlan}
              style={{
                background: 'white',
                color: '#667eea',
                border: 'none',
                height: 48,
                padding: '0 32px',
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              创建新计划
            </Button>
          </div>
        </Card>

        {/* 使用技巧轮播 */}
        <div style={{ marginBottom: 24 }}>
          <TipsCarousel />
        </div>

        {/* 统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card" hoverable>
              <Statistic
                title="总计划数"
                value={stats.total}
                prefix={<CalendarOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a', fontWeight: 600 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card" hoverable>
              <Statistic
                title="进行中"
                value={stats.confirmed}
                prefix={<EnvironmentOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff', fontWeight: 600 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card" hoverable>
              <Statistic
                title="已完成"
                value={stats.completed}
                prefix={<CalendarOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1', fontWeight: 600 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card" hoverable>
              <Statistic
                title="总预算"
                value={stats.totalBudget.toFixed(2)}
                prefix={<DollarOutlined style={{ color: '#faad14' }} />}
                suffix="元"
                valueStyle={{ color: '#faad14', fontWeight: 600 }}
              />
            </Card>
          </Col>
        </Row>

        {/* 最近的旅行计划 */}
        <Card
          className="custom-card"
          title={
            <div style={{ fontSize: 18, fontWeight: 600, color: '#262626' }}>
              📅 最近的旅行计划
            </div>
          }
          extra={
            plans.length > 0 && (
              <Button type="link" onClick={() => navigate(ROUTES.MY_PLANS)} style={{ fontWeight: 500 }}>
                查看全部 <RightOutlined />
              </Button>
            )
          }
        >
          {plans.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✈️</div>
              <div className="empty-state-title">还没有旅行计划</div>
              <div className="empty-state-description">
                开始创建您的第一个旅行计划，让 AI 帮您规划完美行程
              </div>
              <Space size="middle">
                <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleCreatePlan}>
                  创建第一个计划
                </Button>
                <Button size="large" icon={<SettingOutlined />} onClick={() => navigate(ROUTES.SETTINGS)}>
                  配置API密钥
                </Button>
              </Space>
            </div>
          ) : (
            <List
              dataSource={plans.slice(0, 5)}
              renderItem={(plan) => (
                <List.Item
                  key={plan.id}
                  style={{
                    cursor: 'pointer',
                    padding: '16px 0',
                    transition: 'all 0.3s ease',
                  }}
                  className="plan-list-item"
                  onClick={() => navigate(ROUTES.PLAN_DETAIL.replace(':id', plan.id))}
                  actions={[
                    <Button
                      type="link"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(ROUTES.PLAN_DETAIL.replace(':id', plan.id));
                      }}
                      style={{ fontWeight: 500 }}
                    >
                      查看详情 <RightOutlined />
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <span style={{ fontSize: 16, fontWeight: 600, color: '#262626' }}>
                          {plan.name}
                        </span>
                        <Tag
                          color={
                            plan.status === 'confirmed'
                              ? 'blue'
                              : plan.status === 'completed'
                              ? 'green'
                              : plan.status === 'archived'
                              ? 'default'
                              : 'orange'
                          }
                          style={{ fontWeight: 500 }}
                        >
                          {plan.status === 'draft' && '草稿'}
                          {plan.status === 'confirmed' && '已确认'}
                          {plan.status === 'completed' && '已完成'}
                          {plan.status === 'archived' && '已归档'}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space split="|" style={{ color: '#666', fontSize: 14 }}>
                        <span>
                          <EnvironmentOutlined /> {plan.destination}
                        </span>
                        <span>
                          <CalendarOutlined /> {plan.start_date} 至 {plan.end_date}
                        </span>
                        <span>
                          <DollarOutlined /> ¥{plan.budget}
                        </span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </Content>
    </div>
  );
};

export default Dashboard;

