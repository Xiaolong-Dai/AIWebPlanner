# AI Web Planner

智能旅行规划 Web 应用 - 通过 AI 理解用户需求，自动生成详细旅行路线和预算建议

[![GitHub](https://img.shields.io/badge/GitHub-AIWebPlanner-blue?logo=github)](https://github.com/Xiaolong-Dai/AIWebPlanner)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://github.com/Xiaolong-Dai/AIWebPlanner)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📖 项目简介

AI Web Planner 是一款基于人工智能的智能旅行规划应用，通过 AI 理解用户需求，自动生成详细旅行路线和预算建议。

### ✨ 核心功能

1. **🤖 智能行程规划**
   - 支持语音和文字输入旅行需求
   - AI 自动生成详细的每日行程安排
   - 包含交通、住宿、景点、餐厅推荐
   - 地图可视化展示行程路线

2. **💰 费用预算管理**
   - AI 自动分解预算到各个类别
   - 支持语音录入费用
   - 实时预算追踪和统计
   - 三级预算预警系统（80%/90%/100%）

3. **☁️ 用户管理与数据同步**
   - 用户注册/登录认证
   - 多设备云端数据同步
   - 保存和管理多份旅行计划

---

## 🛠️ 技术栈

### 前端
- React 19 + TypeScript
- Vite 7
- Ant Design 5
- Zustand (状态管理)
- 高德地图 API (地图可视化)
- 科大讯飞 API (语音识别)

### 后端
- Node.js + Express (API 代理服务)
- Supabase (认证 + PostgreSQL 数据库)
- 阿里云通义千问 (AI 大语言模型)

### 部署
- Docker + Docker Compose
- GitHub Actions (CI/CD)
- 阿里云容器镜像服务

---

## 🚀 快速开始

### � Docker 部署（推荐 - 开箱即用）

**镜像信息**:
- 前端: `crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/frontend:latest`
- 后端: `crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/backend:latest`

**特点**:
- ✅ 已内置所有 API 密钥
- ✅ 开箱即用，无需配置
- ✅ 支持 Windows、macOS、Linux

#### 方式一: 使用 Docker Compose（推荐）

**步骤 1: 创建 docker-compose.yml**

```yaml
version: '3.8'

services:
  backend:
    image: crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/backend:latest
    container_name: ai-web-planner-backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    restart: unless-stopped
    networks:
      - ai-planner-network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3001/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    image: crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/frontend:latest
    container_name: ai-web-planner-frontend
    ports:
      - "3000:80"
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - ai-planner-network

networks:
  ai-planner-network:
    driver: bridge
```

**步骤 2: 启动应用**

```bash
# 拉取最新镜像
docker-compose pull

# 启动服务
docker-compose up -d

# 查看运行状态
docker-compose ps
```

**步骤 3: 访问应用**
- 前端: http://localhost:3000
- 后端: http://localhost:3001/health

#### 方式二: 手动部署

**Windows PowerShell:**
```powershell
# 创建网络
docker network create ai-planner-network

# 启动后端
docker run -d `
  --name ai-web-planner-backend `
  --network ai-planner-network `
  --network-alias backend `
  -p 3001:3001 `
  crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/backend:latest

# 等待后端启动
Start-Sleep -Seconds 10

# 启动前端
docker run -d `
  --name ai-web-planner-frontend `
  --network ai-planner-network `
  -p 3000:80 `
  crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/frontend:latest

# 打开浏览器
Start-Process "http://localhost:3000"
```

**Linux/macOS:**
```bash
# 创建网络
docker network create ai-planner-network

# 启动后端
docker run -d \
  --name ai-web-planner-backend \
  --network ai-planner-network \
  --network-alias backend \
  -p 3001:3001 \
  crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/backend:latest

# 等待后端启动
sleep 10

# 启动前端
docker run -d \
  --name ai-web-planner-frontend \
  --network ai-planner-network \
  -p 3000:80 \
  crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/frontend:latest

# 访问 http://localhost:3000
```

---

## ✅ 验证部署

**检查容器状态:**
```bash
docker ps
```

应该看到两个容器都在运行：
- `ai-web-planner-backend` (端口 3001)
- `ai-web-planner-frontend` (端口 3000)

**测试后端 API:**
```bash
curl http://localhost:3001/health
```

应该返回：`{"status":"ok","message":"代理服务器运行正常"}`

**访问前端:**
打开浏览器访问 http://localhost:3000

---

## 🧪 功能测试

### 1. 用户注册/登录
- 访问 http://localhost:3000
- 点击"注册"，输入邮箱和密码
- 查收验证邮件并完成验证
- 登录系统

### 2. 语音识别测试
- 进入"创建行程"页面
- 点击语音输入按钮（麦克风图标）
- 说话测试（例如："我想去日本旅游，5天，预算1万元"）
- 应该能看到语音转文字的结果

### 3. AI 生成行程测试
- 输入旅行需求（文字或语音）
- 点击"生成行程"按钮
- 等待 5-10 秒，应该能看到详细的行程计划
- 地图上会显示行程路线和景点标记

### 4. 预算管理测试
- 进入"预算管理"页面
- 点击"添加费用"
- 输入费用信息（支持语音输入）
- 查看预算统计图表

---

## 🛑 停止和清理

**停止应用（Docker Compose）:**
```bash
docker-compose down
```

**停止应用（手动部署）:**
```bash
docker stop ai-web-planner-frontend ai-web-planner-backend
docker rm ai-web-planner-frontend ai-web-planner-backend
docker network rm ai-planner-network
```

---

## 📚 详细文档

- **[Docker 部署指南](docs/DOCKER_DEPLOYMENT.md)**: 详细的 Docker 部署说明
- **[GitHub Secrets 配置](docs/GITHUB_SECRETS_SETUP.md)**: CI/CD 配置指南
- **[用户使用手册](docs/USER_MANUAL.md)**: 应用功能和使用说明
- **[故障排除指南](docs/TROUBLESHOOTING.md)**: 常见问题解决方案
- **[项目设置指南](docs/SETUP.md)**: 本地开发环境配置

---

## 🔑 API 密钥说明

**本项目使用的 API 密钥已内置在 Docker 镜像中，无需额外配置。**

使用的 API 服务：
1. **阿里云百炼平台**（AI 大语言模型）- 有效期至少 3 个月
2. **高德地图 API**（地图展示、路线规划）- 长期有效
3. **科大讯飞 API**（语音识别）- 长期有效
4. **Supabase**（认证、数据库）- 长期有效

所有 API 密钥均已通过 GitHub Actions 在构建时注入到 Docker 镜像中。

---

## 🏗️ 项目架构

```
┌─────────────────────────────────────────────────────────────┐
│                         用户浏览器                            │
│                    http://localhost:3000                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    前端容器 (Nginx + React)                   │
│         ai-web-planner-frontend:latest (端口 80)             │
│                                                               │
│  - React 19 应用                                              │
│  - 高德地图集成                                               │
│  - 科大讯飞语音识别                                           │
│  - 内置 API 密钥                                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ /api/* 请求
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  后端容器 (Node.js + Express)                 │
│        ai-web-planner-backend:latest (端口 3001)             │
│                                                               │
│  - API 代理服务                                               │
│  - 阿里云百炼 API 调用                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      第三方服务                               │
│                                                               │
│  - Supabase (认证 + 数据库)                                   │
│  - 阿里云百炼 (AI 模型)                                       │
│  - 高德地图 API                                               │
│  - 科大讯飞 API                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 GitHub 提交记录

本项目保留了完整的 Git 提交历史，记录了从项目初始化到最终完成的所有开发过程。

**查看提交记录**: https://github.com/Xiaolong-Dai/AIWebPlanner/commits/main

---

## 🎓 本地开发（可选）

如果你想进行本地开发，请参考 **[项目设置指南](docs/SETUP.md)**。

**前置要求**:
- Node.js >= 18.0.0
- npm >= 9.0.0

**快速步骤**:
```bash
# 克隆仓库
git clone https://github.com/Xiaolong-Dai/AIWebPlanner.git
cd AIWebPlanner

# 安装依赖
cd frontend
npm install

# 配置环境变量（需要自己的 API Keys）
cp .env.example .env.local

# 启动开发服务器
npm run dev
```

详细说明请查看 [docs/SETUP.md](docs/SETUP.md)

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 👨‍💻 作者

**Xiaolong Dai**

- GitHub: [@Xiaolong-Dai](https://github.com/Xiaolong-Dai)
- 项目仓库: [AIWebPlanner](https://github.com/Xiaolong-Dai/AIWebPlanner)

---

## 🙏 致谢

感谢以下开源项目和服务：

- [React](https://react.dev/) - 前端框架
- [Ant Design](https://ant.design/) - UI 组件库
- [Supabase](https://supabase.com/) - 后端服务
- [阿里云百炼](https://bailian.console.aliyun.com/) - AI 大语言模型
- [高德地图](https://lbs.amap.com/) - 地图服务
- [科大讯飞](https://www.xfyun.cn/) - 语音识别服务

---

## � 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue: https://github.com/Xiaolong-Dai/AIWebPlanner/issues
- Pull Request: https://github.com/Xiaolong-Dai/AIWebPlanner/pulls

---

**祝你使用愉快！** 🎉