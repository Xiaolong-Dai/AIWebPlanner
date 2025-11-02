# AI Web Planner

智能旅行规划 Web 应用 - 通过 AI 理解用户需求，自动生成详细旅行路线和预算建议

## 📖 项目简介

AI Web Planner 是一款基于人工智能的智能旅行规划应用，旨在简化旅行规划流程，为用户提供个性化的旅行路线推荐和实时预算管理功能。

### 核心特性

- 🤖 **AI 智能规划**: 通过大语言模型理解用户需求，自动生成详细行程
- 🎤 **多模态输入**: 支持语音和文字输入，让规划更便捷
- 🗺️ **地图可视化**: 基于高德地图的行程可视化展示，支持真实路线规划
- 🚗 **智能交通规划**: 自动生成景点间交通方案，包含城际交通（航班/高铁）信息
- 💰 **预算管理**: 智能预算分配和实时费用追踪，支持语音录入费用
- ⚠️ **预算预警**: 三级预算预警系统（80%/90%/100%），及时提醒超支风险
- ☁️ **云端同步**: 基于 Supabase 的多设备数据同步
- 🔒 **安全可靠**: 完善的用户认证和数据隔离机制

## 🛠️ 技术栈

### 前端
- **框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **UI 组件库**: Ant Design 5
- **状态管理**: Zustand
- **路由**: React Router v6
- **HTTP 客户端**: Axios
- **图表**: Recharts
- **日期处理**: Day.js

### 后端服务
- **认证**: Supabase Auth
- **数据库**: Supabase PostgreSQL
- **实时同步**: Supabase Realtime

### 第三方服务
- **地图服务**: 高德地图 API
- **语音识别**: 科大讯飞语音识别 API
- **AI 模型**: 阿里云通义千问（百炼平台）

## 🚀 快速开始

> **📚 完整部署文档**:
> - [⚡ 5分钟快速部署](docs/QUICK_DEPLOY_GUIDE.md) - Vercel 一键部署
> - [📖 完整部署指南](docs/COMPLETE_DEPLOYMENT_GUIDE.md) - 包含所有部署方案
> - [✅ 部署检查清单](docs/DEPLOYMENT_CHECKLIST_2025.md) - 确保部署成功

---

### 方式一: Vercel 部署（推荐 - 最简单）

**优势**:
- ✅ 完全免费
- ✅ 自动部署 (每次 push 自动更新)
- ✅ 全球 CDN (访问速度快)
- ✅ 5 分钟上线

**快速步骤**:

1. **推送代码到 GitHub**
   ```bash
   git push origin main
   ```

2. **连接 Vercel**
   - 访问 https://vercel.com
   - 用 GitHub 登录
   - 导入你的仓库

3. **配置环境变量**
   - 添加 Supabase、高德地图、阿里云等 API 密钥
   - 点击 Deploy

4. **访问应用**
   - 获得 `https://你的项目名.vercel.app` 域名

**详细教程**: [5分钟快速部署指南](docs/QUICK_DEPLOY_GUIDE.md)

---

### 方式二: Linux虚拟机部署（生产环境）

#### 快速部署（10分钟）

**第一步 - Windows上打包:**
```bash
package-for-linux.bat
```

**第二步 - 上传到Linux:**
```bash
scp AI-Web-Planner-Deploy.tar.gz user@linux-ip:/home/user/
```

**第三步 - Linux上部署:**
```bash
tar -xzf AI-Web-Planner-Deploy.tar.gz
cd AI-Web-Planner
chmod +x deploy-linux.sh
./deploy-linux.sh
```

**第四步 - 访问应用:**
```
http://虚拟机IP:3000
```

详细文档: [Linux快速部署指南](docs/QUICK_DEPLOY_LINUX.md)

---

### 方式二: Docker本地部署（开发测试）

#### 前置要求

- Docker >= 20.10
- Docker Compose >= 2.0

#### 一键部署

**Windows (PowerShell - 推荐):**
```powershell
.\docker-deploy.ps1
```

**Windows (CMD):**
```bash
docker-deploy.bat
```

**Linux/Mac:**
```bash
bash docker-deploy.sh
```

> **注意**: Windows 用户推荐使用 PowerShell 脚本 (`docker-deploy.ps1`),避免编码问题。

#### 访问应用

- 前端应用: http://localhost:3000
- 后端API: http://localhost:3001
- 健康检查: http://localhost:3001/health

详细文档: [Docker部署指南](docs/DOCKER_DEPLOYMENT.md)

---

### 方式四: 本地开发

#### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0

#### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/your-username/AI-Web-Planner.git
cd AI-Web-Planner
```

2. **安装依赖**

```bash
cd frontend
npm install
```

3. **配置环境变量**

复制 `.env.example` 为 `.env.local` 并填入您的 API Keys：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，填入以下配置：

```env
# Supabase 配置
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 高德地图 API
VITE_AMAP_KEY=your_amap_web_key

# 科大讯飞语音识别 API（可选）
VITE_XFEI_APP_ID=your_xfyun_app_id
VITE_XFEI_API_KEY=your_xfyun_api_key
VITE_XFEI_API_SECRET=your_xfyun_api_secret

