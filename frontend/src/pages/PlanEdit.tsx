import { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Button,
  Space,
  message,
  Spin,
  Row,
  Col,
} from 'antd';
import { LeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { getPlanById, updatePlan } from '../services/plan';
import { ROUTES } from '../constants';

const { Content } = Layout;
const { RangePicker } = DatePicker;
const { Option } = Select;

const PlanEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadPlan();
    }
  }, [id]);

  const loadPlan = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await getPlanById(id);

      if (!data) {
        message.error({
          content: (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>❌ 计划不存在</div>
              <div>找不到该行程计划</div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                可能已被删除，正在返回行程列表...
              </div>
            </div>
          ),
          duration: 4,
        });
        setTimeout(() => {
          navigate(ROUTES.MY_PLANS);
        }, 1000);
        return;
      }

      // 填充表单
      form.setFieldsValue({
        name: data.name,
        destination: data.destination,
        dateRange: [dayjs(data.start_date), dayjs(data.end_date)],
        budget: data.budget,
        travelers: data.travelers,
        preferences: data.preferences || [],
        status: data.status,
      });
    } catch (error: any) {
      console.error('加载计划失败:', error);
      message.error({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>❌ 加载失败</div>
            <div>无法加载行程信息</div>
            <div style={{ marginTop: 8, fontSize: 12 }}>
              <div>错误原因: {error.message}</div>
              <div style={{ marginTop: 4, opacity: 0.8 }}>
                正在返回行程列表...
              </div>
            </div>
          </div>
        ),
        duration: 5,
      });
      setTimeout(() => {
        navigate(ROUTES.MY_PLANS);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      await updatePlan(id!, {
        name: values.name,
        destination: values.destination,
        start_date: values.dateRange[0].format('YYYY-MM-DD'),
        end_date: values.dateRange[1].format('YYYY-MM-DD'),
        budget: values.budget,
        travelers: values.travelers,
        preferences: values.preferences || [],
        status: values.status,
      });

      message.success({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>✅ 保存成功</div>
            <div>行程信息已更新</div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              正在返回详情页面...
            </div>
          </div>
        ),
        duration: 3,
      });
      setTimeout(() => {
        navigate(ROUTES.PLAN_DETAIL.replace(':id', id!));
      }, 500);
    } catch (error: any) {
      console.error('保存失败:', error);
      message.error({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>❌ 保存失败</div>
            <div>无法更新行程信息</div>
            <div style={{ marginTop: 8, fontSize: 12 }}>
              <div>错误原因: {error.message}</div>
              <div style={{ marginTop: 4, opacity: 0.8 }}>
                • 请检查网络连接
              </div>
              <div style={{ opacity: 0.8 }}>
                • 请检查表单填写是否正确
              </div>
            </div>
          </div>
        ),
        duration: 6,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Content style={{ padding: '24px' }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Spin size="large" tip="加载中...">
                <div style={{ minHeight: 100 }} />
              </Spin>
            </div>
          </Card>
        </Content>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button icon={<LeftOutlined />} onClick={() => navigate(-1)}>
              返回
            </Button>
            <h2 style={{ margin: 0 }}>编辑旅行计划</h2>
          </Space>
        </div>

        <Card>
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="计划名称"
                  name="name"
                  rules={[{ required: true, message: '请输入计划名称' }]}
                >
                  <Input placeholder="例如：东京5日游" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="目的地"
                  name="destination"
                  rules={[{ required: true, message: '请输入目的地' }]}
                >
                  <Input placeholder="例如：日本东京" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="旅行日期"
                  name="dateRange"
                  rules={[{ required: true, message: '请选择旅行日期' }]}
                >
                  <RangePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="预算 (元)"
                  name="budget"
                  rules={[{ required: true, message: '请输入预算' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    placeholder="例如：10000"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="同行人数"
                  name="travelers"
                  rules={[{ required: true, message: '请输入同行人数' }]}
                >
                  <InputNumber style={{ width: '100%' }} min={1} placeholder="例如：2" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="计划状态" name="status">
                  <Select>
                    <Option value="draft">草稿</Option>
                    <Option value="confirmed">已确认</Option>
                    <Option value="completed">已完成</Option>
                    <Option value="archived">已归档</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="旅行偏好" name="preferences">
              <Select
                mode="tags"
                placeholder="例如：美食、购物、文化、自然风光"
                style={{ width: '100%' }}
              >
                <Option value="美食">美食</Option>
                <Option value="购物">购物</Option>
                <Option value="文化">文化</Option>
                <Option value="自然风光">自然风光</Option>
                <Option value="历史古迹">历史古迹</Option>
                <Option value="现代都市">现代都市</Option>
                <Option value="休闲度假">休闲度假</Option>
                <Option value="探险">探险</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                  保存
                </Button>
                <Button onClick={() => navigate(-1)}>取消</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <Card title="提示" style={{ marginTop: 16 }}>
          <p>💡 <strong>注意:</strong> 此页面仅编辑计划的基本信息。</p>
          <p>
            如需修改详细行程安排,请在保存后前往计划详情页面,使用AI助手重新生成行程,或手动调整行程内容。
          </p>
        </Card>
      </Content>
    </div>
  );
};

export default PlanEdit;

