/**
 * AI Web Planner - 后端代理服务
 * 用于解决阿里云百炼API的CORS问题
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// 启用CORS - 允许所有来源（生产环境建议限制）
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '代理服务器运行正常',
    timestamp: new Date().toISOString()
  });
});

// 阿里云百炼API代理
app.post('/api/llm-proxy', async (req, res) => {
  const { prompt, systemPrompt, apiKey, endpoint } = req.body;

  // 验证必需参数
  if (!apiKey || !endpoint) {
    return res.status(400).json({ 
      error: 'Missing required parameters',
      message: '缺少 apiKey 或 endpoint 参数'
    });
  }

  if (!prompt) {
    return res.status(400).json({ 
      error: 'Missing prompt',
      message: '缺少 prompt 参数'
    });
  }

  try {
    // 构建消息数组
    const messages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      { role: 'user', content: prompt },
    ];

    console.log(`[${new Date().toISOString()}] 代理请求到阿里云百炼:`, endpoint);

    // 创建 AbortController 用于超时控制
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 300000); // 300秒超时 (5分钟)

    try {
      // 调用阿里云百炼API
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          input: {
            messages: messages,
          },
          parameters: {
            result_format: 'message',
            temperature: 0.7,
            top_p: 0.8,
            max_tokens: 32000, // 阿里云最大支持32768,设置为32000
            incremental_output: false, // 禁用增量输出,等待完整响应
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // 检查响应状态
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[${new Date().toISOString()}] 阿里云API错误:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });

        return res.status(response.status).json({
          error: '阿里云API调用失败',
          status: response.status,
          statusText: response.statusText,
          details: errorData,
        });
      }

      const data = await response.json();
      console.log(`[${new Date().toISOString()}] 阿里云API响应成功`, {
        hasOutput: !!data.output,
        hasChoices: !!data.output?.choices,
        messageLength: data.output?.choices?.[0]?.message?.content?.length || 0
      });

      // 返回结果
      return res.status(200).json(data);
    } catch (fetchError) {
      clearTimeout(timeout);

      // 处理超时错误
      if (fetchError.name === 'AbortError') {
        console.error(`[${new Date().toISOString()}] 请求超时`);
        return res.status(504).json({
          error: '请求超时',
          message: 'AI服务响应时间过长，请稍后重试或减少请求内容'
        });
      }

      throw fetchError;
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] 代理服务器错误:`, error);

    return res.status(500).json({
      error: '代理服务器错误',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `路径 ${req.path} 不存在`,
    availableEndpoints: [
      'GET /health',
      'POST /api/llm-proxy'
    ]
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] 服务器错误:`, err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log('================================');
  console.log('🚀 AI Web Planner - 后端代理服务');
  console.log('================================');
  console.log(`📡 服务器运行在: http://0.0.0.0:${PORT}`);
  console.log(`💚 健康检查: http://localhost:${PORT}/health`);
  console.log(`🔗 代理端点: http://localhost:${PORT}/api/llm-proxy`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ 启动时间: ${new Date().toISOString()}`);
  console.log('================================');
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信号，正在关闭服务器...');
  process.exit(0);
});

