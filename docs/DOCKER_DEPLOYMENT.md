# AI Web Planner - 阿里云 Docker 镜像部署指南

> 📦 **镜像仓库**: 阿里云容器镜像服务
> 🔗 **GitHub**: https://github.com/Xiaolong-Dai/AIWebPlanner
> 📅 **更新日期**: 2025-01-03

本文档提供详细的步骤，帮助你从阿里云容器镜像服务拉取并部署 AI Web Planner 应用。

---

## 📋 目录

- [前置要求](#前置要求)
- [快速开始（5分钟）](#快速开始5分钟)
- [方式一：使用 Docker Compose 部署（推荐）](#方式一使用-docker-compose-部署推荐)
- [方式二：手动部署前后端容器](#方式二手动部署前后端容器)
- [验证部署](#验证部署)
- [功能测试](#功能测试)
- [常见问题](#常见问题)
- [停止和清理](#停止和清理)
- [高级配置](#高级配置)

---

## 前置要求

### 1. 安装 Docker

#### Windows

1. 下载 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. 双击安装包，按照向导完成安装
3. 安装完成后重启电脑
4. 验证安装：
   ```powershell
   docker --version
   docker-compose --version
   ```

#### macOS

1. 下载 [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
2. 拖动到 Applications 文件夹
3. 启动 Docker Desktop
4. 验证安装：
   ```bash
   docker --version
   docker-compose --version
   ```

#### Linux (Ubuntu/Debian)

```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 将当前用户添加到 docker 组
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 2. 系统要求

| 项目 | 最低要求 | 推荐配置 |
|------|---------|---------|
| **内存** | 4GB RAM | 8GB RAM |
| **磁盘空间** | 5GB | 10GB |
| **网络** | 稳定的互联网连接 | 宽带连接 |
| **操作系统** | Windows 10+, macOS 10.15+, Linux | 最新版本 |

---

## 快速开始（5分钟）

如果你只想快速体验应用，复制以下命令执行：

### Windows (PowerShell)

```powershell
# 1. 创建网络
docker network create ai-planner-network

# 2. 启动后端服务
docker run -d `
  --name ai-web-planner-backend `
  --network ai-planner-network `
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

### Linux / macOS (Bash)

# 1. 创建网络
docker network create ai-planner-network

# 2. 启动后端服务
docker run -d \
  --name ai-web-planner-backend \
  --network ai-planner-network \
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

**访问应用**: 打开浏览器访问 http://localhost:3000

---

## 方式一：使用 Docker Compose 部署（推荐）

这是最简单、最推荐的部署方式，自动处理容器编排、网络配置和健康检查。

### 步骤 1: 创建部署目录

```bash
# 创建项目目录
mkdir ai-web-planner-deploy
cd ai-web-planner-deploy
```

### 步骤 2: 创建 docker-compose.yml 文件

创建 `docker-compose.yml` 文件，内容如下：

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

### 步骤 3: 启动应用

```bash
# 拉取最新镜像并启动
docker-compose pull
docker-compose up -d

# 查看启动日志
docker-compose logs -f
```

**预期输出：**
```
✔ Network ai-planner-network          Created
✔ Container ai-web-planner-backend    Healthy
✔ Container ai-web-planner-frontend   Started
```

### 步骤 4: 访问应用

打开浏览器访问：**http://localhost:3000**

---

## 方式二：手动部署前后端容器

如果你不想使用 Docker Compose，可以手动部署。

### 步骤 1: 创建 Docker 网络

```bash
docker network create ai-planner-network
```

### 步骤 2: 拉取镜像

```bash
# 拉取后端镜像
docker pull crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/backend:latest

# 拉取前端镜像
docker pull crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/frontend:latest
```

### 步骤 3: 启动后端容器

```bash
docker run -d \
  --name ai-web-planner-backend \
  --network ai-planner-network \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  --restart unless-stopped \
  crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/backend:latest
```

### 步骤 4: 验证后端健康状态

```bash
# 等待 10 秒让后端启动
sleep 10

# 检查后端健康状态
curl http://localhost:3001/health
```

**预期输出：**
```json
{"status":"ok","timestamp":"2025-01-03T..."}
```

### 步骤 5: 启动前端容器

```bash
docker run -d \
  --name ai-web-planner-frontend \
  --network ai-planner-network \
  -p 3000:80 \
  --restart unless-stopped \
  crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/frontend:latest
```

### 步骤 6: 验证容器运行状态

docker ps | grep ai-web-planner
```

**预期输出：**
```
CONTAINER ID   IMAGE                                                                                    STATUS
xxxxx          .../ai-web-planner/frontend:latest   Up 30 seconds   0.0.0.0:3000->80/tcp
xxxxx          .../ai-web-planner/backend:latest    Up 45 seconds   0.0.0.0:3001->3001/tcp
```

---

## 验证部署

### 1. 检查容器状态

```bash
# 使用 Docker Compose
docker-compose ps

# 或手动检查
docker ps | grep ai-web-planner
```

### 2. 查看容器日志

```bash
# 使用 Docker Compose
docker-compose logs -f frontend
docker-compose logs -f backend

# 或手动查看
docker logs -f ai-web-planner-frontend
docker logs -f ai-web-planner-backend
```

### 3. 测试后端 API

```bash
# 健康检查
curl http://localhost:3001/health

# 预期返回
{"status":"ok","timestamp":"..."}
```

### 4. 测试前端访问

打开浏览器访问：**http://localhost:3000**

**应该看到：**
- ✅ AI Web Planner 首页
- ✅ 登录/注册界面
- ✅ 地图正常显示（进入"创建行程"页面）

---

## 功能测试

### 测试地图显示

1. 点击"创建行程"
2. 地图应该正常加载（高德地图）
3. 可以拖动、缩放地图

### 测试语音识别

1. 点击语音输入按钮（麦克风图标）
2. 允许浏览器访问麦克风
3. 说话测试（例如："我想去日本旅游，5天，预算1万元"）
4. 应该能看到实时识别的文字

### 测试 AI 生成行程

1. 输入旅行需求（文字或语音）
   - 示例："我想去北京旅游，3天，预算5000元，喜欢历史文化"
2. 点击"生成行程"按钮
3. 等待 5-10 秒
4. 应该能看到详细的旅行计划：
   - 每日行程安排
   - 景点推荐
   - 餐厅推荐
   - 交通方案
   - 预算分解

### 测试用户认证

1. 点击"注册"
2. 输入邮箱和密码
3. 应该能成功注册并登录

---

## 常见问题

### Q1: 端口被占用怎么办？

**错误信息：**
```
Error: bind: address already in use
```

**解决方案：**

**方案 1: 更换端口**

修改 `docker-compose.yml` 中的端口映射：
```yaml
ports:
  - "8080:80"  # 前端改为 8080
  - "8081:3001"  # 后端改为 8081
```

**方案 2: 停止占用端口的程序**

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/macOS
lsof -i :3000
kill -9 <PID>
```

### Q2: 容器启动失败怎么办？

**检查步骤：**

1. 查看容器日志
   ```bash
   docker logs ai-web-planner-frontend
   docker logs ai-web-planner-backend
   ```

2. 检查容器状态
   ```bash
   docker ps -a | grep ai-web-planner
   ```

3. 重启容器
   ```bash
   docker restart ai-web-planner-frontend
   docker restart ai-web-planner-backend
   ```

### Q3: 前端无法连接后端怎么办？

**检查步骤：**

1. 确认后端健康状态
   ```bash
   curl http://localhost:3001/health
   ```

2. 检查网络连接
   ```bash
   docker network inspect ai-planner-network
   ```

3. 确认前端 Nginx 配置
   ```bash
   docker exec ai-web-planner-frontend cat /etc/nginx/conf.d/default.conf | grep -A 5 "location /api/"
   ```

   应该看到：
   ```nginx
   location /api/ {
       proxy_pass http://backend:3001;
       ...
   }
   ```

### Q4: 地图不显示怎么办？

**可能原因：**
- 高德地图 API Key 未配置或失效
- 网络连接问题

**检查方法：**

1. 打开浏览器控制台（F12）
2. 查看是否有地图加载错误
3. 检查环境变量是否注入
   ```bash
   docker exec ai-web-planner-frontend sh -c "grep -o '4760097a9ac4d94d0295fff44f39b8dd' /usr/share/nginx/html/assets/*.js | head -1"
   ```

### Q5: AI 生成行程失败怎么办？

**可能原因：**
- 阿里云百炼 API Key 未配置或失效
- 后端服务未启动
- 网络连接问题

**检查方法：**

1. 打开浏览器控制台（F12）
2. 查看错误信息
3. 确认后端服务正常
   ```bash
   curl http://localhost:3001/health
   ```

4. 查看后端日志
   ```bash
   docker logs ai-web-planner-backend --tail 50
   ```

### Q6: 如何更新到最新版本？

```bash
# 使用 Docker Compose
docker-compose pull
docker-compose up -d

# 或手动更新
docker pull crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/frontend:latest
docker pull crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/backend:latest

docker stop ai-web-planner-frontend ai-web-planner-backend
docker rm ai-web-planner-frontend ai-web-planner-backend

# 重新启动（参考上面的启动步骤）
```

---

## 停止和清理

### 停止应用

```bash
# 使用 Docker Compose
docker-compose stop

# 或手动停止
docker stop ai-web-planner-frontend ai-web-planner-backend
```

### 删除容器

```bash
# 使用 Docker Compose
docker-compose down

# 或手动删除
docker rm ai-web-planner-frontend ai-web-planner-backend

```

### 删除镜像（可选）

```bash
docker rmi crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/frontend:latest
docker rmi crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/backend:latest
```

### 删除网络（可选）

```bash
docker network rm ai-planner-network
```

### 完全清理

```bash
# 使用 Docker Compose
docker-compose down -v --rmi all

# 或手动清理
docker stop ai-web-planner-frontend ai-web-planner-backend
docker rm ai-web-planner-frontend ai-web-planner-backend
docker rmi crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/frontend:latest
docker rmi crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/backend:latest
docker network rm ai-planner-network
```

---

## 高级配置

### 自定义端口

修改 `docker-compose.yml`：

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # 自定义前端端口
  backend:
    ports:
      - "8081:3001"  # 自定义后端端口
```

### 使用特定版本镜像

```yaml
services:
  frontend:
    image: crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/frontend:20250103
  backend:
    image: crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/backend:20250103
```

### 资源限制

```yaml
services:
  frontend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

---

## 镜像版本说明

阿里云镜像仓库提供多个版本标签：

| 标签 | 说明 | 示例 |
|------|------|------|
| `latest` | 最新版本（推荐） | `frontend:latest` |
| `YYYYMMDD` | 按日期标记的版本 | `frontend:20250103` |
| `commit-hash` | 按 Git 提交哈希标记 | `frontend:069e267` |

**推荐使用 `latest` 标签获取最新功能和修复。**

---

## 技术支持

### 获取帮助

如果遇到问题，请：

1. 查看本文档的"常见问题"部分
2. 查看容器日志获取详细错误信息
3. 访问项目 GitHub 仓库提交 Issue：https://github.com/Xiaolong-Dai/AIWebPlanner/issues

### 日志收集

提交问题时，请附上以下信息：

```bash
# 系统信息
docker --version
docker-compose --version

# 容器状态
docker ps -a | grep ai-web-planner

# 容器日志
docker logs ai-web-planner-frontend --tail 50
docker logs ai-web-planner-backend --tail 50

# 网络信息
docker network inspect ai-planner-network
```

---

## 项目信息

- **项目名称**: AI Web Planner
- **GitHub 仓库**: https://github.com/Xiaolong-Dai/AIWebPlanner
- **阿里云镜像仓库**: crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner
- **许可证**: MIT License
- **作者**: Xiaolong Dai

---

## 架构说明

```
┌─────────────────────────────────────────┐
│         Docker Compose 环境              │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │    │   Backend    │  │
│  │   (Nginx)    │◄───│   (Node.js)  │  │
│  │   Port: 3000 │    │   Port: 3001 │  │
│  └──────────────┘    └──────────────┘  │
│         │                    │          │
│         └────────┬───────────┘          │
│                  │                      │
│         ai-planner-network              │
└─────────────────────────────────────────┘
           │
           ▼
    用户访问 http://localhost:3000
```

### 服务说明

**Frontend 服务：**
- **镜像**: 基于 `nginx:alpine`
- **端口**: 3000 (宿主机) → 80 (容器)
- **功能**:
  - 提供 React 应用
  - 反向代理 API 请求到后端
  - 静态资源缓存
  - Gzip 压缩

**Backend 服务：**
- **镜像**: 基于 `node:18-alpine`
- **端口**: 3001 (宿主机) → 3001 (容器)
- **功能**:
  - 代理阿里云百炼 API
  - 解决 CORS 跨域问题
  - 健康检查端点

---

**祝你使用愉快！** 🎉