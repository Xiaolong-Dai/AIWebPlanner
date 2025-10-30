# 🚀 阿里云百炼配置指南

由于阿里云百炼API不支持浏览器直接调用（CORS限制），我们需要使用代理服务器。

---

## 📋 方案选择

### 方案A: 本地开发 + Vercel部署（推荐）

- ✅ 本地开发使用本地代理
- ✅ 生产环境使用Vercel Serverless Function
- ✅ 完全免费
- ✅ 配置简单

### 方案B: 仅本地开发

- ✅ 只在本地运行
- ✅ 不需要部署
- ⚠️ 无法在线访问

---

## 🔧 方案A: 完整配置（推荐）

### 第一步: 本地开发环境配置

#### 1. 安装依赖

在项目根目录运行:

```bash
npm install express cors
```

#### 2. 启动代理服务器

打开**新的终端窗口**，运行:

```bash
node proxy-server.js
```

你应该看到:
```
🚀 代理服务器运行在 http://localhost:3001
📡 代理端点: http://localhost:3001/api/llm-proxy
💚 健康检查: http://localhost:3001/health
```

**保持这个终端窗口运行！**

#### 3. 启动前端应用

在**另一个终端窗口**，运行:

```bash
cd frontend
npm run dev
```

#### 4. 配置阿里云百炼

1. 打开浏览器: http://localhost:5173
2. 进入 **设置页面**
3. 配置AI服务:
   ```
   API Key: 你的阿里云百炼API Key
   API Endpoint: https://bailian.aliyun.com/v1/api/completions
   ```
4. 点击 **保存配置**
5. 点击 **测试 AI 服务**

#### 5. 测试

1. 进入 **创建计划** 页面
2. 输入: "我想去北京，3天，预算5000元"
3. 点击发送
4. 应该能正常生成行程了！✅

---

### 第二步: 部署到Vercel（生产环境）

#### 1. 安装Vercel CLI

```bash
npm install -g vercel
```

#### 2. 登录Vercel

```bash
vercel login
```

#### 3. 部署项目

在项目根目录运行:

```bash
vercel
```

按照提示操作:
- Set up and deploy? **Y**
- Which scope? 选择你的账号
- Link to existing project? **N**
- Project name? **ai-web-planner** (或其他名称)
- In which directory is your code located? **./** (当前目录)

#### 4. 配置环境变量（可选）

如果你想在Vercel中存储API Key:

```bash
vercel env add ALIYUN_API_KEY
```

输入你的阿里云API Key

#### 5. 生产部署

```bash
vercel --prod
```

部署完成后，你会得到一个URL，例如:
```
https://ai-web-planner.vercel.app
```

#### 6. 在生产环境使用

访问你的Vercel URL，应用会自动使用Vercel的代理端点 `/api/llm-proxy`

---

## 🔧 方案B: 仅本地开发

如果你只想在本地使用，只需要:

### 1. 安装依赖

```bash
npm install express cors
```

### 2. 启动代理服务器

```bash
node proxy-server.js
```

### 3. 启动前端

```bash
cd frontend
npm run dev
```

### 4. 配置并使用

按照方案A的步骤4-5操作

---

## 📝 package.json 脚本（可选）

为了方便，可以在根目录的 `package.json` 添加脚本:

```json
{
  "scripts": {
    "dev": "concurrently \"node proxy-server.js\" \"cd frontend && npm run dev\"",
    "proxy": "node proxy-server.js",
    "frontend": "cd frontend && npm run dev"
  }
}
```

然后安装 `concurrently`:

```bash
npm install -D concurrently
```

之后只需运行:

```bash
npm run dev
```

就会同时启动代理服务器和前端应用！

---

## 🧪 测试代理服务器

### 测试健康检查

```bash
curl http://localhost:3001/health
```

应该返回:
```json
{"status":"ok","message":"代理服务器运行正常"}
```

### 测试代理端点

```bash
curl -X POST http://localhost:3001/api/llm-proxy \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "你好",
    "apiKey": "你的API_Key",
    "endpoint": "https://bailian.aliyun.com/v1/api/completions"
  }'
```

---

## ❓ 常见问题

### Q1: 代理服务器启动失败

**错误:** `Error: listen EADDRINUSE: address already in use :::3001`

**解决方案:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

### Q2: 前端无法连接代理

**检查:**
1. 代理服务器是否运行
2. 端口是否正确（3001）
3. 控制台是否有错误

### Q3: Vercel部署后无法使用

**检查:**
1. `vercel.json` 配置是否正确
2. `api/llm-proxy.ts` 文件是否存在
3. Vercel日志中是否有错误

### Q4: 仍然有CORS错误

**可能原因:**
1. 代理服务器未启动
2. 前端代码未正确使用代理
3. 浏览器缓存问题（清除缓存重试）

---

## 🎯 完整工作流程

### 开发环境

```bash
# 终端1: 启动代理
node proxy-server.js

# 终端2: 启动前端
cd frontend
npm run dev

# 浏览器访问
http://localhost:5173
```

### 生产环境

```bash
# 部署到Vercel
vercel --prod

# 访问生产URL
https://your-app.vercel.app
```

---

## 📊 架构说明

### 开发环境
```
浏览器 → http://localhost:5173 (前端)
         ↓
         http://localhost:3001/api/llm-proxy (本地代理)
         ↓
         https://bailian.aliyun.com (阿里云百炼)
```

### 生产环境
```
浏览器 → https://your-app.vercel.app (前端)
         ↓
         https://your-app.vercel.app/api/llm-proxy (Vercel Function)
         ↓
         https://bailian.aliyun.com (阿里云百炼)
```

---

## ✅ 验收清单

- [ ] 代理服务器成功启动
- [ ] 前端应用成功启动
- [ ] 健康检查返回正常
- [ ] 设置页面配置成功
- [ ] AI服务测试通过
- [ ] 能够生成旅行计划
- [ ] Vercel部署成功（如需要）
- [ ] 生产环境正常工作（如需要）

---

## 🎉 完成！

完成上述步骤后，你就可以在本地和生产环境中使用阿里云百炼了！

如有问题，请查看控制台日志或联系我。😊

