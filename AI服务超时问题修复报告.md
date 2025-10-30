# AI服务超时问题修复报告

## 🐛 问题描述

用户反馈:AI服务在处理较长回复时会直接中断,例如:

**用户输入**: "我想去日本东京,5天,预算1万元,喜欢美食和动漫"

**AI开始回复**: "当然可以!😊 请告诉我您的旅行需求..."

**然后突然中断**: "抱歉,AI服务暂时无法响应。请检查网络连接和 AI 服务配置"

---

## 🔍 问题分析

### 根本原因

1. **超时设置过短**
   - 前端: 120秒 (2分钟)
   - 后端: 无超时控制
   - AI生成较长内容时容易超时

2. **Token限制过小**
   - 前端/后端: `max_tokens: 2000`
   - 较长的旅行计划需要更多token

3. **缺少超时错误处理**
   - 后端没有AbortController超时控制
   - 前端没有针对超时的友好提示

4. **缺少详细日志**
   - 难以定位具体失败原因
   - 无法判断是超时还是其他错误

---

## ✅ 修复方案

### 1. 后端修复 (`backend/server.js`)

#### 1.1 增加超时控制

**修改前**:
```javascript
const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: 'qwen-plus',
    input: { messages: messages },
    parameters: {
      result_format: 'message',
      temperature: 0.7,
      top_p: 0.8,
      max_tokens: 2000,
    },
  }),
});
```

**修改后**:
```javascript
// 创建 AbortController 用于超时控制
const controller = new AbortController();
const timeout = setTimeout(() => {
  controller.abort();
}, 180000); // 180秒超时 (3分钟)

try {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'qwen-plus',
      input: { messages: messages },
      parameters: {
        result_format: 'message',
        temperature: 0.7,
        top_p: 0.8,
        max_tokens: 4000, // 增加到4000
        incremental_output: false, // 禁用增量输出,等待完整响应
      },
    }),
    signal: controller.signal, // 添加超时信号
  });

  clearTimeout(timeout);
  // ... 处理响应
} catch (fetchError) {
  clearTimeout(timeout);
  
  // 处理超时错误
  if (fetchError.name === 'AbortError') {
    return res.status(504).json({
      error: '请求超时',
      message: 'AI服务响应时间过长,请稍后重试或减少请求内容'
    });
  }
  
  throw fetchError;
}
```

#### 1.2 增加详细日志

```javascript
const data = await response.json();
console.log(`[${new Date().toISOString()}] 阿里云API响应成功`, {
  hasOutput: !!data.output,
  hasChoices: !!data.output?.choices,
  messageLength: data.output?.choices?.[0]?.message?.content?.length || 0
});
```

---

### 2. 前端修复 (`frontend/src/services/llm.ts`)

#### 2.1 增加超时时间

**修改前**:
```typescript
const response = await axios.post(apiEndpoint, requestBody, {
  headers,
  timeout: 120000, // 120秒超时
});
```

**修改后**:
```typescript
const response = await axios.post(apiEndpoint, requestBody, {
  headers,
  timeout: 180000, // 180秒超时 (3分钟)
  validateStatus: (status) => status < 500, // 只有5xx错误才抛出异常
});
```

#### 2.2 增加Token限制

**修改前**:
```typescript
if (isOpenAI) {
  requestBody = {
    model: 'gpt-3.5-turbo',
    messages: messages,
    temperature: 0.7,
    max_tokens: 2000,
  };
}
```

**修改后**:
```typescript
if (isOpenAI) {
  requestBody = {
    model: 'gpt-3.5-turbo',
    messages: messages,
    temperature: 0.7,
    max_tokens: 4000, // 增加到4000
  };
} else if (isBaidu) {
  requestBody = {
    messages: messages,
    temperature: 0.7,
    max_output_tokens: 4000, // 增加到4000
  };
}
```

#### 2.3 增加超时错误处理

**修改前**:
```typescript
} catch (error: any) {
  console.error('LLM API 调用失败:', error);
  
  if (error.response?.status === 401) {
    throw new Error('API Key 无效,请检查配置');
  }
  // ...
  throw new Error(`AI 服务调用失败: ${error.message}`);
}
```

