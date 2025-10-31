import { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Descriptions,
  Tag,
  Button,
  Space,
  Tabs,
  Timeline,
  Spin,
  message,
  Empty,
  Statistic,
} from 'antd';
import {
  LeftOutlined,
  EditOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  UserOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  CarOutlined,
  CoffeeOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import MapView from '../components/MapView';
import ItineraryCard from '../components/ItineraryCard';
import { getPlanById } from '../services/plan';
import { getExpensesByPlanId, getBudgetAnalysis } from '../services/expense';
import type { TravelPlan, Expense, BudgetAnalysis } from '../types';
import { ROUTES } from '../constants';

const { Content } = Layout;

const PlanDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgetAnalysis, setBudgetAnalysis] = useState<BudgetAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPlanDetail();
    }
  }, [id]);

  const loadPlanDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [planData, expensesData] = await Promise.all([
        getPlanById(id),
        getExpensesByPlanId(id),
      ]);

      setPlan(planData);
      setExpenses(expensesData);

      // 加载预算分析
      if (planData) {
        const analysis = await getBudgetAnalysis(id, planData.budget);
        setBudgetAnalysis(analysis);
      }
    } catch (error: any) {
      console.error('加载计划详情失败:', error);
      message.error({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>❌ 加载失败</div>
            <div>无法获取行程详情</div>
            <div style={{ marginTop: 8, fontSize: 12 }}>
              <div>错误原因: {error.message}</div>
              <div style={{ marginTop: 4, opacity: 0.8 }}>
                • 请检查网络连接
              </div>
              <div style={{ opacity: 0.8 }}>
                • 该行程可能已被删除
              </div>
            </div>
          </div>
        ),
        duration: 6,
      });
    } finally {
      setLoading(false);
    }
  };

  // 计算 AI 规划的总预算（从行程中计算）
  const calculatePlannedBudget = () => {
    if (!plan?.itinerary) return 0;

    let total = 0;

    plan.itinerary.forEach(day => {
      // 活动费用
      if (day.activities) {
        day.activities.forEach(activity => {
          if (activity.cost !== undefined && activity.cost !== null) {
            total += activity.cost;
          } else if (activity.ticket_price !== undefined && activity.ticket_price !== null) {
            total += activity.ticket_price;
          }
        });
      }

      // 城际交通费用
      if (day.transportation && Array.isArray(day.transportation)) {
        day.transportation.forEach((trans: any) => {
          if (trans.price !== undefined && trans.price !== null) {
            total += trans.price;
          }
        });
      }

      // 住宿费用
      if (day.accommodation?.price_per_night) {
        total += day.accommodation.price_per_night;
      }

      // 餐饮费用
      if (day.meals && Array.isArray(day.meals)) {
        day.meals.forEach(meal => {
          if (meal.price_per_person !== undefined && meal.price_per_person !== null) {
            total += meal.price_per_person;
          }
        });
      }
    });

    return Math.round(total * 100) / 100;
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      draft: { color: 'default', text: '草稿' },
      confirmed: { color: 'blue', text: '已确认' },
      completed: { color: 'green', text: '已完成' },
      archived: { color: 'gray', text: '已归档' },
    };
    const config = statusMap[status] || statusMap.draft;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Content style={{ padding: '24px' }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16, color: '#666' }}>加载中...</div>
            </div>
          </Card>
        </Content>
      </div>
    );
  }

  if (!plan) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Content style={{ padding: '24px' }}>
          <Card>
            <Empty description="计划不存在">
              <Button type="primary" onClick={() => navigate(ROUTES.MY_PLANS)}>
                返回我的行程
              </Button>
            </Empty>
          </Card>
        </Content>
      </div>
    );
  }

  const days = dayjs(plan.end_date).diff(dayjs(plan.start_date), 'day') + 1;

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        {/* 头部 */}
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button icon={<LeftOutlined />} onClick={() => navigate(ROUTES.MY_PLANS)}>
              返回
            </Button>
            <h2 style={{ margin: 0 }}>{plan.name}</h2>
            {getStatusTag(plan.status)}
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(ROUTES.PLAN_EDIT.replace(':id', plan.id))}
            >
              编辑
            </Button>
          </Space>
        </div>

        {/* 基本信息 */}
        <Card style={{ marginBottom: 16 }}>
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label={<><EnvironmentOutlined /> 目的地</>}>
              {plan.destination}
            </Descriptions.Item>
            <Descriptions.Item label={<><CalendarOutlined /> 日期</>}>
              {dayjs(plan.start_date).format('YYYY-MM-DD')} 至 {dayjs(plan.end_date).format('YYYY-MM-DD')}
              <Tag style={{ marginLeft: 8 }}>{days} 天</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={<><UserOutlined /> 人数</>}>
              {plan.travelers} 人
            </Descriptions.Item>
            <Descriptions.Item label={<><DollarOutlined /> 预算</>}>
              ¥{plan.budget.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="偏好">
              {plan.preferences && plan.preferences.length > 0 ? (
                plan.preferences.map((pref, index) => (
                  <Tag key={index} color="blue">
                    {pref}
                  </Tag>
                ))
              ) : (
                <span style={{ color: '#999' }}>无</span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label={<><ClockCircleOutlined /> 创建时间</>}>
              {dayjs(plan.created_at).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 预算统计 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="总预算"
                value={plan.budget}
                precision={2}
                prefix="¥"
                valueStyle={{ color: '#1890ff' }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                用户设定的旅行预算
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="AI 规划预算"
                value={calculatePlannedBudget()}
                precision={2}
                prefix="¥"
                valueStyle={{ color: '#722ed1' }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                根据行程计算的预计费用
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="实际花费"
                value={budgetAnalysis?.totalSpent || 0}
                precision={2}
                prefix="¥"
                valueStyle={{ color: '#cf1322' }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                已记录的实际支出
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="剩余预算"
                value={budgetAnalysis?.remaining || 0}
                precision={2}
                prefix="¥"
                valueStyle={{
                  color: budgetAnalysis && budgetAnalysis.remaining < 0 ? '#cf1322' : '#3f8600',
                }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                {budgetAnalysis && budgetAnalysis.remaining < 0 ? '预算超支' : '可用余额'}
              </div>
            </Card>
          </Col>
        </Row>

        {/* 标签页 */}
        <Card>
          <Tabs
            defaultActiveKey="itinerary"
            items={[
              {
                key: 'itinerary',
                label: '📅 详细行程',
                children: plan.itinerary && plan.itinerary.length > 0 ? (
                  <div>
                    {plan.itinerary.map((day, index) => (
                      <ItineraryCard key={index} dayItinerary={day} dayNumber={index + 1} />
                    ))}
                  </div>
                ) : (
                  <Empty description="暂无行程安排" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ),
              },
              {
                key: 'map',
                label: '🗺️ 地图视图',
                children: plan.itinerary && plan.itinerary.length > 0 ? (
                  <MapView itinerary={plan.itinerary} height={600} />
                ) : (
                  <Empty description="暂无地图数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ),
              },
              {
                key: 'expenses',
                label: '💰 费用记录',
                children: expenses.length > 0 ? (
                  <Timeline>
                    {expenses.map((expense) => (
                      <Timeline.Item key={expense.id}>
                        <div>
                          <Space>
                            <Tag color="blue">{dayjs(expense.date).format('YYYY-MM-DD')}</Tag>
                            <strong>¥{expense.amount.toFixed(2)}</strong>
                            <span>{expense.description}</span>
                          </Space>
                          {expense.notes && (
                            <div style={{ color: '#999', marginTop: 4 }}>{expense.notes}</div>
                          )}
                        </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                ) : (
                  <Empty description="暂无费用记录" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                    <Button type="primary" onClick={() => navigate(ROUTES.BUDGET)}>
                      去添加费用
                    </Button>
                  </Empty>
                ),
              },
              {
                key: 'timeline',
                label: '📋 行程时间轴',
                children: plan.itinerary && plan.itinerary.length > 0 ? (
                  <Timeline mode="left">
                    {plan.itinerary.map((day, dayIndex) => (
                      <Timeline.Item
                        key={dayIndex}
                        label={
                          <div>
                            <div>第 {dayIndex + 1} 天</div>
                            <div style={{ fontSize: 12, color: '#999' }}>{day.date}</div>
                          </div>
                        }
                      >
                        <Card size="small">
                          {day.activities && day.activities.length > 0 && (
                            <div style={{ marginBottom: 12 }}>
                              <strong>活动:</strong>
                              {day.activities.map((activity, idx) => (
                                <div key={idx} style={{ marginLeft: 16, marginTop: 4 }}>
                                  • {activity.time} - {activity.name}
                                  {activity.location && ` (${activity.location})`}
                                </div>
                              ))}
                            </div>
                          )}
                          {day.accommodation && (
                            <div style={{ marginBottom: 8 }}>
                              <HomeOutlined /> <strong>住宿:</strong> {day.accommodation.name}
                              {day.accommodation.price && ` - ¥${day.accommodation.price}`}
                            </div>
                          )}
                          {day.transportation && day.transportation.length > 0 && (
                            <div style={{ marginBottom: 8 }}>
                              <CarOutlined /> <strong>交通:</strong>
                              {day.transportation.map((trans, idx) => (
                                <div key={idx} style={{ marginLeft: 16 }}>
                                  • {trans.type}: {trans.from} → {trans.to}
                                  {trans.price && ` - ¥${trans.price}`}
                                </div>
                              ))}
                            </div>
                          )}
                          {day.meals && day.meals.length > 0 && (
                            <div>
                              <CoffeeOutlined /> <strong>餐饮:</strong>
                              {day.meals.map((meal, idx) => (
                                <div key={idx} style={{ marginLeft: 16 }}>
                                  • {meal.type}: {meal.restaurant}
                                  {meal.price && ` - ¥${meal.price}`}
                                </div>
                              ))}
                            </div>
                          )}
                        </Card>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                ) : (
                  <Empty description="暂无行程数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ),
              },
            ]}
          />
        </Card>
      </Content>
    </div>
  );
};

export default PlanDetail;

