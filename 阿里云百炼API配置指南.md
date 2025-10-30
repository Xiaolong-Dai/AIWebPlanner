# 阿里云百炼 API 配置指南

## 🎯 问题说明

如果你看到错误:
```
抱歉，AI服务暂时无法响应。
请检查网络连接和 AI 服务配置
AI 服务调用失败: Request failed with status code 404
```

这是因为 **API Endpoint 配置不正确**。

---

## ✅ 正确的配置方式

### 1. API Endpoint (重要!)

**正确的 Endpoint**:
```
https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
```

**❌ 错误的 Endpoint** (不要使用):
```
https://bailian.aliyun.com/v1/api/completions  ❌
https://bailian.console.aliyun.com/...  ❌
```

### 2. API Key

格式示例:
```
sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 📋 获取 API Key 和 Endpoint 的步骤

### 第 1 步: 访问阿里云百炼控制台

访问: https://bailian.console.aliyun.com

### 第 2 步: 创建应用

1. 点击 **"创建应用"** 或 **"我的应用"**
2. 选择 **"通义千问"** 模型
3. 创建应用

### 第 3 步: 获取 API Key

1. 在应用详情页面,找到 **"API Key"** 部分
2. 点击 **"创建 API Key"** 或查看已有的 Key
3. 复制 API Key (格式: `sk-xxxxxx`)

### 第 4 步: 使用正确的 Endpoint

**不需要从控制台复制 Endpoint!**

直接使用标准的 DashScope API Endpoint:
```
https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
```

---

## 🔧 在应用中配置

### 1. 打开设置页面

访问 http://localhost:3000,点击右上角的 **设置图标** ⚙️

### 2. 找到 "阿里云通义千问" 部分

### 3. 填写配置

**API Key**:
```
sk-your-actual-api-key-here
```

**API Endpoint**:
```
https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
```

### 4. 保存配置

点击 **"保存配置"** 按钮

### 5. 测试配置

点击 **"测试 AI 对话"** 按钮,应该看到:
```
✅ 测试成功
AI 服务配置正确
```

---

## 🌟 完整配置示例

```json
{
  "llm_api_key": "sk-abc123def456ghi789jkl",
  "llm_endpoint": "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"
}
```

---

## ❓ 常见问题

### Q1: 为什么不能使用 bailian.aliyun.com?

**A**: `bailian.aliyun.com` 是控制台网址,不是 API endpoint。

实际的 API 服务在 `dashscope.aliyuncs.com` 域名下。

### Q2: 我的 API Key 在哪里?

**A**: 
1. 访问 https://bailian.console.aliyun.com
2. 进入你的应用
3. 在 "API Key" 或 "密钥管理" 部分查看

### Q3: 测试时提示 401 错误?

**A**: API Key 不正确,请检查:
- API Key 是否完整复制
- API Key 是否已启用
- API Key 是否有权限

### Q4: 测试时提示 403 错误?

**A**: API 配额已用完,请:
- 检查账户余额
- 充值或更换 API Key
- 查看配额使用情况

### Q5: 测试时提示 404 错误?

**A**: Endpoint 不正确,请使用:
```
https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
```

### Q6: 如何查看 API 调用日志?

**A**: 
```powershell
# 查看后端日志
docker-compose logs backend -f
```

---

## 📚 官方文档

### 阿里云百炼文档
- **控制台**: https://bailian.console.aliyun.com
- **API 文档**: https://help.aliyun.com/zh/model-studio/developer-reference/api-details
- **快速开始**: https://help.aliyun.com/zh/model-studio/getting-started/first-api-call-to-qwen

### DashScope API 文档
- **API 参考**: https://help.aliyun.com/zh/dashscope/developer-reference/api-details
- **模型列表**: https://help.aliyun.com/zh/dashscope/developer-reference/model-square

---

## 🔍 验证配置是否正确

### 方法 1: 在应用中测试

1. 打开设置页面
2. 填写 API Key 和 Endpoint
3. 点击 **"测试 AI 对话"**
4. 查看测试结果

### 方法 2: 使用 curl 测试

```bash
curl -X POST \
  https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "qwen-plus",
    "input": {
      "messages": [
        {
          "role": "user",
          "content": "你好"
        }
      ]
    },
    "parameters": {
      "result_format": "message"
    }
  }'
```

替换 `YOUR_API_KEY` 为你的实际 API Key。

如果配置正确,应该返回类似:
```json
{
  "output": {
    "choices": [
      {
        "message": {
          "role": "assistant",
          "content": "你好!有什么我可以帮助你的吗?"
        }
      }
    ]
  },
  "usage": {
    "total_tokens": 20
  }
}
```

### 方法 3: 查看后端日志

```powershell
docker-compose logs backend --tail=20
```

正确的日志应该显示:
```
[时间] 代理请求到阿里云百炼: https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
[时间] 阿里云API响应成功
```

错误的日志会显示:
```
[时间] 阿里云API错误: { status: 404, statusText: 'Not Found', error: {} }
```

---

## 🎯 快速修复步骤

如果你现在遇到 404 错误:

### 1. 打开设置页面
访问 http://localhost:3000,点击右上角 ⚙️

### 2. 修改 API Endpoint
将 Endpoint 改为:
```
https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
```

### 3. 保存配置
点击 **"保存配置"**

### 4. 测试
点击 **"测试 AI 对话"**

### 5. 验证
应该看到 ✅ 测试成功

---

## 💡 提示

1. **API Key 保密**: 不要将 API Key 提交到 Git 或公开分享
2. **配额管理**: 定期检查 API 调用配额和余额
3. **错误处理**: 查看后端日志了解详细错误信息
4. **文档更新**: 阿里云 API 可能会更新,请参考最新官方文档

---

## 📞 需要帮助?

如果问题仍然存在:

1. **查看后端日志**:
   ```powershell
   docker-compose logs backend -f
   ```

2. **查看浏览器控制台**:
   按 F12 打开开发者工具,查看 Console 和 Network 标签

3. **检查网络连接**:
   确保可以访问 `dashscope.aliyuncs.com`

4. **联系支持**:
   访问阿里云工单系统获取技术支持

---

**更新时间**: 2025-10-29  
**状态**: ✅ 已验证  
**适用版本**: AI Web Planner v1.0