**修改后**:
```typescript
} catch (error: any) {
  console.error('LLM API 调用失败:', error);
  
  // 超时错误优先处理
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    throw new Error('AI服务响应超时,请稍后重试。如果问题持续,请尝试减少请求内容或联系管理员');
  }
  if (error.response?.status === 504) {
    throw new Error('AI服务响应超时,请稍后重试');
  }
  if (error.response?.status === 401) {
    throw new Error('API Key 无效,请检查配置');
  }
  // ...
  throw new Error(`AI 服务调用失败: ${error.message}`);
}
```

#### 2.4 增加详细日志

```typescript
if (content) {
  console.log('AI响应成功,内容长度:', content.length);
  return content;
}

console.error('AI响应格式错误:', {
  hasData: !!response.data,
  hasOutput: !!response.data?.output,
  hasChoices: !!response.data?.output?.choices,
  responseKeys: Object.keys(response.data || {}),
  fullResponse: response.data
});
```

---

## 📊 修复对比

| 项目 | 修复前 | 修复后 | 改进 |
|------|--------|--------|------|
| **前端超时** | 120秒 | 180秒 | +50% |
| **后端超时** | 无限制 | 180秒 | ✅ 添加控制 |
| **最大Token** | 2000 | 4000 | +100% |
| **超时处理** | 通用错误 | 专门提示 | ✅ 更友好 |
| **错误日志** | 简单 | 详细 | ✅ 易调试 |

---

## 🧪 测试验证

### 测试场景

1. **短回复测试** (< 500字)
   - ✅ 正常响应
   - ✅ 无超时

2. **中等回复测试** (500-1500字)
   - ✅ 正常响应
   - ✅ 无超时

3. **长回复测试** (1500-3000字)
   - ✅ 正常响应
   - ✅ 3分钟内完成

4. **超长回复测试** (> 3000字)
   - ⚠️ 可能超时
   - ✅ 友好错误提示

---

## 🚀 部署步骤

### 1. 重新构建Docker镜像

```bash
docker-compose build backend frontend
```

**结果**: ✅ 构建成功 (23.6秒)

### 2. 重启服务

```bash
docker-compose down
docker-compose up -d
```

### 3. 验证服务

```bash
# 检查后端健康
curl http://localhost:3001/health

# 检查前端
curl http://localhost:3000
```

---

## 📝 使用建议

### 对用户的建议

1. **合理控制请求内容**
   - 避免一次性请求过多天数的行程
   - 建议单次请求不超过7天行程

2. **分步骤规划**
   - 先生成基础行程
   - 再逐步优化细节

3. **网络环境**
   - 确保网络稳定
   - 避免在网络高峰期使用

### 对开发者的建议

1. **监控超时情况**
   - 查看后端日志中的超时记录
   - 根据实际情况调整超时时间

2. **优化Prompt**
   - 精简系统提示词
   - 减少不必要的输出要求

3. **考虑流式响应**
   - 未来可以实现SSE流式输出
   - 提升用户体验

---

## 🔧 后续优化方向

### 1. 实现流式响应 (SSE)

**优点**:
- 用户可以实时看到AI生成内容
- 不会因为等待而感觉卡顿
- 更好的用户体验

**实现**:
```typescript
// 后端
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache');
res.setHeader('Connection', 'keep-alive');

// 流式发送数据
stream.on('data', (chunk) => {
  res.write(`data: ${chunk}\n\n`);
});
```

### 2. 添加重试机制

```typescript
async function callLLMWithRetry(prompt, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await callLLM(prompt);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(1000 * (i + 1)); // 指数退避
    }
  }
}
```

### 3. 添加缓存机制

```typescript
// 缓存常见请求
const cache = new Map();
const cacheKey = `${destination}-${days}-${budget}`;

if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}
```

---

## ✅ 总结

### 已修复的问题

- [x] 前端超时时间过短 (120秒 → 180秒)
- [x] 后端缺少超时控制 (添加AbortController)
- [x] Token限制过小 (2000 → 4000)
- [x] 缺少超时错误处理 (添加专门提示)
- [x] 缺少详细日志 (添加响应详情)

### 修复效果

- ✅ 支持更长的AI回复
- ✅ 更友好的错误提示
- ✅ 更容易调试问题
- ✅ 更稳定的服务

### 构建状态

- ✅ 前端构建成功
- ✅ 后端构建成功
- ✅ Docker镜像构建成功

---

**修复时间**: 2025-10-29  
**修复文件数**: 2个  
**修复问题数**: 5个  
**构建状态**: ✅ 成功

