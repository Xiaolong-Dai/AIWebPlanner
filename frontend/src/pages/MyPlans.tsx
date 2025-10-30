import { useEffect, useState } from 'react';
import {
  Layout,
  Card,
  Empty,
  Button,
  Table,
  Tag,
  Space,
  Popconfirm,
  message,
  Spin,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usePlanStore } from '../store/planStore';
import { getPlans, deletePlan } from '../services/plan';
import type { TravelPlan } from '../types/common';
import { ROUTES } from '../constants';
import dayjs from 'dayjs';

const { Content } = Layout;

const MyPlans = () => {
  const navigate = useNavigate();
  const { plans, setPlans, deletePlan: deletePlanFromStore } = usePlanStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  // 加载旅行计划
  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await getPlans();
      setPlans(data);
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
              <div>无法获取行程列表</div>
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
          duration: 8,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // 删除计划
  const handleDelete = async (id: string) => {
    try {
      const plan = plans.find(p => p.id === id);
      await deletePlan(id);
      deletePlanFromStore(id);
      message.success({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>✅ 删除成功</div>
            <div>行程"{plan?.name || '未命名'}"已删除</div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              数据已从云端移除
            </div>
          </div>
        ),
        duration: 3,
      });
      // 重新加载列表
      loadPlans();
    } catch (error) {
      console.error('删除失败:', error);
      const err = error as Error;
      message.error({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>❌ 删除失败</div>
            <div>无法删除该行程</div>
            <div style={{ marginTop: 8, fontSize: 12 }}>
              <div>错误原因: {err.message}</div>
              <div style={{ marginTop: 4, opacity: 0.8 }}>
                • 请检查网络连接
              </div>
              <div style={{ opacity: 0.8 }}>
                • 请稍后重试
              </div>
            </div>
          </div>
        ),
        duration: 6,
      });
    }
  };

  // 状态标签颜色
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

  // 表格列定义
  const columns = [
    {
      title: '计划名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <CalendarOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '目的地',
      dataIndex: 'destination',
      key: 'destination',
      render: (text: string) => (
        <Space>
          <EnvironmentOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: '日期',
      key: 'date',
      render: (_: any, record: TravelPlan) => (
        <span>
          {dayjs(record.start_date).format('YYYY-MM-DD')} 至{' '}
          {dayjs(record.end_date).format('YYYY-MM-DD')}
        </span>
      ),
    },
    {
      title: '预算',
      dataIndex: 'budget',
      key: 'budget',
      render: (budget: number) => (
        <Space>
          <DollarOutlined />¥{budget.toFixed(2)}
        </Space>
      ),
    },
    {
      title: '人数',
      dataIndex: 'travelers',
      key: 'travelers',
      render: (travelers: number) => `${travelers} 人`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: TravelPlan) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(ROUTES.PLAN_DETAIL.replace(':id', record.id))}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(ROUTES.PLAN_EDIT.replace(':id', record.id))}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个计划吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 根据标签页过滤计划
  const getFilteredPlans = () => {
    if (activeTab === 'all') return plans;
    return plans.filter((plan) => plan.status === activeTab);
  };

  const filteredPlans = getFilteredPlans();

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <Card
          title="我的旅行计划"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(ROUTES.PLAN_CREATE)}
            >
              创建新计划
            </Button>
          }
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'all',
                label: `全部 (${plans.length})`,
              },
              {
                key: 'draft',
                label: `草稿 (${plans.filter((p) => p.status === 'draft').length})`,
              },
              {
                key: 'confirmed',
                label: `已确认 (${plans.filter((p) => p.status === 'confirmed').length})`,
              },
              {
                key: 'completed',
                label: `已完成 (${plans.filter((p) => p.status === 'completed').length})`,
              },
              {
                key: 'archived',
                label: `已归档 (${plans.filter((p) => p.status === 'archived').length})`,
              },
            ]}
          />

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Spin size="large">
                <div style={{ minHeight: 100 }} />
              </Spin>
              <div style={{ marginTop: 16, color: '#666' }}>加载中...</div>
            </div>
          ) : filteredPlans.length === 0 ? (
            <Empty
              description="暂无旅行计划"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: '60px 0' }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate(ROUTES.PLAN_CREATE)}
              >
                创建新计划
              </Button>
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredPlans}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条`,
              }}
            />
          )}
        </Card>
      </Content>
    </div>
  );
};

export default MyPlans;

