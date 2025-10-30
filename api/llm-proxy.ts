import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * 阿里云百炼API代理
 * 解决浏览器CORS跨域问题
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, systemPrompt, apiKey, endpoint } = req.body;

    if (!apiKey || !endpoint) {
      return res.status(400).json({ error: 'Missing apiKey or endpoint' });
    }

    // 构建消息数组
    const messages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      { role: 'user', content: prompt },
    ];

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
          max_tokens: 2000,
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

    // 返回结果
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('代理服务器错误:', error);
    return res.status(500).json({
      error: '代理服务器错误',
      message: error.message,
    });
  }
}

