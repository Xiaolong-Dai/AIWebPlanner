import axios from 'axios';
import { useApiConfigStore } from '../store/apiConfigStore';
import type { TravelPlan, DayItinerary } from '../types/common';

/**
 * AI 大语言模型服务
 * 使用阿里云通义千问（百炼平台）
 */

/**
 * 获取 LLM API 配置
 */
const getLLMConfig = () => {
  const { config } = useApiConfigStore.getState();
  const apiKey = config.llm_api_key || import.meta.env.VITE_ALIYUN_LLM_API_KEY;
  const endpoint = config.llm_endpoint || import.meta.env.VITE_ALIYUN_LLM_ENDPOINT;

  if (!apiKey || !endpoint) {
    throw new Error('LLM API 未配置，请在设置页面配置');
  }

  return { apiKey, endpoint };
};

/**
 * 调用 LLM API (支持多种AI服务)
 */
const callLLM = async (prompt: string, systemPrompt?: string): Promise<string> => {
  const { apiKey, endpoint } = getLLMConfig();

  // 检测AI服务类型
  const isOpenAI = endpoint.includes('openai.com');
  const isBaidu = endpoint.includes('baidu');
  const isAliyun = endpoint.includes('aliyun') || endpoint.includes('bailian');

  try {
    // 构建消息数组
    const messages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      { role: 'user', content: prompt },
    ];

    // 根据不同服务构建请求体
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let requestBody: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const headers: any = {
      'Content-Type': 'application/json',
    };
    let apiEndpoint = endpoint;

    if (isOpenAI) {
      // OpenAI 格式 - 直接调用
      requestBody = {
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
        max_tokens: 4000, // 增加最大token数以支持更长的回复
      };
      headers.Authorization = `Bearer ${apiKey}`;
    } else if (isBaidu) {
      // 百度文心一言格式 - 直接调用
      requestBody = {
        messages: messages,
        temperature: 0.7,
        max_output_tokens: 4000, // 增加最大token数
      };
      headers.Authorization = `Bearer ${apiKey}`;
    } else if (isAliyun) {
      // 阿里云百炼 - 使用代理
      console.log('使用代理调用阿里云百炼API');

      // 使用后端代理
      // 通过nginx反向代理到后端服务
      // /api/llm-proxy -> http://backend:3001/api/llm-proxy
      const proxyUrl = '/api/llm-proxy';

      requestBody = {
        prompt,
        systemPrompt,
        apiKey,
        endpoint,
      };
      apiEndpoint = proxyUrl;
      // 不需要Authorization header，在代理中处理
      delete headers.Authorization;
    } else {
      // 其他服务 - 默认格式
      requestBody = {
        model: 'qwen-plus',
        input: {
          messages: messages,
        },
        parameters: {
          result_format: 'message',
          temperature: 0.7,
          top_p: 0.8,
          max_tokens: 4000, // 增加最大token数
        },
      };
      headers.Authorization = `Bearer ${apiKey}`;
    }

    console.log('调用AI服务:', {
      endpoint: apiEndpoint,
      isOpenAI,
      isBaidu,
      isAliyun,
      useProxy: isAliyun
    });

    const response = await axios.post(apiEndpoint, requestBody, {
      headers,
      timeout: 300000, // 300秒超时 (5分钟)
      // 添加重试配置
      validateStatus: (status) => status < 500, // 只有5xx错误才抛出异常
    });

    // 根据不同服务解析响应
    let content: string | null = null;

    if (isOpenAI) {
      // OpenAI 响应格式
      content = response.data?.choices?.[0]?.message?.content;
    } else if (isBaidu) {
      // 百度响应格式
      content = response.data?.result;
    } else {
      // 阿里云百炼响应格式
      content = response.data?.output?.choices?.[0]?.message?.content;
    }

    if (content) {
      console.log('✅ AI响应成功，内容长度:', content.length);
      console.log('📝 AI响应内容预览:', content.substring(0, 200) + '...');
      return content;
    }

    console.error('❌ AI响应格式错误:', {
      hasData: !!response.data,
      hasOutput: !!response.data?.output,
      hasChoices: !!response.data?.output?.choices,
      responseKeys: Object.keys(response.data || {}),
      fullResponse: JSON.stringify(response.data).substring(0, 500)
    });
    throw new Error('AI 响应格式错误，请检查控制台日志');
  } catch (error: any) {
    console.error('LLM API 调用失败:', error);

    // 详细的错误处理
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new Error('AI服务响应超时，请稍后重试。如果问题持续，请尝试减少请求内容或联系管理员');
    }
    if (error.response?.status === 401) {
      throw new Error('API Key 无效，请检查配置');
    }
    if (error.response?.status === 429) {
      throw new Error('API 请求频率过高，请稍后再试');
    }
    if (error.response?.status === 403) {
      throw new Error('API 配额已用完，请充值或更换 Key');
    }
    if (error.response?.status === 504) {
      throw new Error('AI服务响应超时，请稍后重试');
    }
    if (error.message === 'Network Error') {
      throw new Error('网络错误，请检查网络连接或代理服务器是否正常');
    }
    if (error.response?.data?.error) {
      throw new Error(`AI服务错误: ${error.response.data.error}`);
    }

    throw new Error(`AI 服务调用失败: ${error.message}`);
  }
};

