# 🔑 API Keys 配置指南

## 📌 重要提示

你看到的错误 **"AI服务暂时无法响应"** 是因为还没有配置API Keys。

这是**正常现象**,配置完成后即可使用所有功能。

---

## 🎯 快速配置步骤

### 第一步: 访问设置页面

1. 打开浏览器访问: http://localhost:5173
2. 点击右上角的 **设置图标** ⚙️ (齿轮图标)
3. 进入设置页面

### 第二步: 配置必需的API Keys

设置页面有多个标签页,每个对应一个服务:

---

## 📋 必需配置项

### 1️⃣ AI 大语言模型 (最重要!)

**用途:** 智能行程规划、AI对话、预算分析

**配置项:**
- **API Key**: 你的阿里云通义千问API Key
- **API Endpoint**: API服务端点

**推荐服务:** 阿里云通义千问(百炼平台)

**获取方式:**

#### 方式A: 使用阿里云百炼(推荐)

1. 访问: https://bailian.console.aliyun.com
2. 登录阿里云账号(没有则注册)
3. 创建应用:
   - 点击"创建应用"
   - 选择"通义千问"模型
   - 记录下API Key
4. 获取Endpoint:
   - 通常是: `https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation`
   - 或在控制台查看具体端点

**配置示例:**
```
API Key: sk-xxxxxxxxxxxxxxxxxxxxxxxx
API Endpoint: https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
```

#### 方式B: 使用OpenAI(备选)

1. 访问: https://platform.openai.com
2. 注册并登录
3. 创建API Key
4. 配置:
   ```
   API Key: sk-xxxxxxxxxxxxxxxxxxxxxxxx
   API Endpoint: https://api.openai.com/v1/chat/completions
   ```

---

### 2️⃣ Supabase 数据库

**用途:** 用户认证、数据存储、云端同步

**配置项:**
- **Supabase URL**: 你的项目URL
- **Supabase Anon Key**: 匿名访问密钥

**获取方式:**

1. 访问: https://supabase.com
2. 注册并登录
3. 创建新项目:
   - 点击 "New Project"
   - 填写项目名称和密码
   - 选择区域(推荐Singapore或Tokyo)
   - 等待项目创建完成(约2分钟)
4. 获取API Keys:
   - 进入项目
   - 点击左侧 "Settings" → "API"
   - 复制 "Project URL" 和 "anon public" key

**配置示例:**
```
Supabase URL: https://xxxxxxxxxxxxx.supabase.co
Supabase Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```

---

### 3️⃣ 高德地图

**用途:** 地图展示、路线规划、地点搜索

**配置项:**
- **高德地图 Key**: Web服务Key

**获取方式:**

1. 访问: https://lbs.amap.com
2. 注册并登录
3. 进入控制台
4. 创建应用:
   - 点击 "应用管理" → "我的应用"
   - 点击 "创建新应用"
   - 填写应用名称
5. 添加Key:
   - 点击 "添加Key"
   - 服务平台选择: **Web端(JS API)**
   - 填写应用名称
   - 复制生成的Key

**配置示例:**
```
高德地图 Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🔧 可选配置项

### 4️⃣ 科大讯飞语音识别(可选)

**用途:** 语音输入旅行需求

**配置项:**
- **App ID**: 应用ID
- **API Key**: API密钥
- **API Secret**: API密钥

**获取方式:**

1. 访问: https://www.xfyun.cn
2. 注册并登录
3. 创建应用:
   - 进入控制台
   - 点击 "创建新应用"
   - 选择 "语音听写(流式版)"
4. 获取密钥:
   - 在应用列表中查看
   - 复制 APPID、APIKey、APISecret

**配置示例:**
```
App ID: xxxxxxxx
API Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
API Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**注意:** 如果不配置,仍可使用文字输入功能。

---

## ✅ 配置完成后

### 1. 保存配置

在每个标签页填写完成后,点击 **"保存配置"** 按钮。

### 2. 测试连接(推荐)

1. 切换到 **"测试"** 标签页
2. 点击 **"🚀 一键测试所有服务"** 按钮
3. 查看测试结果:
   - ✅ 绿色对勾 = 配置正确
   - ❌ 红色叉号 = 配置错误,需要检查

### 3. 开始使用

配置成功后:
1. 返回首页
2. 注册账号(如果还没有)
3. 登录
4. 开始创建旅行计划!

---

## 🎯 最小配置方案

如果你只想快速体验,至少需要配置:

1. **AI 大语言模型** (必需 - 用于生成行程)
2. **Supabase** (必需 - 用于登录和保存数据)
3. **高德地图** (必需 - 用于地图展示)

**语音识别**可以暂时不配置,使用文字输入即可。

---

## 🔍 常见问题

### Q1: 我没有这些API Keys怎么办?

**A:** 所有服务都提供免费额度:
- **阿里云通义千问**: 新用户有免费额度
- **Supabase**: 免费版足够个人使用
- **高德地图**: 每天30万次免费调用
- **科大讯飞**: 每天500次免费调用

### Q2: 配置后还是报错?

**A:** 请检查:
1. API Key是否复制完整(没有多余空格)
2. Endpoint地址是否正确
3. 点击"测试"标签页验证配置
4. 查看浏览器控制台(F12)的错误信息

### Q3: 可以使用其他AI服务吗?

**A:** 可以!支持:
- OpenAI GPT-3.5/4
- 百度文心一言
- 阿里云通义千问
- 其他兼容OpenAI格式的API

只需填写对应的API Key和Endpoint即可。

### Q4: 配置会保存在哪里?

**A:** 配置保存在浏览器的LocalStorage中,只在你的电脑上,不会上传到服务器。

### Q5: 多个设备如何同步配置?

**A:** 配置是本地的,每个设备需要单独配置。但你的旅行计划数据会通过Supabase云端同步。

---

## 📊 配置优先级

### 立即配置(必需):
1. ✅ AI 大语言模型
2. ✅ Supabase
3. ✅ 高德地图

### 稍后配置(可选):
4. ⭐ 科大讯飞语音识别

---

## 🎁 免费额度参考

| 服务 | 免费额度 | 说明 |
|------|----------|------|
| 阿里云通义千问 | 新用户赠送 | 足够测试使用 |
| Supabase | 500MB数据库 | 个人使用足够 |
| 高德地图 | 30万次/天 | 非常充足 |
| 科大讯飞 | 500次/天 | 日常使用足够 |

---

## 🆘 需要帮助?

### 查看详细错误

1. 按 F12 打开浏览器开发者工具
2. 切换到 "Console" 标签
3. 查看红色错误信息
4. 截图并提供错误信息

### 测试后端服务

访问: http://localhost:3001/health

应该看到: `{"status":"ok"}`

如果看不到,说明后端服务没有运行。

---

## 📚 相关文档

- [部署成功指南](部署成功.md)
- [完整项目文档](README.md)
- [故障排查](部署指南.md)

---

## 🎉 配置完成!

配置完成后,你就可以:

1. ✅ 使用AI生成旅行计划
2. ✅ 保存和管理多个行程
3. ✅ 在地图上查看路线
4. ✅ 管理旅行预算
5. ✅ 云端同步数据

**开始你的智能旅行规划之旅吧!** 🚀

---

**提示:** 如果你使用的是助教提供的阿里云百炼Key,请直接使用,无需自己申请。