# AI 大语言模型 API
VITE_ALIYUN_LLM_API_KEY=your_aliyun_bailian_api_key
VITE_ALIYUN_LLM_ENDPOINT=your_aliyun_bailian_endpoint
```

4. **初始化数据库**

在 Supabase 控制台的 SQL Editor 中执行 `docs/DATABASE_SCHEMA.md` 中的 SQL 语句。

5. **启动开发服务器**

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

## 🐳 Docker 部署

### 构建镜像

```bash
docker build -t ai-web-planner:latest ./frontend
```

### 运行容器

```bash
docker run -p 3000:80 \
  -e VITE_SUPABASE_URL=your_url \
  -e VITE_SUPABASE_ANON_KEY=your_key \
  -e VITE_AMAP_KEY=your_key \
  -e VITE_ALIYUN_LLM_API_KEY=your_key \
  -e VITE_ALIYUN_LLM_ENDPOINT=your_endpoint \
  ai-web-planner:latest
```

### 使用 Docker Compose

```bash
docker-compose up -d
```

## 🔑 API 密钥配置

### 方式一：环境变量（推荐用于部署）

在 `.env.local` 文件中配置所有 API Keys。

### 方式二：应用内配置（推荐用于开发）

1. 启动应用后，访问"设置"页面
2. 在各个标签页中输入对应的 API Keys
3. 点击"保存配置"

所有配置将保存在浏览器的 localStorage 中，不会上传到服务器。

### 如何获取 API Keys

#### Supabase
1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 在项目设置 > API 中获取 URL 和 anon key

#### 高德地图
1. 访问 [lbs.amap.com](https://lbs.amap.com)
2. 注册并登录
3. 创建应用，申请 Web 服务 Key

#### 科大讯飞（可选）
1. 访问 [xfyun.cn](https://www.xfyun.cn)
2. 注册并创建语音识别应用
3. 获取 App ID、API Key 和 API Secret

#### 阿里云通义千问
1. 访问 [百炼平台](https://bailian.console.aliyun.com)
2. 开通服务并创建应用
3. 获取 API Key 和 Endpoint

## 📁 项目结构

```
AI-Web-Planner/
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/      # 通用组件
│   │   ├── pages/           # 页面组件
│   │   ├── hooks/           # 自定义 Hooks
│   │   ├── services/        # API 调用服务
│   │   ├── utils/           # 工具函数
│   │   ├── types/           # TypeScript 类型定义
│   │   ├── store/           # Zustand 状态管理
│   │   ├── constants/       # 常量定义
│   │   ├── App.tsx          # 主应用组件
│   │   └── main.tsx         # 应用入口
│   ├── public/              # 静态资源
│   ├── .env.example         # 环境变量模板
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docs/                    # 文档
│   ├── DATABASE_SCHEMA.md   # 数据库设计
│   ├── SETUP.md             # 安装指南
│   └── API.md               # API 文档
├── .gitignore
├── .dockerignore
├── docker-compose.yml
└── README.md
```

## 🎯 开发进度

### ✅ 第一阶段：项目基础搭建（已完成 - 100%）
- [x] 初始化 Vite + React + TypeScript 项目
- [x] 配置 ESLint, Prettier, TypeScript strict mode
- [x] 搭建项目目录结构
- [x] 配置安全文件（.gitignore, .env）
- [x] 安装核心依赖
- [x] 创建基础路由和页面框架
- [x] 集成 Supabase 认证
- [x] 创建 API Key 配置页面
- [x] 设计数据库表结构

### ✅ 第二阶段：核心功能开发（已完成 - 100%）
- [x] 语音识别集成（科大讯飞 WebSocket API）
- [x] AI 行程规划核心逻辑（阿里云通义千问）
- [x] 地图展示功能（高德地图 API）
- [x] 预算管理功能（费用记录、统计、分析）
- [x] 用户认证和数据管理
- [x] 行程 CRUD 操作

### ✅ 第三阶段：完善与优化（已完成 - 100%）
- [x] UI/UX 优化（响应式设计、动画效果）
- [x] 性能优化（代码分割、懒加载）
- [x] 数据同步功能（Supabase Realtime）
- [x] 错误处理（完善的错误提示和恢复机制）
- [x] 代码质量检查（ESLint、TypeScript strict mode）
- [x] 景点间交通规划功能
- [x] 真实路线规划（高德地图路线 API）
- [x] 城际交通信息（航班/高铁）
- [x] 费用语音录入功能
- [x] 预算超支提醒功能

### 🚀 第四阶段：部署与文档（进行中 - 90%）
- [x] Docker 镜像构建
- [x] Docker Compose 编排
- [x] Linux 虚拟机部署脚本
- [x] 编写完整文档
- [x] 准备演示材料
- [ ] 生产环境部署
- [ ] 性能监控和日志

## 📝 开发规范

### Git 提交规范

遵循 Conventional Commits 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

类型（type）：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式化
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

### 代码规范

- 组件文件：PascalCase（如：`TravelPlan.tsx`）
- 函数/变量：camelCase（如：`generateTripPlan`）
- 常量：UPPER_SNAKE_CASE（如：`MAX_BUDGET`）
- CSS 类：kebab-case（如：`trip-card`）

## 🔒 安全说明

- ✅ 所有 API Keys 通过环境变量或 localStorage 管理
- ✅ 敏感文件已添加到 .gitignore
- ✅ 使用 Supabase RLS 实现数据隔离
- ✅ 密码使用 bcrypt 加密存储
- ✅ 所有请求通过 HTTPS 加密传输

**⚠️ 重要提示**: 请勿将任何 API Key 提交到 Git 仓库！

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题，请通过 GitHub Issues 联系我们。

