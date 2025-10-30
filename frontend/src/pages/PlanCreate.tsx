import { useState } from 'react';
import { Row, Col, Card, Button, Space, message, Modal, Input, Form } from 'antd';
import { SaveOutlined, LeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ChatInterface from '../components/ChatInterface';
import MapView from '../components/MapView';
import ItineraryCard from '../components/ItineraryCard';
import { createPlan } from '../services/plan';
import type { DayItinerary } from '../types/common';
import './PlanCreate.css';

const PlanCreate = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [generatedItinerary, setGeneratedItinerary] = useState<DayItinerary[]>([]);
  const [planInfo, setPlanInfo] = useState<any>(null);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [destination, setDestination] = useState<string>(''); // 目的地

  // AI 生成行程回调
  const handlePlanGenerated = (result: any) => {
    console.log('🎯 AI 生成行程回调，结果:', result);
    console.log('📍 目的地信息:', result.destination);

    setGeneratedItinerary(result.itinerary || []);

    // 保存完整的计划信息，用于后续保存
    const planData = {
      destination: result.destination || '未知目的地',
      budget: result.budget || 5000,
      travelers: result.travelers || 2,
      preferences: result.preferences || [],
      itinerary: result.itinerary,
      suggestions: result.suggestions,
    };

    setPlanInfo(planData);
    console.log('✅ 计划信息已保存:', planData);
    console.log('📍 目的地已设置为:', planData.destination);

    // 提取目的地信息
    if (result.destination) {
      setDestination(result.destination);
      console.log('✅ destination 状态已更新为:', result.destination);
    } else {
      console.warn('⚠️ AI 返回的结果中没有 destination 字段');
    }
  };

  // 保存行程
  const handleSave = async () => {
    if (!generatedItinerary || generatedItinerary.length === 0) {
      message.warning({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>⚠️ 无法保存</div>
            <div>还没有生成行程计划</div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              请先使用AI生成行程，或手动添加行程内容
            </div>
          </div>
        ),
        duration: 5,
      });
      return;
    }
    setSaveModalVisible(true);
  };

  // 确认保存
  const handleConfirmSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      console.log('📝 开始保存行程...');
      console.log('表单数据:', values);
      console.log('计划信息:', planInfo);
      console.log('行程数据:', generatedItinerary);
      console.log('📍 当前 destination 状态:', destination);

      // 从生成的行程中提取信息
      const destinationToSave = planInfo?.destination || destination || '未知目的地';
      console.log('📍 准备保存的目的地:', destinationToSave);
      const startDate = generatedItinerary[0]?.date || new Date().toISOString().split('T')[0];
      const endDate =
        generatedItinerary[generatedItinerary.length - 1]?.date ||
        new Date(Date.now() + generatedItinerary.length * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];

      const planToSave = {
        name: values.name,
        destination: destinationToSave,
        start_date: startDate,
        end_date: endDate,
        budget: planInfo?.budget || 5000,
        travelers: planInfo?.travelers || 2,
        preferences: planInfo?.preferences || [],
        status: 'draft' as const,
        itinerary: generatedItinerary,
      };

      console.log('💾 准备保存的计划数据:', planToSave);
      console.log('📍 最终保存的目的地:', planToSave.destination);

      const savedPlan = await createPlan(planToSave);

      console.log('✅ 行程保存成功:', savedPlan);

      message.success({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>🎉 行程保存成功！</div>
            <div>计划"{values.name}"已创建</div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              正在跳转到我的行程页面...
            </div>
          </div>
        ),
        duration: 3,
      });
      setSaveModalVisible(false);
      setTimeout(() => {
        navigate('/my-plans');
      }, 500);
    } catch (error: any) {
      console.error('❌ 保存行程失败:', error);
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
      });

      // 提供更详细的错误提示
      let errorMsg = error.message;
      let errorTips = [
        '• 请检查网络连接',
        '• 请确认已配置 Supabase (设置页面)',
      ];

      if (error.message.includes('未登录')) {
        errorMsg = '用户未登录，无法保存行程';
        errorTips = [
          '• 请先登录账号',
          '• 如果已登录，请尝试刷新页面',
        ];
      } else if (error.message.includes('Supabase')) {
        errorMsg = 'Supabase 未配置或配置错误';
        errorTips = [
          '• 请在设置页面配置 Supabase URL 和 Key',
          '• 请确认配置信息正确',
        ];
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMsg = '网络连接失败';
        errorTips = [
          '• 请检查网络连接',
          '• 请确认 Supabase 服务可访问',
        ];
      }

      message.error({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>❌ 保存失败</div>
            <div>{errorMsg}</div>
            <div style={{ marginTop: 8, fontSize: 12 }}>
              {errorTips.map((tip, index) => (
                <div key={index} style={{ opacity: 0.8 }}>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        ),
        duration: 8,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container fade-in">
      {/* 页面标题 */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              icon={<LeftOutlined />}
              onClick={() => navigate(-1)}
              size="large"
              style={{ fontWeight: 500 }}
            >
              返回
            </Button>
            <div>
              <h1 className="page-title" style={{ marginBottom: 4 }}>✈️ 创建旅行计划</h1>
              <p className="page-description">
                使用 AI 智能规划您的完美旅程
              </p>
            </div>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            onClick={handleSave}
            disabled={!generatedItinerary || generatedItinerary.length === 0}
            style={{ height: 48, padding: '0 32px', fontSize: 16, fontWeight: 600 }}
          >
            保存行程
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {/* 左侧：AI 对话界面 */}
        <Col xs={24} lg={11} xl={10}>
          <ChatInterface onPlanGenerated={handlePlanGenerated} />
        </Col>

        {/* 右侧：地图和行程展示 */}
        <Col xs={24} lg={13} xl={14}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {/* 地图 - 始终显示 */}
            <Card
              className="custom-card plan-create-map-card"
              title={
                <div style={{ fontSize: 18, fontWeight: 600, color: '#262626' }}>
                  📍 行程地图
                </div>
              }
              bodyStyle={{ padding: 0 }}
            >
              <div className="plan-create-map">
                <MapView
                  itinerary={generatedItinerary}
                  height={380}
                  destination={destination}
                />
              </div>
            </Card>

            {/* 行程详情 */}
            {generatedItinerary.length > 0 ? (
              <Card
                className="custom-card slide-in-right"
                title={
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#262626' }}>
                    📅 详细行程
                  </div>
                }
              >
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  {generatedItinerary.map((day, index) => (
                    <ItineraryCard key={index} dayItinerary={day} dayNumber={index + 1} />
                  ))}
                </Space>
              </Card>
            ) : (
              <Card className="custom-card">
                <div className="empty-state">
                  <div className="empty-state-icon">🗺️</div>
                  <div className="empty-state-title">还没有生成行程</div>
                  <div className="empty-state-description">
                    请在左侧输入您的旅行需求，AI 将为您生成详细的行程计划
                  </div>
                  <div style={{ marginTop: 12, padding: '10px 16px', background: '#f0f2f5', borderRadius: 8, fontSize: 13, color: '#666' }}>
                    💡 示例：我想去日本东京，5天，预算1万元
                  </div>
                </div>
              </Card>
            )}
          </Space>
        </Col>
      </Row>

      {/* 保存对话框 */}
      <Modal
        title={
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            💾 保存行程
          </div>
        }
        open={saveModalVisible}
        onOk={handleConfirmSave}
        onCancel={() => setSaveModalVisible(false)}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        width={500}
        okButtonProps={{
          size: 'large',
          style: { fontWeight: 500 },
        }}
        cancelButtonProps={{
          size: 'large',
        }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            label={<span style={{ fontWeight: 500, fontSize: 14 }}>行程名称</span>}
            name="name"
            rules={[{ required: true, message: '请输入行程名称' }]}
          >
            <Input
              placeholder="例如：东京5日游"
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
          <div style={{ padding: '12px 16px', background: '#f0f2f5', borderRadius: 8, fontSize: 13, color: '#666' }}>
            💡 提示：保存后可以在"我的行程"页面查看和管理
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default PlanCreate;

