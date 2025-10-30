import { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Space, Avatar, Spin, message } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined, AudioOutlined } from '@ant-design/icons';
import { chatWithAI, generateTravelPlan } from '../../services/llm';
import VoiceInput from '../VoiceInput';
import './index.css';

const { TextArea } = Input;

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatInterfaceProps {
  onPlanGenerated?: (plan: any) => void;
  placeholder?: string;
  showVoiceInput?: boolean;
}

// 旅行信息收集状态
interface TravelInfo {
  destination?: string;
  startDate?: string;
  days?: number;
  budget?: number;
  travelers?: number;
  departureCity?: string;
  preferences?: string[];
}

// 信息收集阶段
type CollectionStage =
  | 'destination'
  | 'startDate'
  | 'days'
  | 'budget'
  | 'travelers'
  | 'departureCity'
  | 'preferences'
  | 'complete';

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onPlanGenerated,
  placeholder = '请描述您的旅行需求，例如：我想去日本，5天，预算1万元，喜欢美食和动漫...',
  showVoiceInput = true,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '您好！我是您的AI旅行规划助手。请告诉我您的旅行需求，我会为您生成详细的行程计划。\n\n您可以直接告诉我完整的需求，或者我可以一步步引导您完成信息收集。',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 旅行信息收集状态
  const [travelInfo, setTravelInfo] = useState<TravelInfo>({});
  const [collectionStage, setCollectionStage] = useState<CollectionStage | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 发送消息
  const handleSend = async () => {
    if (!inputValue.trim()) {
      message.warning({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>⚠️ 输入为空</div>
            <div>请输入您的旅行需求</div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
              例如：我想去日本，5天，预算1万元
            </div>
          </div>
        ),
        duration: 4,
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setLoading(true);

    try {
      // 如果正在收集信息
      if (isCollecting && collectionStage) {
        await handleCollectionResponse(currentInput);
        return;
      }

      // 尝试从用户输入中提取所有信息
      const extractedInfo: TravelInfo = {
        destination: extractDestination(currentInput),
        startDate: extractStartDate(currentInput),
        days: extractDays(currentInput),
        budget: extractBudget(currentInput),
        travelers: extractTravelers(currentInput),
        departureCity: extractDepartureCity(currentInput),
        preferences: extractPreferences(currentInput),
      };

      // 检查是否是旅行规划请求
      const isTravelRequest = /想去|计划|旅行|行程|预算|天|出发/.test(currentInput);

      if (isTravelRequest) {
        // 合并已收集的信息
        const mergedInfo: TravelInfo = {
          ...travelInfo,
          ...Object.fromEntries(
            Object.entries(extractedInfo).filter(([_, v]) => v !== null && v !== undefined)
          ),
        };

        setTravelInfo(mergedInfo);

        // 检查是否有缺失信息
        const missingStage = checkMissingInfo(mergedInfo);

        if (missingStage) {
          // 开始信息收集流程
          setIsCollecting(true);
          setCollectionStage(missingStage);

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `好的！为了给您生成更合适的行程，我需要了解一些信息。\n\n${getNextQuestion(missingStage)}`,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, assistantMessage]);
        } else {
          // 信息完整，生成行程
          await generatePlan(mergedInfo, currentInput);
        }
      } else {
        // 普通对话
        const response = await chatWithAI(currentInput, getConversationContext());
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error: any) {
      console.error('AI服务错误:', error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // 处理信息收集阶段的回复
  const handleCollectionResponse = async (input: string) => {
    if (!collectionStage) return;

    const updatedInfo = { ...travelInfo };
    let extractedValue: any = null;

    // 根据当前阶段提取信息
    switch (collectionStage) {
      case 'destination':
        extractedValue = extractDestination(input);
        if (extractedValue) updatedInfo.destination = extractedValue;
        break;
      case 'startDate':
        extractedValue = extractStartDate(input);
        if (extractedValue) updatedInfo.startDate = extractedValue;
        break;
      case 'days':
        extractedValue = extractDays(input);
        if (extractedValue) updatedInfo.days = extractedValue;
        break;
      case 'budget':
        extractedValue = extractBudget(input);
        if (extractedValue) updatedInfo.budget = extractedValue;
        break;
      case 'travelers':
        extractedValue = extractTravelers(input);
        if (extractedValue) updatedInfo.travelers = extractedValue;
        break;
      case 'departureCity':
        extractedValue = extractDepartureCity(input);
        if (extractedValue) updatedInfo.departureCity = extractedValue;
        break;
      case 'preferences':
        extractedValue = extractPreferences(input);
        if (extractedValue && extractedValue.length > 0) {
          updatedInfo.preferences = extractedValue;
        }
        break;
    }

    // 如果提取失败，提示用户重新输入
    if (!extractedValue || (Array.isArray(extractedValue) && extractedValue.length === 0)) {
      const retryMessages: Record<CollectionStage, string> = {
        destination: '抱歉，我没有理解您的目的地。请直接输入城市或国家名称，例如："东京"、"巴黎"、"北京"',
        startDate: '抱歉，我没有理解出发日期。请告诉我具体日期，例如："明天"、"后天"、"2025年11月1日"',
        days: '抱歉，我没有理解天数。请直接输入数字，例如："5" 或 "7天"',
        budget: '抱歉，我没有理解预算。请直接输入数字，例如："5000" 或 "1万"',
        travelers: '抱歉，我没有理解人数。请直接输入数字，例如："2" 或 "3人"',
        departureCity: '抱歉，我没有理解出发城市。请直接输入城市名称，例如："北京"、"上海"、"广州"',
        preferences: '好的，没有特别偏好。我会为您安排综合性的行程。',
        complete: '',
      };

      const retryMessage = retryMessages[collectionStage];
      if (retryMessage) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: retryMessage,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setLoading(false);

        // 如果是偏好，即使提取失败也继续（设置默认值）
        if (collectionStage === 'preferences') {
          updatedInfo.preferences = ['综合体验'];
          setTravelInfo(updatedInfo);
          // 继续下一步
          const nextMissing = checkMissingInfo(updatedInfo);
          if (!nextMissing) {
            await finishCollection(updatedInfo, input);
          }
        }
        return;
      }
    }

    setTravelInfo(updatedInfo);

    // 检查下一个缺失的信息
    const nextMissing = checkMissingInfo(updatedInfo);

    if (nextMissing) {
      // 继续收集
      setCollectionStage(nextMissing);

      let confirmMessage = '';
      // 确认当前收集的信息
      if (collectionStage === 'destination' && updatedInfo.destination) {
        confirmMessage = `好的，目的地是${updatedInfo.destination}。\n\n`;
      } else if (collectionStage === 'startDate' && updatedInfo.startDate) {
        confirmMessage = `好的，出发日期是${formatDate(updatedInfo.startDate)}。\n\n`;
      } else if (collectionStage === 'days' && updatedInfo.days) {
        confirmMessage = `好的，${updatedInfo.days}天的行程。\n\n`;
      } else if (collectionStage === 'budget' && updatedInfo.budget) {
        confirmMessage = `好的，预算${updatedInfo.budget}元。\n\n`;
      } else if (collectionStage === 'travelers' && updatedInfo.travelers) {
        confirmMessage = `好的，${updatedInfo.travelers}位同行。\n\n`;
      } else if (collectionStage === 'departureCity' && updatedInfo.departureCity) {
        confirmMessage = `好的，从${updatedInfo.departureCity}出发。\n\n`;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: confirmMessage + getNextQuestion(nextMissing),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setLoading(false);
    } else {
      // 信息收集完成
      await finishCollection(updatedInfo, input);
    }
  };

  // 完成信息收集并生成行程
  const finishCollection = async (info: TravelInfo, userInput: string) => {
    setIsCollecting(false);
    setCollectionStage(null);

    const summaryMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `太好了！信息已收集完成：\n\n📍 目的地：${info.destination}\n📅 出发日期：${formatDate(info.startDate!)}\n⏰ 行程天数：${info.days}天\n💰 预算：${info.budget}元\n👥 同行人数：${info.travelers}人\n✈️ 出发城市：${info.departureCity}\n🎯 旅行偏好：${info.preferences?.join('、')}\n\n正在为您生成详细的行程计划，请稍候...`,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, summaryMessage]);

    // 生成行程
    await generatePlan(info, userInput);
  };

  // 生成旅行计划
  const generatePlan = async (info: TravelInfo, userInput: string) => {
    try {
      console.log('🎯 生成旅行计划，信息:', info);

      const result = await generateTravelPlan({
        destination: info.destination!,
        days: info.days!,
        budget: info.budget!,
        travelers: info.travelers!,
        preferences: info.preferences || [],
        startDate: info.startDate!,
        userInput,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `✅ 行程生成成功！\n\n我为您生成了${info.destination}的${info.days}天行程计划（${formatDate(startDate)}出发）。\n\n${result.suggestions}\n\n详细行程已显示在右侧，您可以查看每日的具体安排。`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // 通知父组件
      if (onPlanGenerated) {
        onPlanGenerated(result);
      }

      // 重置收集状态
      setTravelInfo({});
      setIsCollecting(false);
      setCollectionStage(null);
    } catch (error) {
      throw error;
    }
  };

  // 错误处理
  const handleError = (error: any) => {
    let errorTip = '';
    if (error.message.includes('未配置')) {
      errorTip = '请先在设置页面配置 AI API Key';
    } else if (error.message.includes('quota')) {
      errorTip = 'API 配额已用完，请充值或更换 Key';
    } else if (error.message.includes('rate limit')) {
      errorTip = '请求过于频繁，请稍后再试';
    } else if (error.message.includes('Invalid API key')) {
      errorTip = 'API Key 无效，请检查配置';
    } else {
      errorTip = '请检查网络连接和 AI 服务配置';
    }

    message.error({
      content: (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>❌ AI 服务错误</div>
          <div>{errorTip}</div>
          <div style={{ marginTop: 8, fontSize: 12 }}>
            <div>错误详情: {error.message}</div>
            <div style={{ marginTop: 4, opacity: 0.8 }}>
              • 请检查设置页面的 AI 配置
            </div>
            <div style={{ opacity: 0.8 }}>
              • 或稍后重试
            </div>
          </div>
        </div>
      ),
      duration: 8,
    });

    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `抱歉，AI服务暂时无法响应。\n\n${errorTip}\n\n请检查配置后重试。`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, errorMessage]);
  };

  // 获取对话上下文
  const getConversationContext = () => {
    return messages
      .slice(-5)
      .map((m) => `${m.role === 'user' ? '用户' : 'AI'}: ${m.content}`)
      .join('\n');
  };

  // 获取明天的日期
  const getTomorrowDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // 格式化日期显示
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  // 检查信息完整性并返回缺失的字段
  const checkMissingInfo = (info: TravelInfo): CollectionStage | null => {
    if (!info.destination) return 'destination';
    if (!info.startDate) return 'startDate';
    if (!info.days) return 'days';
    if (!info.budget) return 'budget';
    if (!info.travelers) return 'travelers';
    if (!info.departureCity) return 'departureCity';
    if (!info.preferences || info.preferences.length === 0) return 'preferences';
    return null;
  };

  // 获取下一个问题
  const getNextQuestion = (stage: CollectionStage): string => {
    const questions: Record<CollectionStage, string> = {
      destination: '请问您想去哪里旅行呢？🌍',
      startDate: '请问您计划什么时候出发？（如果不确定，我会默认为明天出发）📅',
      days: '请问您计划旅行几天？⏰',
      budget: '请问您的预算大概是多少？（单位：元）💰',
      travelers: '请问有几位同行？（包括您自己）👥',
      departureCity: '请问您从哪个城市出发？✈️',
      preferences: '请问您对这次旅行有什么特别的偏好吗？（如美食、文化、自然风光、购物等，可以说"没有特别偏好"）🎯',
      complete: '',
    };
    return questions[stage];
  };

  // 提取目的地
  const extractDestination = (text: string): string | null => {
    const trimmedText = text.trim();

    // 先尝试匹配带关键词的模式
    const patterns = [
      /去([^\s，,。.！!？?]+)/,
      /到([^\s，,。.！!？?]+)/,
      /想去([^\s，,。.！!？?]+)/,
      /目的地[是:]?([^\s，,。.！!？?]+)/,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }

    // 如果用户直接输入目的地（2-20个字符）
    if (trimmedText.length >= 2 && trimmedText.length <= 20) {
      // 排除一些明显不是目的地的输入
      const excludePatterns = /^(是|的|了|吗|呢|啊|哦|好|对|不|没|有)$/;
      if (!excludePatterns.test(trimmedText)) {
        return trimmedText;
      }
    }

    return null;
  };

  // 提取出发日期
  const extractStartDate = (text: string): string | null => {
    const trimmedText = text.trim();

    // 匹配"明天"、"后天"等相对日期
    if (/明天|明日/.test(text)) {
      return getTomorrowDate();
    }
    if (/后天/.test(text)) {
      const date = new Date();
      date.setDate(date.getDate() + 2);
      return date.toISOString().split('T')[0];
    }
    if (/大后天/.test(text)) {
      const date = new Date();
      date.setDate(date.getDate() + 3);
      return date.toISOString().split('T')[0];
    }

    // 匹配"今天"（虽然不太可能当天出发，但支持一下）
    if (/今天|今日/.test(text)) {
      const today = new Date();
      return today.toISOString().split('T')[0];
    }

    // 匹配具体日期格式：2025年11月1日、2025-11-1、2025/11/1
    const dateMatch = text.match(/(\d{4})[年\-/](\d{1,2})[月\-/](\d{1,2})/);
    if (dateMatch) {
      const [, year, month, day] = dateMatch;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // 匹配简化格式：11月1日、11-1、11/1（默认当前年份）
    const shortDateMatch = text.match(/(\d{1,2})[月\-/](\d{1,2})/);
    if (shortDateMatch) {
      const [, month, day] = shortDateMatch;
      const year = new Date().getFullYear();
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    return null;
  };

  // 提取天数
  const extractDays = (text: string): number | null => {
    // 先尝试匹配纯数字
    const pureNumberMatch = text.trim().match(/^(\d+)$/);
    if (pureNumberMatch) {
      const num = parseInt(pureNumberMatch[1]);
      if (num > 0 && num <= 365) return num; // 合理范围
    }

    // 匹配带"天"的数字
    const match = text.match(/(\d+)\s*天/);
    if (match) {
      const num = parseInt(match[1]);
      if (num > 0 && num <= 365) return num;
    }

    return null;
  };

  // 提取预算
  const extractBudget = (text: string): number | null => {
    // 先尝试匹配纯数字
    const pureNumberMatch = text.trim().match(/^(\d+)$/);
    if (pureNumberMatch) {
      const num = parseInt(pureNumberMatch[1]);
      if (num >= 100) return num; // 预算至少100元
    }

    // 匹配带单位或关键词的数字
    const patterns = [
      /预算\s*(\d+)/,
      /(\d+)\s*元/,
      /(\d+)\s*块/,
      /(\d+)\s*万/,
      /大概\s*(\d+)/,
      /约\s*(\d+)/,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let num = parseInt(match[1]);
        // 如果是"万"，转换为元
        if (/万/.test(text)) {
          num = num * 10000;
        }
        if (num >= 100) return num;
      }
    }
    return null;
  };

  // 提取人数
  const extractTravelers = (text: string): number | null => {
    // 先尝试匹配纯数字（最常见的回答方式）
    const pureNumberMatch = text.trim().match(/^(\d+)$/);
    if (pureNumberMatch) {
      const num = parseInt(pureNumberMatch[1]);
      if (num > 0 && num <= 100) return num; // 合理范围
    }

    // 匹配带单位的数字
    const patterns = [
      /(\d+)\s*人/,
      /(\d+)\s*位/,
      /(\d+)\s*个人/,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const num = parseInt(match[1]);
        if (num > 0 && num <= 100) return num;
      }
    }

    // 特殊情况
    if (/一个人|独自|solo|就我|只有我/.test(text)) return 1;
    if (/两个人|俩人|情侣|夫妻|我俩/.test(text)) return 2;
    if (/三个人|仨人|三人/.test(text)) return 3;
    if (/四个人|四人/.test(text)) return 4;

    return null;
  };

  // 提取出发城市
  const extractDepartureCity = (text: string): string | null => {
    const trimmedText = text.trim();

    // 常见城市列表（用于验证）
    const commonCities = [
      '北京', '上海', '广州', '深圳', '成都', '杭州', '重庆', '武汉', '西安', '天津',
      '南京', '苏州', '长沙', '郑州', '沈阳', '青岛', '宁波', '厦门', '济南', '哈尔滨',
      '福州', '长春', '石家庄', '合肥', '昆明', '太原', '南昌', '贵阳', '南宁', '兰州',
      '海口', '银川', '西宁', '呼和浩特', '乌鲁木齐', '拉萨', '香港', '澳门', '台北'
    ];

    // ⚠️ 排除"想去"、"去"等表示目的地的关键词
    // 避免将"我想去北京"误识别为出发城市
    if (/想去|要去|打算去|计划去/.test(text)) {
      return null;
    }

    // 先尝试匹配带明确关键词的模式（优先级高）
    const patterns = [
      /从([^\s，,。.！!？?]+)出发/,           // "从北京出发"
      /出发地[是:]?([^\s，,。.！!？?]+)/,    // "出发地是北京"
      /出发城市[是:]?([^\s，,。.！!？?]+)/,  // "出发城市是北京"
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }

    // 如果用户直接输入城市名（不超过10个字符，且在常见城市列表中）
    if (trimmedText.length <= 10 && trimmedText.length >= 2) {
      // 检查是否在常见城市列表中
      if (commonCities.some(city => trimmedText.includes(city) || city.includes(trimmedText))) {
        return trimmedText;
      }
      // 如果包含"市"、"省"等关键词，也认为是城市
      if (/市|省|自治区|特别行政区/.test(trimmedText)) {
        return trimmedText;
      }
      // 如果是纯中文且长度合理，也认为可能是城市
      if (/^[\u4e00-\u9fa5]+$/.test(trimmedText)) {
        return trimmedText;
      }
    }

    return null;
  };

  // 提取偏好
  const extractPreferences = (text: string): string[] => {
    const preferences: string[] = [];
    if (/美食|吃|餐厅|小吃/.test(text)) preferences.push('美食');
    if (/购物|买|商场/.test(text)) preferences.push('购物');
    if (/历史|文化|古迹|博物馆/.test(text)) preferences.push('历史文化');
    if (/自然|风景|山|海|湖/.test(text)) preferences.push('自然风光');
    if (/动漫|二次元|ACG/.test(text)) preferences.push('动漫');
    if (/亲子|孩子|儿童/.test(text)) preferences.push('亲子');
    if (/摄影|拍照/.test(text)) preferences.push('摄影');
    if (/休闲|放松|度假/.test(text)) preferences.push('休闲度假');

    // 如果没有特别偏好
    if (/没有|无|随便|都可以/.test(text) && preferences.length === 0) {
      preferences.push('综合体验');
    }

    return preferences;
  };

  // 语音输入回调
  const handleVoiceResult = (text: string) => {
    setInputValue(text);
    setShowVoice(false);
  };

  // 按 Enter 发送
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-interface">
      <Card
        className="custom-card chat-card"
        title={
          <div style={{ fontSize: 18, fontWeight: 600, color: '#262626' }}>
            💬 AI 旅行助手
          </div>
        }
        styles={{ body: { padding: 0, height: '100%' } }}
      >
        {/* 消息列表 */}
        <div className="messages-container">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-item ${msg.role}`}>
              <Avatar
                icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                className={`message-avatar ${msg.role}`}
                size={40}
              />
              <div className="message-content">
                <div className="message-text">{msg.content}</div>
                <div className="message-time">
                  {msg.timestamp.toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="message-item assistant">
              <Avatar icon={<RobotOutlined />} className="message-avatar assistant" size={40} />
              <div className="message-content">
                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: 'white', borderRadius: 8 }}>
                  <Spin size="small" />
                  <span style={{ marginLeft: 12, color: '#666', fontSize: 14 }}>AI 正在思考...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="input-container">
          {showVoice ? (
            <VoiceInput
              onResult={handleVoiceResult}
              onCancel={() => setShowVoice(false)}
            />
          ) : (
            <Space.Compact style={{ width: '100%', gap: 8 }}>
              <TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                autoSize={{ minRows: 2, maxRows: 4 }}
                disabled={loading}
                style={{
                  borderRadius: 8,
                  fontSize: 14,
                  flex: 1,
                }}
              />
              {showVoiceInput && (
                <Button
                  icon={<AudioOutlined />}
                  onClick={() => setShowVoice(true)}
                  disabled={loading}
                  size="large"
                  style={{
                    borderRadius: 8,
                    width: 48,
                    height: 48,
                  }}
                />
              )}
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                loading={loading}
                size="large"
                style={{
                  borderRadius: 8,
                  height: 48,
                  padding: '0 24px',
                  fontWeight: 500,
                }}
              >
                发送
              </Button>
            </Space.Compact>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ChatInterface;

