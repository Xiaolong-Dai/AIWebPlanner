/**
 * 本地开发环境的代理服务器
 * 用于解决阿里云百炼API的CORS问题
 * 
 * 使用方法:
 * 1. 安装依赖: npm install express cors
 * 2. 运行: node proxy-server.js
 * 3. 代理服务器将运行在 http://localhost:3001
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// 启用CORS
app.use(cors());
app.use(express.json());

// 代理端点
app.post('/api/llm-proxy', async (req, res) => {
  const { prompt, systemPrompt, apiKey, endpoint } = req.body;

  if (!apiKey || !endpoint) {
    return res.status(400).json({ error: 'Missing apiKey or endpoint' });
  }

  try {
    // 构建消息数组
    const messages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      { role: 'user', content: prompt },
    ];

    console.log('代理请求到阿里云百炼:', endpoint);

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
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('阿里云API错误:', errorData);
      return res.status(response.status).json({
        error: '阿里云API调用失败',
        details: errorData,
      });
    }

    const data = await response.json();
    console.log('阿里云API响应成功');

    // 返回结果
    return res.status(200).json(data);
  } catch (error) {
    console.error('代理服务器错误:', error);
    return res.status(500).json({
      error: '代理服务器错误',
      message: error.message,
    });
  }
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '代理服务器运行正常' });
});

app.listen(PORT, () => {
  console.log(`🚀 代理服务器运行在 http://localhost:${PORT}`);
  console.log(`📡 代理端点: http://localhost:${PORT}/api/llm-proxy`);
  console.log(`💚 健康检查: http://localhost:${PORT}/health`);
});

