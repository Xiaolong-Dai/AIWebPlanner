# AI Web Planner - 安装运行指南

## 目录

1. [系统要求](#系统要求)
2. [本地开发环境搭建](#本地开发环境搭建)
3. [Supabase 配置](#supabase-配置)
4. [API Keys 获取](#api-keys-获取)
5. [Docker 部署](#docker-部署)
6. [常见问题](#常见问题)

## 系统要求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **浏览器**: Chrome, Firefox, Safari, Edge（最新版本）
- **Docker**（可选）: >= 20.10.0

## 本地开发环境搭建

### 1. 克隆项目

```bash
git clone https://github.com/your-username/AI-Web-Planner.git
cd AI-Web-Planner
```

### 2. 安装依赖

```bash
cd frontend
npm install
```

### 3. 配置环境变量

复制环境变量模板：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，填入您的配置：

```env
# Supabase 配置（必需）
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 高德地图 API（必需）
VITE_AMAP_KEY=your-amap-key

# AI 大语言模型 API（必需）
VITE_ALIYUN_LLM_API_KEY=your-llm-api-key
VITE_ALIYUN_LLM_ENDPOINT=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation

# 科大讯飞语音识别（可选）
VITE_XFEI_APP_ID=your-app-id
VITE_XFEI_API_KEY=your-api-key
VITE_XFEI_API_SECRET=your-api-secret
```

### 4. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

### 5. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

## Supabase 配置

### 1. 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)
2. 点击 "Start your project"
3. 创建新组织（如果还没有）
4. 创建新项目，设置项目名称和数据库密码
5. 等待项目初始化完成（约 2 分钟）

### 2. 获取 API 凭证

1. 进入项目设置（Settings）
2. 点击 "API" 标签
3. 复制以下信息：
   - **Project URL**: 即 `VITE_SUPABASE_URL`
   - **anon public**: 即 `VITE_SUPABASE_ANON_KEY`

### 3. 初始化数据库

1. 在 Supabase 控制台，点击左侧菜单的 "SQL Editor"
2. 点击 "New query"
3. 复制 `docs/DATABASE_SCHEMA.md` 中的所有 SQL 语句
4. 粘贴到编辑器中
5. 点击 "Run" 执行

执行成功后，您将看到以下表：
- `travel_plans` - 旅行计划表
- `expenses` - 费用记录表
- `user_preferences` - 用户偏好表

### 4. 验证配置

1. 在 Supabase 控制台，点击 "Table Editor"
2. 确认所有表已创建
3. 点击 "Authentication" > "Policies"
4. 确认 RLS 策略已启用

## API Keys 获取

### 高德地图 API

1. 访问 [高德开放平台](https://lbs.amap.com)
2. 注册并登录
3. 进入控制台 > 应用管理 > 我的应用
4. 点击 "创建新应用"
5. 填写应用信息
6. 添加 Key，选择 "Web 服务"
7. 复制生成的 Key

**注意**: 
- 需要实名认证
- 免费额度：每日 30 万次调用

### 科大讯飞语音识别 API（可选）

1. 访问 [讯飞开放平台](https://www.xfyun.cn)
2. 注册并登录
3. 进入控制台 > 语音听写（流式版）
4. 创建新应用
5. 获取 APPID、APIKey、APISecret

**注意**:
- 免费额度：每日 500 次调用
- 需要实名认证

### 阿里云通义千问 API

1. 访问 [阿里云百炼平台](https://bailian.console.aliyun.com)
2. 开通服务（可能需要实名认证）
3. 创建应用
4. 获取 API Key
5. 记录 API Endpoint

**注意**:
- 新用户有免费额度
- 按调用次数计费

## Docker 部署

### 方式一：使用 Docker Compose（推荐）

1. **配置环境变量**

创建 `.env` 文件（在项目根目录）：

```env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
VITE_AMAP_KEY=your_key
VITE_ALIYUN_LLM_API_KEY=your_key
VITE_ALIYUN_LLM_ENDPOINT=your_endpoint
```

2. **构建并启动**

```bash
docker-compose up -d
```

3. **访问应用**

打开浏览器访问 `http://localhost:3000`

4. **查看日志**

```bash
docker-compose logs -f
```

5. **停止服务**

```bash
docker-compose down
```

### 方式二：手动构建 Docker 镜像

1. **构建镜像**

```bash
cd frontend
docker build -t ai-web-planner:latest .
```

2. **运行容器**

```bash
docker run -d \
  -p 3000:80 \
  -e VITE_SUPABASE_URL=your_url \
  -e VITE_SUPABASE_ANON_KEY=your_key \
  -e VITE_AMAP_KEY=your_key \
  -e VITE_ALIYUN_LLM_API_KEY=your_key \
  -e VITE_ALIYUN_LLM_ENDPOINT=your_endpoint \
  --name ai-planner \
  ai-web-planner:latest
```

3. **查看日志**

```bash
docker logs -f ai-planner
```

4. **停止容器**

```bash
docker stop ai-planner
docker rm ai-planner
```

## 常见问题

### Q1: 启动后无法登录？

**A**: 检查以下几点：
1. Supabase URL 和 Key 是否正确
2. Supabase 项目是否已启动
3. 数据库表是否已创建
4. 浏览器控制台是否有错误信息

### Q2: 环境变量不生效？

**A**: 
1. 确保文件名是 `.env.local`（不是 `.env`）
2. 重启开发服务器
3. 清除浏览器缓存
4. 检查变量名是否以 `VITE_` 开头

### Q3: Docker 构建失败？

**A**:
1. 检查 Docker 是否正在运行
2. 确保有足够的磁盘空间
3. 尝试清理 Docker 缓存：`docker system prune -a`
4. 检查 Dockerfile 路径是否正确

### Q4: 地图不显示？

**A**:
1. 检查高德地图 Key 是否正确
2. 确认 Key 的服务平台是 "Web 服务"
3. 检查浏览器控制台的错误信息
4. 确认域名是否在高德平台白名单中

### Q5: 语音识别不工作？

**A**:
1. 检查浏览器是否支持 Web Speech API
2. 确认已授予麦克风权限
3. 检查科大讯飞 API 配置是否正确
4. 查看浏览器控制台的错误信息

### Q6: 如何更新 API Keys？

**A**:
- **开发环境**: 修改 `.env.local` 文件后重启服务器
- **生产环境**: 在应用的"设置"页面更新配置
- **Docker**: 更新环境变量后重新启动容器

## 技术支持

如遇到其他问题，请：
1. 查看浏览器控制台的错误信息
2. 检查 `docs/DATABASE_SCHEMA.md` 确认数据库配置
3. 在 GitHub 提交 Issue

## 下一步

- 阅读 [README.md](../README.md) 了解项目详情
- 查看 [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) 了解数据库设计
- 开始使用应用创建您的第一个旅行计划！

