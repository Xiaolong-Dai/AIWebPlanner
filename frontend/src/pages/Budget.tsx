import { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Select,
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  message,
  Statistic,
  Progress,
  Tag,
  Space,
  Empty,
  Spin,
  Divider,
  Tooltip,
  Alert,
} from 'antd';
import AILoadingIndicator from '../components/AILoadingIndicator';
import {
  PlusOutlined,
  DeleteOutlined,
  DollarOutlined,
  ShoppingOutlined,
  CarOutlined,
  HomeOutlined,
  CoffeeOutlined,
  GiftOutlined,
  InfoCircleOutlined,
  AudioOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import dayjs from 'dayjs';
import { usePlanStore } from '../store/planStore';
import { getPlans } from '../services/plan';
import {
  getExpensesByPlanId,
  createExpense,
  deleteExpense,
  getBudgetAnalysis,
  getExpensesByCategories,
  getDailyExpenses,
} from '../services/expense';
import { analyzeBudget } from '../services/llm';
import type { Expense, ExpenseCategory, BudgetAnalysis } from '../types';
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_COLORS } from '../constants';
import VoiceInput from '../components/VoiceInput';

const { Content } = Layout;
const { Option } = Select;

const Budget = () => {
  const { plans, setPlans } = usePlanStore();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgetAnalysis, setBudgetAnalysis] = useState<BudgetAnalysis | null>(null);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [aiAnalysisVisible, setAiAnalysisVisible] = useState(false);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [voiceInputField, setVoiceInputField] = useState<'amount' | 'description' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // 防止重复提交
  const [form] = Form.useForm();

  // 快捷键支持：Ctrl/Cmd + K 打开添加费用对话框
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K (Windows/Linux) 或 Cmd+K (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (selectedPlanId && !modalVisible) {
          setModalVisible(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPlanId, modalVisible]);

  // 加载计划列表
  useEffect(() => {
    loadPlans();
  }, []);

  // 当选择计划时,加载费用数据
  useEffect(() => {
    if (selectedPlanId) {
      loadExpenses();
    }
  }, [selectedPlanId]);

  const loadPlans = async () => {
    try {
      const data = await getPlans();
      setPlans(data);
      if (data.length > 0 && !selectedPlanId) {
        setSelectedPlanId(data[0].id);
      }
    } catch (error: any) {
      console.error('加载计划失败:', error);
      if (error.message.includes('未配置')) {
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
      }
    }
  };

  const loadExpenses = async () => {
    if (!selectedPlanId) return;

    try {
      setLoading(true);
      const selectedPlan = plans.find((p) => p.id === selectedPlanId);
      if (!selectedPlan) return;

      const [expensesData, analysisData, categoryStats, dailyStats] = await Promise.all([
        getExpensesByPlanId(selectedPlanId),
        getBudgetAnalysis(selectedPlanId, selectedPlan.budget),
        getExpensesByCategories(selectedPlanId),
        getDailyExpenses(selectedPlanId),
      ]);

      setExpenses(expensesData);
      setBudgetAnalysis(analysisData);

      // 转换分类数据为图表格式
      const chartData = Object.entries(categoryStats).map(([category, amount]) => ({
        name: EXPENSE_CATEGORIES[category as ExpenseCategory],
        value: amount,
        category,
      }));
      setCategoryData(chartData);
      setDailyData(dailyStats);
    } catch (error: any) {
      console.error('加载费用数据失败:', error);
      message.error({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>❌ 加载失败</div>
            <div>无法获取费用数据</div>
            <div style={{ marginTop: 8, fontSize: 12 }}>
              <div>错误原因: {error.message}</div>
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
    } finally {
      setLoading(false);
    }
  };

  // 解析金额的辅助函数
  const parseExpenseAmount = (text: string): number | null => {
    // 匹配各种金额表达方式
    const patterns = [
      /(\d+\.?\d*)元/,
      /(\d+\.?\d*)块/,
      /(\d+\.?\d*)块钱/,
      /花了(\d+\.?\d*)/,
      /(\d+\.?\d*)$/,  // 纯数字
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = parseFloat(match[1]);
        if (!isNaN(amount) && amount > 0) {
          return amount;
        }
      }
    }

    return null;
  };

  // 解析类别的辅助函数
  const parseExpenseCategory = (text: string): ExpenseCategory | null => {
    const categoryKeywords: Record<ExpenseCategory, string[]> = {
      transportation: ['交通', '出租车', '地铁', '公交', '打车', '滴滴', '车费', '高铁', '火车', '飞机', '航班'],
      accommodation: ['住宿', '酒店', '宾馆', '民宿', '房费'],
      food: ['吃饭', '午餐', '晚餐', '早餐', '餐饮', '饭', '吃', '美食'],
      attraction: ['门票', '景点', '参观', '游览'],
      shopping: ['购物', '买', '商场', '超市'],
      other: ['其他'],
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category as ExpenseCategory;
      }
    }

    return null;
  };

  // 语音识别结果处理
  const handleVoiceResult = (text: string) => {
    console.log('语音识别结果:', text);

    if (voiceInputField === 'amount') {
      // 解析金额
      const amount = parseExpenseAmount(text);
      if (amount !== null) {
        form.setFieldsValue({ amount });
        message.success(`识别到金额: ¥${amount}`);
      } else {
        message.warning('未能识别到有效金额，请重试');
      }
    } else if (voiceInputField === 'description') {
      // 直接使用识别文本作为描述
      form.setFieldsValue({ description: text });
    }

    // 尝试识别类别
    const category = parseExpenseCategory(text);
    if (category) {
      form.setFieldsValue({ category });
      message.success(`识别到类别: ${EXPENSE_CATEGORIES[category]}`);
    }

    setShowVoiceInput(false);
    setVoiceInputField(null);
  };

  // 检查预算状态
  const checkBudgetStatus = () => {
    const selectedPlan = plans.find((p) => p.id === selectedPlanId);
    if (!selectedPlan) return;

    const totalBudget = selectedPlan.budget;
    const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const usagePercentage = (totalSpent / totalBudget) * 100;
    const remaining = totalBudget - totalSpent;

    // 预算超支
    if (totalSpent > totalBudget) {
      Modal.error({
        title: '❌ 预算超支提醒',
        content: (
          <div>
            <p style={{ fontSize: 16, fontWeight: 'bold', color: '#ff4d4f', marginBottom: 12 }}>
              您的旅行预算已超支！
            </p>
            <div style={{ background: '#fff1f0', padding: 12, borderRadius: 8, marginBottom: 12 }}>
              <p style={{ margin: '4px 0' }}>
                <strong>总预算：</strong>¥{totalBudget.toFixed(2)}
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>已花费：</strong>¥{totalSpent.toFixed(2)}
              </p>
              <p style={{ margin: '4px 0', color: '#ff4d4f' }}>
                <strong>超支金额：</strong>¥{Math.abs(remaining).toFixed(2)}
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>预算使用率：</strong>{usagePercentage.toFixed(1)}%
              </p>
            </div>
            <p style={{ fontSize: 14, color: '#666' }}>
              💡 建议：
            </p>
            <ul style={{ fontSize: 14, color: '#666', paddingLeft: 20 }}>
              <li>调整后续行程，减少非必要开支</li>
              <li>选择更经济的交通和住宿方式</li>
              <li>考虑增加旅行预算</li>
            </ul>
          </div>
        ),
        okText: '我知道了',
        width: 500,
      });
    }
    // 预算即将用完（90%）
    else if (usagePercentage >= 90) {
      Modal.warning({
        title: '⚠️ 预算预警',
        content: (
          <div>
            <p style={{ fontSize: 16, fontWeight: 'bold', color: '#faad14', marginBottom: 12 }}>
              您的预算即将用完！
            </p>
            <div style={{ background: '#fffbe6', padding: 12, borderRadius: 8, marginBottom: 12 }}>
              <p style={{ margin: '4px 0' }}>
                <strong>总预算：</strong>¥{totalBudget.toFixed(2)}
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>已花费：</strong>¥{totalSpent.toFixed(2)}
              </p>
              <p style={{ margin: '4px 0', color: '#faad14' }}>
                <strong>剩余预算：</strong>¥{remaining.toFixed(2)}
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>预算使用率：</strong>{usagePercentage.toFixed(1)}%
              </p>
            </div>
            <p style={{ fontSize: 14, color: '#666' }}>
              💡 建议：请注意控制后续支出，避免预算超支
            </p>
          </div>
        ),
        okText: '我知道了',
        width: 500,
      });
    }
    // 预算使用超过80%
    else if (usagePercentage >= 80) {
      message.warning({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>⚠️ 预算提醒</div>
            <div>您已使用 {usagePercentage.toFixed(1)}% 的预算</div>
            <div style={{ marginTop: 8, fontSize: 12 }}>
              剩余预算: ¥{remaining.toFixed(2)}
            </div>
          </div>
        ),
        duration: 5,
      });
    }
  };

  // 添加费用
  const handleAddExpense = async () => {
    // 防止重复提交
    if (isSubmitting) {
      console.warn('⚠️ 正在提交中，请勿重复点击');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('🚀 开始添加费用...');

      const values = await form.validateFields();
      console.log('📝 表单验证通过:', values);

      const newExpense = await createExpense({
        plan_id: selectedPlanId!,
        category: values.category,
        amount: values.amount,
        currency: 'CNY',
        description: values.description,
        date: values.date.format('YYYY-MM-DD'),
        notes: values.notes || '',
      });

      console.log('✅ 费用添加成功:', newExpense);

      message.success({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>✅ 添加成功</div>
            <div>费用记录已保存</div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              金额: ¥{values.amount} | 类别: {values.category}
            </div>
          </div>
        ),
        duration: 3,
      });

      setModalVisible(false);
      form.resetFields();
      await loadExpenses();

      // 检查预算使用情况
      checkBudgetStatus();
    } catch (error: any) {
      console.error('❌ 添加费用失败:', error);
      message.error({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>❌ 添加失败</div>
            <div>无法保存费用记录</div>
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
      setIsSubmitting(false);
      console.log('🏁 费用添加流程结束');
    }
  };

  // 删除费用（带二次确认）
  const handleDeleteExpense = (record: Expense) => {
    Modal.confirm({
      title: '确认删除费用记录',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div>
          <p style={{ marginBottom: 12 }}>您确定要删除这条费用记录吗？此操作无法撤销。</p>
          <div style={{
            background: '#fff7e6',
            border: '1px solid #ffd591',
            borderRadius: 4,
            padding: 12,
            marginTop: 12
          }}>
            <div style={{ marginBottom: 4 }}>
              <Tag color={EXPENSE_CATEGORY_COLORS[record.category]} icon={getCategoryIcon(record.category)}>
                {EXPENSE_CATEGORIES[record.category]}
              </Tag>
            </div>
            <div style={{ fontSize: 13, color: '#595959' }}>
              <div><strong>金额：</strong>¥{record.amount.toFixed(2)}</div>
              <div><strong>描述：</strong>{record.description}</div>
              <div><strong>日期：</strong>{dayjs(record.date).format('YYYY-MM-DD')}</div>
            </div>
          </div>
        </div>
      ),
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      width: 480,
      centered: true,
      onOk: async () => {
        try {
          console.log('🗑️ 开始删除费用记录:', record.id);
          await deleteExpense(record.id);

          message.success({
            content: (
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: 8 }}>✅ 删除成功</div>
                <div>费用记录已删除</div>
                <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                  {EXPENSE_CATEGORIES[record.category]} - ¥{record.amount.toFixed(2)}
                </div>
              </div>
            ),
            duration: 3,
          });

          console.log('✅ 费用删除成功');
          await loadExpenses();

          // 检查预算使用情况
          checkBudgetStatus();
        } catch (error: any) {
          console.error('❌ 删除失败:', error);
          message.error({
            content: (
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: 8 }}>❌ 删除失败</div>
                <div>无法删除该费用记录</div>
                <div style={{ marginTop: 8, fontSize: 12 }}>
                  <div>错误原因: {error.message}</div>
                  <div style={{ marginTop: 4, opacity: 0.8 }}>
                    请稍后重试
                  </div>
                </div>
              </div>
            ),
            duration: 5,
          });
        }
      },
    });
  };

  // AI预算分析
  const handleAiAnalysis = async () => {
    if (!selectedPlanId) {
      message.warning('请先选择一个旅行计划');
      return;
    }

    if (expenses.length === 0) {
      message.warning({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>⚠️ 无法进行分析</div>
            <div>请先添加至少一笔费用记录</div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              AI 需要根据您的费用记录进行预算分析
            </div>
          </div>
        ),
        duration: 5,
      });
      return;
    }

    try {
      setAiAnalysisLoading(true);
      setAiAnalysisVisible(true);

      const selectedPlan = plans.find((p) => p.id === selectedPlanId);
      if (!selectedPlan) {
        message.error('未找到选中的旅行计划');
        return;
      }

      console.log('🤖 开始 AI 预算分析...');
      console.log('计划信息:', selectedPlan);
      console.log('费用记录:', expenses);

      const result = await analyzeBudget({
        destination: selectedPlan.destination,
        days: dayjs(selectedPlan.end_date).diff(dayjs(selectedPlan.start_date), 'day') + 1,
        totalBudget: selectedPlan.budget,
        travelers: selectedPlan.travelers,
        preferences: selectedPlan.preferences || [],
        currentExpenses: expenses,
        startDate: selectedPlan.start_date,
        endDate: selectedPlan.end_date,
      });

      console.log('✅ AI 分析结果:', result);

      setAiAnalysisResult(result);
      message.success({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>✅ 分析完成</div>
            <div>AI预算分析已生成</div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              请查看下方分析结果
            </div>
          </div>
        ),
        duration: 3,
      });
    } catch (error: any) {
      console.error('❌ AI分析失败:', error);
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
      });

      let errorTip = '';
      if (error.message.includes('未配置')) {
        errorTip = '请先在设置页面配置 AI API Key';
      } else if (error.message.includes('quota')) {
        errorTip = 'API 配额已用完';
      } else if (error.message.includes('rate limit')) {
        errorTip = '请求过于频繁，请稍后再试';
      } else {
        errorTip = '请检查 AI 服务配置';
      }

      message.error({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>❌ AI分析失败</div>
            <div>{errorTip}</div>
            <div style={{ marginTop: 8, fontSize: 12 }}>
              <div>错误详情: {error.message}</div>
              <div style={{ marginTop: 4, opacity: 0.8 }}>
                • 请检查网络连接
              </div>
              <div style={{ opacity: 0.8 }}>
                • 请确认 AI 服务配置正确
              </div>
            </div>
          </div>
        ),
        duration: 8,
      });
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  // 获取分类图标
  const getCategoryIcon = (category: ExpenseCategory) => {
    const icons: Record<ExpenseCategory, React.ReactNode> = {
      transportation: <CarOutlined />,
      accommodation: <HomeOutlined />,
      food: <CoffeeOutlined />,
      attraction: <GiftOutlined />,
      shopping: <ShoppingOutlined />,
      other: <DollarOutlined />,
    };
    return icons[category] || <DollarOutlined />;
  };

  // 表格列定义
  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: ExpenseCategory) => (
        <Tag color={EXPENSE_CATEGORY_COLORS[category]} icon={getCategoryIcon(category)}>
          {EXPENSE_CATEGORIES[category]}
        </Tag>
      ),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number) => (
        <span style={{ fontWeight: 600, color: '#ff4d4f', fontSize: 14 }}>
          ¥{amount.toFixed(2)}
        </span>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: Expense) => (
        <Tooltip title="删除此费用记录">
          <Button
            type="text"
            danger
            size="middle"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteExpense(record)}
            style={{
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.background = '#fff1f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            删除
          </Button>
        </Tooltip>
      ),
    },
  ];

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <div style={{ marginBottom: 16 }}>
          <Space size="middle" wrap>
            <span style={{ fontWeight: 500, color: '#262626' }}>选择旅行计划:</span>
            <Select
              style={{ width: 300 }}
              value={selectedPlanId}
              onChange={setSelectedPlanId}
              placeholder="请选择旅行计划"
              size="large"
            >
              {plans.map((plan) => (
                <Option key={plan.id} value={plan.id}>
                  {plan.name} - {plan.destination}
                </Option>
              ))}
            </Select>

            {/* 优化后的添加费用按钮 */}
            <Tooltip
              title={
                !selectedPlanId
                  ? '请先选择一个旅行计划'
                  : '点击添加费用记录 (快捷键: Ctrl+K)'
              }
            >
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
                disabled={!selectedPlanId}
                style={{
                  height: 42,
                  paddingLeft: 20,
                  paddingRight: 20,
                  fontWeight: 600,
                  fontSize: 15,
                  boxShadow: !selectedPlanId ? 'none' : '0 2px 8px rgba(24, 144, 255, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
                  borderRadius: 6,
                }}
                onMouseEnter={(e) => {
                  if (selectedPlanId) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = !selectedPlanId ? 'none' : '0 2px 8px rgba(24, 144, 255, 0.3)';
                }}
              >
                添加费用
              </Button>
            </Tooltip>

            <Tooltip
              title={
                !selectedPlanId
                  ? '请先选择一个旅行计划'
                  : expenses.length === 0
                  ? '请先添加至少一笔费用记录，AI 才能进行预算分析'
                  : 'AI 将根据您的费用记录提供预算分析和建议'
              }
            >
              <Button
                size="large"
                onClick={handleAiAnalysis}
                disabled={!selectedPlanId || expenses.length === 0}
                icon={<InfoCircleOutlined />}
                style={{
                  height: 42,
                  borderRadius: 6,
                }}
              >
                AI预算分析
              </Button>
            </Tooltip>
          </Space>
        </div>

        {!selectedPlanId ? (
          <Card>
            <Empty description="请选择一个旅行计划" />
          </Card>
        ) : loading ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16, color: '#666' }}>加载中...</div>
            </div>
          </Card>
        ) : (
          <>
            {/* 预算概览 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="总预算"
                    value={selectedPlan?.budget || 0}
                    precision={2}
                    prefix="¥"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="已花费"
                    value={budgetAnalysis?.totalSpent || 0}
                    precision={2}
                    prefix="¥"
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="剩余预算"
                    value={budgetAnalysis?.remaining || 0}
                    precision={2}
                    prefix="¥"
                    valueStyle={{ color: budgetAnalysis && budgetAnalysis.remaining < 0 ? '#cf1322' : '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="预算使用率"
                    value={budgetAnalysis?.percentage || 0}
                    precision={1}
                    suffix="%"
                    valueStyle={{
                      color:
                        budgetAnalysis && budgetAnalysis.percentage > 100
                          ? '#cf1322'
                          : budgetAnalysis && budgetAnalysis.percentage > 80
                            ? '#faad14'
                            : '#3f8600',
                    }}
                  />
                  <Progress
                    percent={Math.min(budgetAnalysis?.percentage || 0, 100)}
                    status={
                      budgetAnalysis && budgetAnalysis.percentage > 100
                        ? 'exception'
                        : budgetAnalysis && budgetAnalysis.percentage > 80
                          ? 'active'
                          : 'normal'
                    }
                    showInfo={false}
                  />
                </Card>
              </Col>
            </Row>

            {expenses.length === 0 ? (
              <Card>
                <Empty
                  description={
                    <div>
                      <div style={{ fontSize: 16, color: '#8c8c8c', marginBottom: 8 }}>
                        暂无费用记录
                      </div>
                      <div style={{ fontSize: 13, color: '#bfbfbf' }}>
                        开始记录您的旅行支出，更好地管理预算
                      </div>
                    </div>
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={() => setModalVisible(true)}
                    style={{
                      height: 44,
                      paddingLeft: 32,
                      paddingRight: 32,
                      fontSize: 15,
                      fontWeight: 600,
                      borderRadius: 6,
                      boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(24, 144, 255, 0.3)';
                    }}
                  >
                    添加第一笔费用
                  </Button>
                </Empty>
              </Card>
            ) : (
              <>
                {/* 图表展示 */}
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  <Col xs={24} lg={12}>
                    <Card title="费用分类统计">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(props: any) => {
                              const { name, percent } = props;
                              return `${name} ${(percent * 100).toFixed(0)}%`;
                            }}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={EXPENSE_CATEGORY_COLORS[entry.category as ExpenseCategory]}
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value: number) => `¥${value.toFixed(2)}`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title="每日费用趋势">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dailyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip formatter={(value: number) => `¥${value.toFixed(2)}`} />
                          <Bar dataKey="total" fill="#1890ff" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                </Row>

                {/* 费用列表 */}
                <Card title="费用明细">
                  <Table
                    columns={columns}
                    dataSource={expenses}
                    rowKey="id"
                    pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
                  />
                </Card>
              </>
            )}
          </>
        )}

        {/* 添加费用对话框 */}
        <Modal
          title={
            <div style={{ fontSize: 18, fontWeight: 600, color: '#262626' }}>
              <PlusOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              添加费用记录
            </div>
          }
          open={modalVisible}
          onOk={handleAddExpense}
          onCancel={() => {
            if (!isSubmitting) {
              setModalVisible(false);
              form.resetFields();
              setShowVoiceInput(false);
              setVoiceInputField(null);
            }
          }}
          okText={isSubmitting ? '提交中...' : '确认添加'}
          cancelText="取消"
          confirmLoading={isSubmitting}
          maskClosable={!isSubmitting}
          closable={!isSubmitting}
          keyboard={!isSubmitting}
          centered
          width={640}
          okButtonProps={{
            size: 'large',
            style: {
              height: 40,
              paddingLeft: 24,
              paddingRight: 24,
              fontWeight: 600,
            }
          }}
          cancelButtonProps={{
            size: 'large',
            style: {
              height: 40,
              paddingLeft: 24,
              paddingRight: 24,
            }
          }}
        >
          {showVoiceInput ? (
            <VoiceInput
              onResult={handleVoiceResult}
              onCancel={() => {
                setShowVoiceInput(false);
                setVoiceInputField(null);
              }}
            />
          ) : (
            <Form form={form} layout="vertical">
              <Form.Item label="类别" name="category" rules={[{ required: true, message: '请选择类别' }]}>
                <Select placeholder="请选择费用类别">
                  {Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => (
                    <Option key={key} value={key}>
                      <Space>
                        {getCategoryIcon(key as ExpenseCategory)}
                        {label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="金额" name="amount" rules={[{ required: true, message: '请输入金额' }]}>
                <Space.Compact style={{ width: '100%' }}>
                  <InputNumber
                    style={{ flex: 1 }}
                    min={0}
                    precision={2}
                    prefix="¥"
                    placeholder="请输入金额"
                  />
                  <Button
                    icon={<AudioOutlined />}
                    onClick={() => {
                      setShowVoiceInput(true);
                      setVoiceInputField('amount');
                    }}
                    type="primary"
                    ghost
                  >
                    语音输入
                  </Button>
                </Space.Compact>
              </Form.Item>

              <Form.Item label="描述" name="description" rules={[{ required: true, message: '请输入描述' }]}>
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    style={{ flex: 1 }}
                    placeholder="例如：午餐、出租车费"
                  />
                  <Button
                    icon={<AudioOutlined />}
                    onClick={() => {
                      setShowVoiceInput(true);
                      setVoiceInputField('description');
                    }}
                    type="primary"
                    ghost
                  >
                    语音
                  </Button>
                </Space.Compact>
              </Form.Item>

              <Form.Item label="日期" name="date" rules={[{ required: true, message: '请选择日期' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item label="备注" name="notes">
                <Input.TextArea rows={3} placeholder="可选的备注信息" />
              </Form.Item>

              {/* 快捷语音输入提示 */}
              <Alert
                message="💡 语音输入提示"
                description={
                  <div>
                    <p style={{ margin: '4px 0' }}>• 说"午餐花了50块"会自动识别金额和类别</p>
                    <p style={{ margin: '4px 0' }}>• 说"出租车费30元"会自动填充</p>
                    <p style={{ margin: '4px 0' }}>• 说"门票80"会识别为景点费用</p>
                  </div>
                }
                type="info"
                showIcon
                style={{ marginTop: 16 }}
              />
            </Form>
          )}
        </Modal>

        {/* AI预算分析对话框 */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
              <span>AI 预算分析报告</span>
            </div>
          }
          open={aiAnalysisVisible}
          onCancel={() => setAiAnalysisVisible(false)}
          footer={[
            <Button key="close" onClick={() => setAiAnalysisVisible(false)}>
              关闭
            </Button>,
          ]}
          width={800}
        >
          {aiAnalysisLoading ? (
            <div style={{ padding: '20px 0' }}>
              <AILoadingIndicator
                message="AI 正在分析您的预算"
                estimatedTime={120}
                showProgress={true}
                tips={[
                  '💰 正在分析您的支出结构...',
                  '📊 正在计算预算健康度...',
                  '🔍 正在识别超支风险...',
                  '💡 正在生成优化建议...',
                  '✨ 即将完成分析...',
                ]}
              />
            </div>
          ) : aiAnalysisResult ? (
            <div>
              {/* 健康度评分 */}
              <Card style={{ marginBottom: 16, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: 16, marginBottom: 8, opacity: 0.9 }}>预算健康度</div>
                  <div style={{ fontSize: 48, fontWeight: 'bold', marginBottom: 8 }}>
                    {aiAnalysisResult.health_score}
                    <span style={{ fontSize: 24, marginLeft: 4 }}>分</span>
                  </div>
                  <Progress
                    percent={aiAnalysisResult.health_score}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                    showInfo={false}
                    style={{ marginBottom: 8 }}
                  />
                  <div style={{ fontSize: 14, opacity: 0.9 }}>
                    {aiAnalysisResult.health_score >= 90
                      ? '🎉 优秀！预算控制得很好'
                      : aiAnalysisResult.health_score >= 70
                      ? '👍 良好，继续保持'
                      : aiAnalysisResult.health_score >= 50
                      ? '⚠️ 警告，注意控制支出'
                      : '🚨 危险，严重超支'}
                  </div>
                </div>
              </Card>

              {/* 总结 */}
              <Alert
                message="分析总结"
                description={aiAnalysisResult.summary}
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              {/* 预警信息 */}
              {aiAnalysisResult.warnings && aiAnalysisResult.warnings.length > 0 && (
                <Alert
                  message="⚠️ 预算预警"
                  description={
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {aiAnalysisResult.warnings.map((warning: string, index: number) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  }
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}

              {/* 关键指标 */}
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="日均支出"
                      value={aiAnalysisResult.daily_average}
                      precision={2}
                      prefix="¥"
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="剩余预算"
                      value={aiAnalysisResult.remaining_budget}
                      precision={2}
                      prefix="¥"
                      valueStyle={{ color: aiAnalysisResult.remaining_budget > 0 ? '#52c41a' : '#cf1322' }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="建议日均预算"
                      value={aiAnalysisResult.recommended_daily_budget}
                      precision={2}
                      prefix="¥"
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={12}>
                  <Card>
                    <Statistic
                      title="已过天数"
                      value={aiAnalysisResult.days_passed}
                      suffix="天"
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card>
                    <Statistic
                      title="剩余天数"
                      value={aiAnalysisResult.days_remaining}
                      suffix="天"
                      valueStyle={{ color: '#13c2c2' }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* 各类别分析 */}
              {aiAnalysisResult.category_analysis && aiAnalysisResult.category_analysis.length > 0 && (
                <>
                  <Divider orientation="left">📊 各类别支出分析</Divider>
                  <div style={{ marginBottom: 16 }}>
                    {aiAnalysisResult.category_analysis.map((item: any, index: number) => {
                      const statusConfig = {
                        good: { color: '#52c41a', text: '健康', icon: '✅' },
                        warning: { color: '#faad14', text: '警告', icon: '⚠️' },
                        danger: { color: '#cf1322', text: '超支', icon: '🚨' },
                      };
                      const config = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.good;

                      return (
                        <Card key={index} style={{ marginBottom: 12 }} size="small">
                          <div style={{ marginBottom: 8 }}>
                            <Space>
                              {getCategoryIcon(item.category as ExpenseCategory)}
                              <span style={{ fontWeight: 'bold', fontSize: 16 }}>
                                {item.category_name}
                              </span>
                              <Tag color={config.color}>
                                {config.icon} {config.text}
                              </Tag>
                            </Space>
                          </div>
                          <Progress
                            percent={item.percentage}
                            strokeColor={config.color}
                            format={(percent) => `${percent}%`}
                            style={{ marginBottom: 8 }}
                          />
                          <Row gutter={16} style={{ marginBottom: 8 }}>
                            <Col span={8}>
                              <div style={{ fontSize: 12, color: '#666' }}>已花费</div>
                              <div style={{ fontSize: 16, fontWeight: 'bold', color: config.color }}>
                                ¥{item.spent.toFixed(2)}
                              </div>
                            </Col>
                            <Col span={8}>
                              <div style={{ fontSize: 12, color: '#666' }}>建议预算</div>
                              <div style={{ fontSize: 16, fontWeight: 'bold' }}>¥{item.budget.toFixed(2)}</div>
                            </Col>
                            <Col span={8}>
                              <div style={{ fontSize: 12, color: '#666' }}>占比</div>
                              <div style={{ fontSize: 16, fontWeight: 'bold' }}>{item.percentage}%</div>
                            </Col>
                          </Row>
                          <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
                            💡 {item.suggestion}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </>
              )}

              {/* 优化建议 */}
              {aiAnalysisResult.suggestions && aiAnalysisResult.suggestions.length > 0 && (
                <>
                  <Divider orientation="left">💡 优化建议</Divider>
                  <Card style={{ marginBottom: 16 }}>
                    <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 2 }}>
                      {aiAnalysisResult.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} style={{ fontSize: 14 }}>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </>
              )}

              {/* 预测总费用 */}
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                    按当前消费趋势预测总费用
                  </div>
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 'bold',
                      color: aiAnalysisResult.predicted_total > (selectedPlan?.budget || 0) ? '#cf1322' : '#52c41a',
                    }}
                  >
                    ¥{aiAnalysisResult.predicted_total.toFixed(2)}
                  </div>
                  {aiAnalysisResult.predicted_total > (selectedPlan?.budget || 0) && (
                    <div style={{ marginTop: 8, color: '#cf1322' }}>
                      ⚠️ 预计超出预算 ¥
                      {(aiAnalysisResult.predicted_total - (selectedPlan?.budget || 0)).toFixed(2)}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ) : null}
        </Modal>
      </Content>
    </div>
  );
};

export default Budget;