/**
 * 提取用户输入中的具体景点
 */
const extractSpecificAttractions = (text: string): string[] => {
  const attractions: string[] = [];

  // 常见景点关键词模式
  const patterns = [
    /(?:去|到|看|参观|游览|访问)([^，。、,.\s]{2,10}(?:寺|塔|山|湖|宫|殿|城|楼|馆|园|岛|桥|广场|公园|景区|遗址|故居))/g,
    /([^，。、,.\s]{2,10}(?:寺|塔|山|湖|宫|殿|城|楼|馆|园|岛|桥|广场|公园|景区|遗址|故居))/g,
  ];

  patterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const attraction = match[1] || match[0];
      if (attraction && !attractions.includes(attraction)) {
        attractions.push(attraction);
      }
    }
  });

  // 特殊景点名称（不含后缀）
  const specialAttractions = [
    '浅草寺', '东京塔', '晴空塔', '富士山', '清水寺', '金阁寺', '银阁寺',
    '埃菲尔铁塔', '卢浮宫', '凯旋门', '自由女神像', '时代广场',
    '大本钟', '伦敦眼', '白金汉宫', '天安门', '故宫', '长城',
  ];

  specialAttractions.forEach(name => {
    if (text.includes(name) && !attractions.includes(name)) {
      attractions.push(name);
    }
  });

  console.log('🎯 提取到的具体景点:', attractions);
  return attractions;
};

/**
 * 生成旅行计划
 */
