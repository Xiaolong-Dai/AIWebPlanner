# AI Web Planner - 项目提交文档

## 📋 项目信息

- **项目名称**: AI Web Planner - 智能旅行规划 Web 应用
- **GitHub 仓库**: https://github.com/Xiaolong-Dai/AIWebPlanner
- **作者**: Xiaolong Dai
- **提交日期**: 2025-11-03

---

## 🎯 项目简介

AI Web Planner 是一款基于人工智能的智能旅行规划应用，通过 AI 理解用户需求，自动生成详细旅行路线和预算建议。

### 核心功能

1. **智能行程规划**
   - 支持语音和文字输入旅行需求
   - AI 自动生成详细的每日行程安排
   - 包含交通、住宿、景点、餐厅推荐
   - 地图可视化展示行程路线

2. **费用预算管理**
   - AI 自动分解预算到各个类别
   - 支持语音录入费用
   - 实时预算追踪和统计
   - 三级预算预警系统（80%/90%/100%）

3. **用户管理与数据同步**
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

## 🐳 Docker 镜像部署指南

### 📦 镜像信息

**阿里云镜像仓库地址**:
- **前端镜像**: `crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/frontend:latest`
- **后端镜像**: `crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/backend:latest`

**镜像特点**:
- ✅ 已内置所有 API 密钥（阿里云百炼、高德地图、科大讯飞、Supabase）
- ✅ 开箱即用，无需额外配置
- ✅ 通过 GitHub Actions 自动构建和推送
- ✅ 支持 Windows、macOS、Linux 系统

---

### 🚀 快速部署（5分钟）

#### 前置要求

1. **安装 Docker**
   - Windows: https://docs.docker.com/desktop/install/windows-install/
   - macOS: https://docs.docker.com/desktop/install/mac-install/
   - Linux: https://docs.docker.com/engine/install/

2. **验证安装**
   ```bash
   docker --version
   docker-compose --version
   ```

---

#### 方式一: 使用 Docker Compose 部署（推荐）

**步骤 1: 创建部署目录**
```bash
mkdir ai-web-planner-deploy
cd ai-web-planner-deploy
```

**步骤 2: 创建 docker-compose.yml 文件**

创建文件 `docker-compose.yml`，内容如下：

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

**步骤 3: 启动应用**
```bash
# 拉取最新镜像
docker-compose pull

# 启动服务
docker-compose up -d

# 查看运行状态
docker-compose ps
```

**步骤 4: 访问应用**
- 前端应用: http://localhost:3000
- 后端 API: http://localhost:3001/health

---

#### 方式二: 手动部署（不使用 Docker Compose）

**Windows PowerShell:**
```powershell
# 1. 创建网络
docker network create ai-planner-network

# 2. 启动后端服务
docker run -d `
  --name ai-web-planner-backend `
  --network ai-planner-network `
  --network-alias backend `
  -p 3001:3001 `
  crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/backend:latest

# 3. 等待后端启动（约 10 秒）
Start-Sleep -Seconds 10

# 4. 启动前端服务
docker run -d `
  --name ai-web-planner-frontend `
  --network ai-planner-network `
  -p 3000:80 `
  crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/frontend:latest

# 5. 打开浏览器
Start-Process "http://localhost:3000"
```

**Linux/macOS:**
```bash
# 1. 创建网络
docker network create ai-planner-network

# 2. 启动后端服务
docker run -d \
  --name ai-web-planner-backend \
  --network ai-planner-network \
  --network-alias backend \
  -p 3001:3001 \
  crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/backend:latest

# 3. 等待后端启动（约 10 秒）
sleep 10

# 4. 启动前端服务
docker run -d \
  --name ai-web-planner-frontend \
  --network ai-planner-network \
  -p 3000:80 \
  crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/frontend:latest

