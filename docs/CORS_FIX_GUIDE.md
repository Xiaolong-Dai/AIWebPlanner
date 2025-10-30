# 🔧 CORS跨域问题解决方案

## 问题说明

浏览器报错：
```
Access to XMLHttpRequest at 'https://bailian.aliyun.com/v1/api/completions' 
has been blocked by CORS policy
```

**原因:** 阿里云百炼API不允许从浏览器直接调用（出于安全考虑）

---

## ✅ 解决方案（3选1）

### 方案1: 使用OpenAI API（推荐 - 最简单）

OpenAI API **支持浏览器直接调用**，无CORS问题。

#### 步骤：

1. **获取OpenAI API Key**
   - 访问: https://platform.openai.com/api-keys
   - 注册/登录账号
   - 创建新的API Key
   - 复制API Key

2. **在应用中配置**
   - 打开应用的 **设置页面**
   - AI服务类型选择: **OpenAI**
   - API Key: 粘贴你的OpenAI Key
   - API Endpoint: `https://api.openai.com/v1/chat/completions`
   - 点击 **保存配置**
   - 点击 **测试 AI 服务**

3. **测试**
   - 进入 **创建计划** 页面
   - 输入旅行需求
   - 点击发送，应该可以正常工作了！

---

### 方案2: 使用国内AI服务（推荐 - 支持浏览器）

以下国内AI服务**支持浏览器直接调用**：

#### 2.1 百度文心一言

1. **获取API Key**
   - 访问: https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application
   - 创建应用，获取 API Key 和 Secret Key

2. **配置**
   - AI服务类型: 百度文心一言
   - API Key: 你的API Key
   - API Endpoint: `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions`

#### 2.2 讯飞星火

1. **获取API Key**
   - 访问: https://console.xfyun.cn/services/bm3
   - 创建应用

2. **配置**
   - AI服务类型: 讯飞星火
   - 填写相应配置

---

### 方案3: 搭建后端代理（最安全 - 需要后端）

如果你想继续使用阿里云百炼，需要搭建后端代理。

#### 3.1 使用Vercel Serverless Function

创建文件: `api/llm-proxy.ts`

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, apiKey, endpoint } = req.body;

    const response = await axios.post(
      endpoint,
      {
        model: 'qwen-plus',
        input: {
          messages: [
            { role: 'user', content: prompt },
          ],
        },
        parameters: {
          result_format: 'message',
          temperature: 0.7,
          top_p: 0.8,
          max_tokens: 2000,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('LLM API Error:', error);
    return res.status(500).json({
      error: error.message,
      details: error.response?.data,
    });
  }
}
```

然后修改前端代码调用这个代理接口。

---

## 🚀 快速开始（推荐方案1）

### 立即使用OpenAI

1. **获取免费试用额度**
   - 新用户有$5免费额度
   - 足够测试使用

2. **配置步骤**
   ```
   设置页面 → AI服务配置
   ├─ 服务类型: OpenAI
   ├─ API Key: sk-xxxxxxxxxxxxxxxx
   └─ Endpoint: https://api.openai.com/v1/chat/completions
   ```

3. **测试**
   - 点击"测试 AI 服务"
   - 看到成功提示即可使用

---

## 📝 修改代码支持OpenAI

如果你选择方案1（OpenAI），需要修改 `frontend/src/services/llm.ts`:

### 修改点1: 支持OpenAI格式

```typescript
// 在 callLLM 函数中
const response = await axios.post(
  endpoint,
  {
    // 如果是OpenAI
    model: endpoint.includes('openai') ? 'gpt-3.5-turbo' : 'qwen-plus',
    
    // OpenAI使用 messages，百炼使用 input.messages
    ...(endpoint.includes('openai') 
      ? { messages: [{ role: 'user', content: prompt }] }
      : { input: { messages: [{ role: 'user', content: prompt }] } }
    ),
    
    // 参数
    temperature: 0.7,
    max_tokens: 2000,
  },
  {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  }
);

// 解析响应
if (endpoint.includes('openai')) {
  // OpenAI格式
  return response.data.choices[0].message.content;
} else {
  // 百炼格式
  return response.data.output.choices[0].message.content;
}
```

---

## ❓ 常见问题

### Q1: 为什么阿里云百炼不能直接调用？
**A:** 出于安全考虑，阿里云不允许浏览器直接调用API，防止API Key泄露。

### Q2: OpenAI会不会很贵？
**A:** 
- 新用户有$5免费额度
- GPT-3.5-turbo很便宜: $0.002/1K tokens
- 生成一次行程约0.01-0.05美元

### Q3: 有没有完全免费的方案？
**A:** 
- 使用百度文心一言（有免费额度）
- 使用讯飞星火（有免费额度）
- 自己搭建本地LLM（如Ollama）

### Q4: 我想继续用阿里云怎么办？
**A:** 必须搭建后端代理（方案3），或使用Vercel/Netlify Functions。

---

## 🎯 推荐选择

| 方案 | 难度 | 成本 | 推荐度 |
|------|------|------|--------|
| OpenAI | ⭐ 简单 | 💰 低 | ⭐⭐⭐⭐⭐ |
| 百度文心 | ⭐⭐ 中等 | 💰 免费 | ⭐⭐⭐⭐ |
| 后端代理 | ⭐⭐⭐ 复杂 | 💰 免费 | ⭐⭐⭐ |

**建议:** 先用OpenAI测试，后期可以切换到其他服务。

---

## 📞 需要帮助？

如果你选择了某个方案但遇到问题，请告诉我：
1. 你选择的方案
2. 具体的错误信息
3. 控制台的日志

我会帮你解决！😊