export const generateTravelPlan = async (params: {
  destination: string;
  days: number;
  budget: number;
  travelers: number;
  preferences: string[];
  startDate?: string;
  userInput?: string; // 新增：用户原始输入
}): Promise<{ destination: string; itinerary: DayItinerary[]; suggestions: string; budget?: number; travelers?: number; preferences?: string[] }> => {
  // 提取用户指定的具体景点
  const specificAttractions = params.userInput ? extractSpecificAttractions(params.userInput) : [];

  const systemPrompt = `你是一个专业的旅行规划助手。请根据用户需求生成详细的旅行计划。
要求：
1. 必须直接返回纯 JSON 对象，不要包含任何 markdown 标记（如 \`\`\`json）
2. 不要对 JSON 进行转义，直接返回原始 JSON 对象
3. JSON 中的字符串值可以包含中文，但不要使用转义的引号
4. 包含每日详细行程
5. 包含交通、住宿、餐饮、景点推荐
6. 考虑时间安排的合理性
7. 提供预算建议
8. 确保返回的内容可以被 JSON.parse() 直接解析

⚠️ 重要坐标要求：
- 每个景点(attraction)、餐厅(restaurant)、住宿(accommodation)都必须包含 coordinates 字段
- coordinates 格式必须是数组: [经度, 纬度]，例如: [116.397428, 39.90923]
- 经度在前，纬度在后
- 坐标必须是真实的地理坐标，不能是虚假数据
- 如果不确定坐标，请使用该城市的知名地标坐标

💰 重要价格要求：
- 所有价格字段（ticket_price、cost、price_per_night、price_per_person）必须是数字类型
- 免费的景点/活动，ticket_price 和 cost 必须设置为 0（数字零），不要省略这些字段
- 例如：天安门广场、公园等免费景点，必须写 "ticket_price": 0, "cost": 0
- 付费景点必须提供真实的门票价格
- 不要使用字符串 "免费"，必须使用数字 0

🚗 重要交通规划要求（新增）：
- 每两个相邻活动（景点、餐厅、购物等）之间必须插入一个交通活动（type: "transport"）
- 交通方式选择规则：
  * 步行距离 < 1km：使用"步行"
  * 1km ≤ 距离 < 3km：使用"地铁"或"公交"
  * 距离 ≥ 3km：使用"地铁"、"公交"或"出租车"
- 交通活动必须包含以下字段：
  * id: 唯一标识（如"trans1"）
  * type: "transport"（固定值）
  * name: 交通描述（如"前往景山公园"）
  * from: 出发地点名称
  * to: 目的地点名称
  * method: 交通方式（步行、地铁、公交、出租车、网约车）
  * details: 具体路线（如"地铁1号线，天安门东站→王府井站，2站"或"从故宫北门出，步行约5分钟"）
  * start_time: 出发时间（与上一个活动的end_time一致）
  * end_time: 到达时间
  * duration: 预计时间（如"15分钟"）
  * cost: 预计费用（数字类型，步行为0，地铁2-5元，公交1-2元，出租车起步价13元）
  * description: 交通说明（如"步行前往景山公园"或"乘坐地铁8号线前往王府井"）
- 交通时间要合理，考虑等车、换乘时间：
  * 步行：按5km/h计算
  * 地铁：包含等车5分钟 + 乘车时间 + 换乘时间
  * 公交：包含等车10分钟 + 乘车时间
  * 出租车：按实际路况估算
- 交通费用要真实：
  * 步行：0元
  * 地铁：2-5元（根据距离）
  * 公交：1-2元
  * 出租车：起步价13元 + 里程费
  * 网约车：比出租车略贵10-20%

🍴 餐饮安排要求（重要）：
- 每天必须包含 meals 数组，至少包含午餐(lunch)和晚餐(dinner)
- 早餐(breakfast)可选，如果酒店包含早餐则不需要单独列出
- 每个餐饮项必须包含以下字段：
  * type: "breakfast"（早餐）、"lunch"（午餐）、"dinner"（晚餐）或"snack"（小吃）
  * name: 餐厅名称（必填，不能为空）
  * restaurant: 餐厅全称（可与name相同）
  * address: 详细地址（必填）
  * location: 坐标对象 { lat: 纬度, lng: 经度 }（必填）
  * cuisine: 菜系类型（如"川菜"、"日料"、"西餐"、"火锅"等）
  * price_per_person: 人均消费（数字类型，必填）
  * rating: 评分（可选，1-5分）
- 餐厅选择要求：
  * 优先选择当地特色餐厅和知名餐厅
  * 考虑用户的饮食偏好
  * 价格要符合预算
  * 位置要在当天行程路线附近，方便就餐
- 餐饮时间安排：
  * 午餐：11:30-13:30
  * 晚餐：17:30-20:00
  * 小吃：可穿插在行程中

✈️ 城际交通要求（新增）：
- 第一天必须包含从出发地到目的地的交通信息（如果用户提供了出发地）
- 最后一天必须包含从目的地返回出发地的交通信息
- 城际交通信息放在 transportation 数组中，包含以下字段：
  * type: "flight"（飞机）或 "train"（高铁/火车）
  * flight_number 或 train_number: 车次号（参考，如"CA1234"、"G123"）
  * from: 出发机场/车站全称（如"上海虹桥机场"、"北京南站"）
  * to: 到达机场/车站全称
  * from_coordinates: 出发地坐标 [经度, 纬度]（必须提供准确坐标）
  * to_coordinates: 目的地坐标 [经度, 纬度]（必须提供准确坐标）
  * departure_time: 出发时间（如"08:00"）
  * arrival_time: 到达时间（如"10:30"）
  * duration: 飞行/行驶时间（如"2小时30分钟"）
  * price: 参考票价（数字类型）
  * notes: 注意事项（如"建议提前2小时到达机场"）
- 机场/车站坐标要求：
  * 必须使用真实的机场/车站坐标
  * 坐标格式: [经度, 纬度]，例如上海虹桥机场: [121.336319, 31.197875]
  * 常见机场坐标参考：
    - 北京首都机场: [116.584556, 40.080111]
    - 上海浦东机场: [121.805214, 31.143378]
    - 上海虹桥机场: [121.336319, 31.197875]
    - 广州白云机场: [113.298786, 23.392436]
    - 深圳宝安机场: [113.810833, 22.639444]
    - 成都双流机场: [103.947086, 30.578528]
    - 杭州萧山机场: [120.434453, 30.229503]
    - 东京成田机场: [140.386389, 35.764722]
    - 东京羽田机场: [139.781111, 35.553333]
    - 大阪关西机场: [135.244167, 34.434722]
- 票价要真实合理：
  * 国内航班：500-2000元（根据距离）
  * 国际航班：1000-5000元（根据距离）
  * 高铁：根据距离，100-1000元
  * 普通火车：根据距离，50-500元
- 时间安排要合理：
  * 飞机：建议早上8点左右出发，下午5点左右返回
  * 高铁：根据距离安排，避免太早或太晚

🎯 用户指定景点要求：
${specificAttractions.length > 0 ? `- 用户明确要求访问以下景点：${specificAttractions.join('、')}
- 请务必将这些景点纳入行程安排中，作为核心景点
- 这些景点的优先级最高，必须包含在行程中
- 在这些景点周围安排其他相关景点和活动` : '- 用户未指定具体景点，请根据目的地推荐热门景点'}

重要：直接返回 JSON 对象，不要返回 JSON 字符串的字符串形式！`;

  let userPrompt = `请为我规划一次旅行：
- 目的地：${params.destination}
- 天数：${params.days} 天
- 预算：${params.budget} 元
- 人数：${params.travelers} 人
- 偏好：${params.preferences.join('、')}
${params.startDate ? `- 出发日期：${params.startDate}` : ''}`;

  // 如果有具体景点，明确标注
  if (specificAttractions.length > 0) {
    userPrompt += `

🎯 必须包含的景点（用户明确要求）：
${specificAttractions.map((a, i) => `${i + 1}. ${a} - 请提供详细的游览安排、开放时间、门票价格、真实坐标`).join('\n')}

请确保在生成的行程中包含以上所有景点，并围绕这些景点安排周边的其他活动。`;
  }

  userPrompt += `

请返回以下 JSON 格式（注意 coordinates 和价格字段格式）：
{
  "destination": "目的地城市",
  "itinerary": [
    {
      "day": 1,
      "date": "2024-06-01",
      "theme": "主题",
      "summary": "当日概述",
      "activities": [
        {
          "id": "act1",
          "type": "attraction",
          "name": "故宫博物院",
          "address": "北京市东城区景山前街4号",
          "coordinates": [116.397428, 39.90923],
          "start_time": "09:00",
          "end_time": "12:00",
          "duration": "3小时",
          "ticket_price": 60,
          "cost": 60,
          "description": "中国明清两代的皇家宫殿",
          "opening_hours": "08:30-17:00",
          "tips": "建议提前网上购票"
        },
        {
          "id": "trans1",
          "type": "transport",
          "name": "前往景山公园",
          "from": "故宫博物院",
          "to": "景山公园",
          "method": "步行",
          "details": "从故宫北门出，步行约5分钟",
          "start_time": "12:00",
          "end_time": "12:05",
          "duration": "5分钟",
          "cost": 0,
          "description": "步行前往景山公园"
        },
        {
          "id": "act2",
          "type": "attraction",
          "name": "景山公园",
          "address": "北京市西城区景山西街44号",
          "coordinates": [116.395, 39.928],
          "start_time": "12:05",
          "end_time": "13:00",
          "duration": "55分钟",
          "ticket_price": 2,
          "cost": 2,
          "description": "登高俯瞰故宫全景",
          "opening_hours": "06:30-21:00",
          "tips": "登万春亭可俯瞰故宫"
        },
        {
          "id": "trans2",
          "type": "transport",
          "name": "前往午餐地点",
          "from": "景山公园",
          "to": "全聚德烤鸭店（王府井店）",
          "method": "地铁",
          "details": "地铁8号线，南锣鼓巷站→王府井站，2站",
          "start_time": "13:00",
          "end_time": "13:15",
          "duration": "15分钟",
          "cost": 3,
          "description": "乘坐地铁8号线前往王府井"
        },
        {
          "id": "meal1",
          "type": "restaurant",
          "name": "全聚德烤鸭店（王府井店）",
          "address": "北京市东城区王府井大街198号",
          "coordinates": [116.410, 39.915],
          "start_time": "13:15",
          "end_time": "14:30",
          "duration": "1小时15分钟",
          "cost": 150,
          "description": "品尝正宗北京烤鸭",
          "cuisine": "北京菜",
          "price_per_person": 150
        }
      ],
      "accommodation": {
        "name": "酒店名称",
        "address": "酒店地址",
        "location": { "lat": 39.9, "lng": 116.4 },
        "price_per_night": 300,
        "rating": 4.5
      },
      "transportation": [
        {
          "type": "flight",
          "from": "上海虹桥机场",
          "to": "北京首都机场",
          "from_coordinates": [121.336319, 31.197875],
          "to_coordinates": [116.584556, 40.080111],
          "departure_time": "08:00",
          "arrival_time": "10:30",
          "duration": "2小时30分钟",
          "price": 800,
          "flight_number": "CA1234（参考）",
          "notes": "建议提前2小时到达机场办理值机手续"
        }
      ],
      "meals": [
        {
          "type": "lunch",
          "name": "全聚德烤鸭店",
          "restaurant": "全聚德烤鸭店",
          "address": "北京市东城区前门大街30号",
          "location": { "lat": 39.898, "lng": 116.397 },
          "cuisine": "北京菜",
          "price_per_person": 150,
          "rating": 4.5
        },
        {
          "type": "dinner",
          "name": "海底捞火锅",
          "restaurant": "海底捞火锅(王府井店)",
          "address": "北京市东城区王府井大街138号",
          "location": { "lat": 39.915, "lng": 116.410 },
          "cuisine": "火锅",
          "price_per_person": 120,
          "rating": 4.6
        }
      ],
      "notes": "当日备注"
    }
  ],
  "suggestions": "旅行建议和注意事项"
}

⚠️ 再次强调：
1. activities 数组中的每个元素都必须包含 coordinates: [经度, 纬度]（transport 类型除外）
2. 景点(type: "attraction")、餐厅(type: "restaurant")、购物(type: "shopping")都必须有 coordinates
3. 交通(type: "transport")必须包含 from、to、method、details、duration、cost 字段
4. 每两个非交通活动之间必须插入一个交通活动
5. 坐标格式: [经度, 纬度]，例如东京塔: [139.745438, 35.658581]
6. 请使用真实的地理坐标，可以参考知名地标的实际位置
7. 交通费用必须是数字类型，步行为0，地铁2-5元，公交1-2元，出租车起步价13元`;

  try {
    console.log('🚀 开始调用 AI 生成行程...');
    const response = await callLLM(userPrompt, systemPrompt);

    // 尝试解析 JSON
    console.log('✅ AI响应成功，长度:', response.length);
    console.log('📍 用户指定的景点:', specificAttractions);
    console.log('📄 AI响应前300字符:', response.substring(0, 300));

    // 移除可能的 markdown 代码块标记
    let jsonStr = response.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*/g, '').replace(/\s*```$/g, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*/g, '').replace(/\s*```$/g, '');
    }

    // 检查JSON是否完整(必须以}结尾)
    if (!jsonStr.endsWith('}')) {
      console.warn('⚠️ JSON 可能被截断，尝试修复...');
      // 尝试找到最后一个完整的对象
      const lastBraceIndex = jsonStr.lastIndexOf('}');
      if (lastBraceIndex > 0) {
        jsonStr = jsonStr.substring(0, lastBraceIndex + 1);
        console.log('✅ 截取到最后一个完整的 }');
      }
    }

    // 检查是否是被转义的 JSON 字符串（包含 \" 而不是 "）
    if ((jsonStr.startsWith('"') && jsonStr.endsWith('"')) || jsonStr.includes('\\"')) {
      console.log('检测到转义的 JSON 字符串，尝试解码...');
      try {
        // 如果整个字符串被引号包裹，先解析一次
        if (jsonStr.startsWith('"') && jsonStr.endsWith('"')) {
          const decoded = JSON.parse(jsonStr);
          if (typeof decoded === 'string') {
            jsonStr = decoded;
            console.log('✅ JSON 字符串解码成功(方法1)');
          }
        } else {
          // 方法2: 直接替换转义的引号和反斜杠
          const unescaped = jsonStr
            .replace(/\\"/g, '"')      // \" -> "
            .replace(/\\\\/g, '\\')    // \\ -> \
            .replace(/\\n/g, '\n')     // \\n -> \n
            .replace(/\\t/g, '\t');    // \\t -> \t

          // 验证是否是有效的JSON
          try {
            JSON.parse(unescaped);
            jsonStr = unescaped;
            console.log('✅ JSON 字符串反转义成功(方法2)');
          } catch {
            console.warn('反转义后仍然无效，保持原样');
          }
        }
      } catch (decodeError) {
        console.warn('JSON 字符串解码失败，继续使用原始字符串:', decodeError);
      }
    }

    // 提取JSON对象(处理可能的前后文本)
    if (!jsonStr.startsWith('{')) {
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
        console.log('✅ 提取JSON对象成功');
      }
    }

    // 尝试修复常见的 JSON 格式问题
    try {
      const result = JSON.parse(jsonStr);

      // 验证是否包含用户指定的景点
      if (specificAttractions.length > 0) {
        const allActivities = result.itinerary?.flatMap((day: any) =>
          day.activities?.map((act: any) => act.name) || []
        ) || [];

        const missingAttractions = specificAttractions.filter(
          attraction => !allActivities.some((name: string) => name.includes(attraction))
        );

        if (missingAttractions.length > 0) {
          console.warn('⚠️ AI 生成的行程缺少以下用户指定的景点:', missingAttractions);
          console.warn('行程中包含的景点:', allActivities);

          // 在建议中添加提示
          const missingSuggestion = `\n\n⚠️ 注意：行程中可能未包含您指定的以下景点：${missingAttractions.join('、')}。您可以要求我重新生成包含这些景点的行程。`;
          result.suggestions = (result.suggestions || '') + missingSuggestion;
        } else {
          console.log('✅ 所有用户指定的景点都已包含在行程中');
        }
      }

      return {
        destination: result.destination || params.destination, // 优先使用 AI 返回的目的地，否则使用用户输入的目的地
        itinerary: result.itinerary || [],
        suggestions: result.suggestions || '暂无建议',
        budget: params.budget,
        travelers: params.travelers,
        preferences: params.preferences,
      };
    } catch (parseError) {
      console.warn('首次 JSON 解析失败，尝试修复...', parseError);

      // 尝试多种修复策略
      let fixedStr = jsonStr;

      // 1. 提取 JSON 对象（先做这一步，避免处理多余的文本）
      const jsonMatch = fixedStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        fixedStr = jsonMatch[0];
      }

      // 2. 检查并修复未闭合的字符串
      // 如果有 "Unterminated string" 错误,通常是因为字符串中有未转义的引号或换行
      const errorMsg = parseError.message;
      if (errorMsg.includes('Unterminated string')) {
        console.log('检测到未闭合的字符串，尝试修复...');

        // 找到错误位置
        const posMatch = errorMsg.match(/position (\d+)/);
        if (posMatch) {
          const errorPos = parseInt(posMatch[1]);
          console.log('错误位置:', errorPos);

          // 截取到错误位置之前的最后一个完整对象
          const beforeError = fixedStr.substring(0, errorPos);
          const lastCompleteObject = beforeError.lastIndexOf('}');

          if (lastCompleteObject > 0) {
            // 尝试找到包含这个}的完整JSON
            let depth = 0;
            let startPos = -1;

            for (let i = 0; i <= lastCompleteObject; i++) {
              if (fixedStr[i] === '{') {
                if (depth === 0) startPos = i;
                depth++;
              } else if (fixedStr[i] === '}') {
                depth--;
                if (depth === 0 && i === lastCompleteObject) {
                  fixedStr = fixedStr.substring(startPos, i + 1);
                  console.log('✅ 截取到最后一个完整的JSON对象');
                  break;
                }
              }
            }
          }
        }
      }

      // 3. 修复 JSON 字符串中的换行符和特殊字符
      // 这是关键修复：正确处理字符串值中的换行符
      fixedStr = fixedStr.replace(
        /"((?:[^"\\]|\\.)*)"/g,
        (_match, content) => {
          // 替换未转义的换行符
          const fixed = content
            .replace(/\r\n/g, '\\n')  // Windows 换行
            .replace(/\n/g, '\\n')    // Unix 换行
            .replace(/\r/g, '\\n')    // Mac 换行
            .replace(/\t/g, '\\t');   // 制表符
          return `"${fixed}"`;
        }
      );

      // 4. 移除控制字符（在字符串外部的）
      // eslint-disable-next-line no-control-regex
      fixedStr = fixedStr.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '');

      // 4. 尝试解析修复后的 JSON
      try {
        const result = JSON.parse(fixedStr);
        console.log('✅ JSON 修复成功');
        return {
          destination: result.destination || params.destination,
          itinerary: result.itinerary || [],
          suggestions: result.suggestions || '暂无建议',
          budget: params.budget,
          travelers: params.travelers,
          preferences: params.preferences,
        };
      } catch (secondError) {
        console.error('JSON 修复失败:', secondError);
        console.error('原始响应前500字符:', response.substring(0, 500));
        console.error('修复后的JSON前500字符:', fixedStr.substring(0, 500));

        // 最后尝试：使用 eval (不安全，但作为最后手段)
        try {
          // 使用 Function 构造器代替 eval，稍微安全一些
          const result = new Function('return ' + fixedStr)();
          console.log('⚠️ 使用 Function 构造器解析成功（不推荐）');
          return {
            destination: result.destination || params.destination,
            itinerary: result.itinerary || [],
            suggestions: result.suggestions || '暂无建议',
            budget: params.budget,
            travelers: params.travelers,
            preferences: params.preferences,
          };
        } catch {
          console.error('所有修复尝试均失败');
          throw secondError;
        }
      }
    }
  } catch (error: any) {
    console.error('❌ 解析 AI 响应失败:', error);
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      jsonStrPreview: jsonStr?.substring(0, 500)
    });
    throw new Error(`AI 生成的行程格式错误: ${error.message}。请重试或简化需求。`);
  }
};