# 5. 打开浏览器访问
# http://localhost:3000
```

---

### ✅ 验证部署

**1. 检查容器状态**
```bash
docker ps
```

应该看到两个容器都在运行：
- `ai-web-planner-backend` (端口 3001)
- `ai-web-planner-frontend` (端口 3000)

**2. 测试后端 API**
```bash
curl http://localhost:3001/health
```

应该返回：
```json
{"status":"ok","message":"代理服务器运行正常"}
```

**3. 测试前端访问**

打开浏览器访问 http://localhost:3000，应该能看到应用首页。

---

### 🧪 功能测试

#### 1. 用户注册/登录
- 访问 http://localhost:3000
- 点击"注册"，输入邮箱和密码
- 查收验证邮件并完成验证
- 登录系统

#### 2. 语音识别测试
- 进入"创建行程"页面
- 点击语音输入按钮（麦克风图标）
- 说话测试（例如："我想去日本旅游，5天，预算1万元"）
- 应该能看到语音转文字的结果

#### 3. AI 生成行程测试
- 输入旅行需求（文字或语音）
  - 目的地：日本
  - 天数：5天
  - 预算：10000元
  - 偏好：美食、动漫
- 点击"生成行程"按钮
- 等待 5-10 秒，应该能看到详细的行程计划
- 地图上会显示行程路线和景点标记

#### 4. 预算管理测试
- 进入"预算管理"页面
- 点击"添加费用"
- 输入费用信息（支持语音输入）
- 查看预算统计图表
- 测试预算预警功能（当支出超过 80% 时会有提示）

---

### 🛑 停止和清理

**停止应用（使用 Docker Compose）:**
```bash
docker-compose down
```

**停止应用（手动部署）:**
```bash
docker stop ai-web-planner-frontend ai-web-planner-backend
docker rm ai-web-planner-frontend ai-web-planner-backend
docker network rm ai-planner-network
```

**删除镜像（可选）:**
```bash
docker rmi crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/frontend:latest
docker rmi crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/backend:latest
```

---

## 🔑 API 密钥说明

**本项目使用的 API 密钥已内置在 Docker 镜像中，无需额外配置。**

### 使用的 API 服务

1. **阿里云百炼平台（AI 大语言模型）**
   - 模型：Qwen-Plus
   - 用途：生成旅行行程规划
   - **密钥有效期**: 至少 3 个月（至 2026-02-03）

2. **高德地图 API**
   - 用途：地图展示、地理编码、路线规划
   - **密钥有效期**: 长期有效

3. **科大讯飞语音识别 API**
   - 用途：实时语音转文字
   - **密钥有效期**: 长期有效

4. **Supabase**
   - 用途：用户认证、数据库存储
   - **密钥有效期**: 长期有效

**注意**: 所有 API 密钥均已通过 GitHub Actions 在构建时注入到 Docker 镜像中，确保应用开箱即用。

---

## 📊 GitHub 提交记录

本项目保留了完整的 Git 提交历史，记录了从项目初始化到最终完成的所有开发过程。

**查看提交记录**:
- GitHub 网页: https://github.com/Xiaolong-Dai/AIWebPlanner/commits/main
- 命令行: `git log --oneline`

**主要开发里程碑**:
1. 项目初始化和基础框架搭建
2. 用户认证功能实现
3. 语音识别集成
4. AI 行程规划核心功能
5. 地图可视化实现
6. 预算管理功能
7. Docker 容器化部署
8. GitHub Actions CI/CD 配置
9. 阿里云镜像仓库集成
10. 文档完善和优化

---

## 📚 详细文档

项目包含完整的文档，位于 `docs/` 目录：

- **[Docker 部署指南](docs/DOCKER_DEPLOYMENT.md)**: 详细的 Docker 部署说明
- **[GitHub Secrets 配置](docs/GITHUB_SECRETS_SETUP.md)**: CI/CD 配置指南
- **[用户使用手册](docs/USER_MANUAL.md)**: 应用功能和使用说明
- **[故障排除指南](docs/TROUBLESHOOTING.md)**: 常见问题解决方案
- **[项目设置指南](docs/SETUP.md)**: 本地开发环境配置

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

## 🎓 总结

本项目实现了一个完整的智能旅行规划 Web 应用，具有以下特点：

1. **功能完整**: 实现了智能行程规划、预算管理、用户认证等核心功能
2. **技术先进**: 使用 React 19、TypeScript、AI 大语言模型等现代技术
3. **部署便捷**: 通过 Docker 容器化部署，开箱即用
4. **CI/CD 自动化**: 使用 GitHub Actions 自动构建和推送镜像
5. **文档完善**: 提供详细的部署和使用文档

**GitHub 仓库**: https://github.com/Xiaolong-Dai/AIWebPlanner

**Docker 镜像**:
- 前端: `crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/frontend:latest`
- 后端: `crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/backend:latest`

---

**感谢您的审阅！** 🎉