/**
 * 优化现有行程
 */
export const optimizeItinerary = async (
  plan: TravelPlan,
  userFeedback: string
): Promise<{ itinerary: DayItinerary[]; explanation: string }> => {
  const systemPrompt = `你是一个专业的旅行规划助手。请根据用户反馈优化现有的旅行计划。`;

  const userPrompt = `当前旅行计划：
目的地：${plan.destination}
日期：${plan.start_date} 至 ${plan.end_date}
预算：${plan.budget} 元
人数：${plan.travelers} 人

当前行程：
${JSON.stringify(plan.itinerary, null, 2)}

用户反馈：${userFeedback}

请根据用户反馈优化行程，返回 JSON 格式：
{
  "itinerary": [...],
  "explanation": "优化说明"
}`;

  try {
    const response = await callLLM(userPrompt, systemPrompt);
    let jsonStr = response.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/g, '');
    }

    // 尝试解析 JSON
    try {
      const result = JSON.parse(jsonStr);
      return {
        itinerary: result.itinerary || plan.itinerary,
        explanation: result.explanation || '已根据您的反馈进行优化',
      };
    } catch (parseError) {
      console.warn('JSON 解析失败，尝试修复...', parseError);

      // 修复策略
      let fixedStr = jsonStr;

      // 1. 提取 JSON 对象
      const jsonMatch = fixedStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        fixedStr = jsonMatch[0];
      }

      // 2. 修复字符串中的换行符
      fixedStr = fixedStr.replace(
        /"((?:[^"\\]|\\.)*)"/g,
        (_match, content) => {
          const fixed = content
            .replace(/\r\n/g, '\\n')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\n')
            .replace(/\t/g, '\\t');
          return `"${fixed}"`;
        }
      );

      // 3. 移除控制字符
      // eslint-disable-next-line no-control-regex
      fixedStr = fixedStr.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '');

      try {
        const result = JSON.parse(fixedStr);
        console.log('✅ JSON 修复成功');
        return {
          itinerary: result.itinerary || plan.itinerary,
          explanation: result.explanation || '已根据您的反馈进行优化',
        };
      } catch (secondError) {
        console.error('JSON 修复失败:', secondError);
        throw parseError;
      }
    }
  } catch (error) {
    console.error('优化行程失败:', error);
    throw new Error('行程优化失败，请重试');
  }
};

/**
 * 生成预算分析
 */
export const analyzeBudget = async (params: {
  destination: string;
  days: number;
  totalBudget: number;
  travelers: number;
  preferences: string[];
  currentExpenses?: any[];
  startDate?: string;
  endDate?: string;
}): Promise<{
  health_score: number;
  summary: string;
  category_analysis: {
    category: string;
    category_name: string;
    spent: number;
    budget: number;
    percentage: number;
    status: 'good' | 'warning' | 'danger';
    suggestion: string;
  }[];
  warnings: string[];
  suggestions: string[];
  daily_average: number;
  remaining_budget: number;
  predicted_total: number;
  days_passed: number;
  days_remaining: number;
  recommended_daily_budget: number;
}> => {
  // 计算当前费用统计
  const totalSpent = params.currentExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
  const remainingBudget = params.totalBudget - totalSpent;

  // 计算已过天数和剩余天数
  const today = new Date();
  const startDate = params.startDate ? new Date(params.startDate) : today;
  const endDate = params.endDate ? new Date(params.endDate) : new Date(today.getTime() + params.days * 24 * 60 * 60 * 1000);
  const daysPassed = Math.max(1, Math.ceil((today.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)));
  const daysRemaining = Math.max(1, Math.ceil((endDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)));
  const dailyAverage = totalSpent / daysPassed;

  // 按类别统计费用
  const categoryStats: Record<string, number> = {};
  params.currentExpenses?.forEach(exp => {
    categoryStats[exp.category] = (categoryStats[exp.category] || 0) + exp.amount;
  });

  const systemPrompt = `你是一个专业的旅行预算分析师，擅长：
1. 分析旅行费用支出情况，给出精准的预算健康度评分
2. 识别超支风险，提供及时预警
3. 根据目的地消费水平和用户偏好，给出个性化建议
4. 提供实用的省钱技巧和替代方案

请务必返回严格的 JSON 格式，不要添加任何额外的文字说明。`;

  const userPrompt = `请分析以下旅行的预算执行情况：

📍 **旅行信息**
- 目的地：${params.destination}
- 总天数：${params.days} 天
- 已过天数：${daysPassed} 天
- 剩余天数：${daysRemaining} 天
- 总预算：¥${params.totalBudget}
- 人数：${params.travelers} 人
- 偏好：${params.preferences.join('、') || '无'}

💰 **当前支出情况**
- 已花费：¥${totalSpent.toFixed(2)}
- 剩余预算：¥${remainingBudget.toFixed(2)}
- 日均支出：¥${dailyAverage.toFixed(2)}
- 预算执行率：${((totalSpent / params.totalBudget) * 100).toFixed(1)}%

📊 **各类别支出明细**
${Object.entries(categoryStats).map(([cat, amount]) => {
  const categoryNames: Record<string, string> = {
    transportation: '交通',
    accommodation: '住宿',
    food: '餐饮',
    attraction: '景点',
    shopping: '购物',
    other: '其他'
  };
  return `- ${categoryNames[cat] || cat}：¥${amount.toFixed(2)}`;
}).join('\n') || '- 暂无费用记录'}

🎯 **分析要求**
1. **健康度评分 (health_score)**：0-100分，综合考虑预算执行率、各类别均衡度、超支风险
   - 90-100分：优秀，预算控制良好
   - 70-89分：良好，基本符合预期
   - 50-69分：警告，存在超支风险
   - 0-49分：危险，严重超支

2. **类别分析 (category_analysis)**：分析每个有支出的类别，包括：
   - 已花费金额
   - 建议预算（基于目的地消费水平和剩余天数）
   - 支出占比
   - 状态评估（good/warning/danger）
   - 具体建议

3. **预警信息 (warnings)**：
   - 超过预算80%的类别
   - 日均支出过高
   - 预计总费用超预算

4. **优化建议 (suggestions)**：
   - 剩余天数的每日预算建议
   - 各类别的节省方案
   - 基于偏好的个性化建议

5. **预测分析**：
   - 按当前消费趋势预测总费用
   - 建议的每日预算

请严格返回以下 JSON 格式（不要有任何其他文字）：
{
  "health_score": 75,
  "summary": "简短总结（一句话）",
  "category_analysis": [
    {
      "category": "food",
      "category_name": "餐饮",
      "spent": 1200,
      "budget": 1500,
      "percentage": 80,
      "status": "warning",
      "suggestion": "具体建议"
    }
  ],
  "warnings": ["预警信息1", "预警信息2"],
  "suggestions": ["建议1", "建议2", "建议3"],
  "daily_average": ${dailyAverage.toFixed(2)},
  "remaining_budget": ${remainingBudget.toFixed(2)},
  "predicted_total": 9500,
  "days_passed": ${daysPassed},
  "days_remaining": ${daysRemaining},
  "recommended_daily_budget": 500
}

类别代码：transportation(交通)、accommodation(住宿)、food(餐饮)、attraction(景点)、shopping(购物)、other(其他)`;

  try {
    console.log('🤖 发送预算分析请求...');
    const response = await callLLM(userPrompt, systemPrompt);
    console.log('📥 收到 AI 响应:', response.substring(0, 200) + '...');

    let jsonStr = response.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/g, '');
    }

    // 尝试解析 JSON
    try {
      const result = JSON.parse(jsonStr);
      console.log('✅ JSON 解析成功');

      // 返回完整的分析结果
      return {
        health_score: result.health_score || 50,
        summary: result.summary || '预算分析完成',
        category_analysis: result.category_analysis || [],
        warnings: result.warnings || [],
        suggestions: result.suggestions || [],
        daily_average: dailyAverage,
        remaining_budget: remainingBudget,
        predicted_total: result.predicted_total || totalSpent,
        days_passed: daysPassed,
        days_remaining: daysRemaining,
        recommended_daily_budget: result.recommended_daily_budget || (remainingBudget / daysRemaining),
      };
    } catch (parseError) {
      console.warn('⚠️ JSON 解析失败，尝试修复...', parseError);
      console.log('原始响应:', jsonStr);

      // 修复策略
      let fixedStr = jsonStr;

      // 1. 提取 JSON 对象
      const jsonMatch = fixedStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        fixedStr = jsonMatch[0];
      }

      // 2. 修复字符串中的换行符
      fixedStr = fixedStr.replace(
        /"((?:[^"\\]|\\.)*)"/g,
        (_match, content) => {
          const fixed = content
            .replace(/\r\n/g, '\\n')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\n')
            .replace(/\t/g, '\\t');
          return `"${fixed}"`;
        }
      );

      // 3. 移除控制字符
      // eslint-disable-next-line no-control-regex
      fixedStr = fixedStr.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '');

      try {
        const result = JSON.parse(fixedStr);
        console.log('✅ JSON 修复成功');

        return {
          health_score: result.health_score || 50,
          summary: result.summary || '预算分析完成',
          category_analysis: result.category_analysis || [],
          warnings: result.warnings || [],
          suggestions: result.suggestions || [],
          daily_average: dailyAverage,
          remaining_budget: remainingBudget,
          predicted_total: result.predicted_total || totalSpent,
          days_passed: daysPassed,
          days_remaining: daysRemaining,
          recommended_daily_budget: result.recommended_daily_budget || (remainingBudget / daysRemaining),
        };
      } catch (secondError) {
        console.error('❌ JSON 修复失败:', secondError);
        console.error('修复后的字符串:', fixedStr);
        throw new Error('AI 返回格式错误，请重试');
      }
    }
  } catch (error: any) {
    console.error('❌ 预算分析失败:', error);
    throw new Error(error.message || '预算分析失败，请重试');
  }
};

/**
 * AI 对话（通用）
 */
export const chatWithAI = async (
  message: string,
  context?: string
): Promise<string> => {
  const systemPrompt = `你是一个专业的旅行规划助手，可以回答关于旅行的各种问题。${context ? `\n\n当前上下文：${context}` : ''}`;

  return callLLM(message, systemPrompt);
};

