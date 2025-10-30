# 🐳 Docker部署指南

## 项目架构

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

---

## 📋 前置要求

### 必须安装

- **Docker**: 20.10+
- **Docker Compose**: 2.0+

### 检查安装

```bash
docker --version
docker-compose --version
```

如果未安装，请访问:
- Docker Desktop: https://www.docker.com/products/docker-desktop

---

## 🚀 快速开始（5分钟）

### 方法1: 一键启动（推荐）

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 访问应用
# 浏览器打开: http://localhost:3000
```

### 方法2: 分步启动

```bash
# 1. 构建镜像
docker-compose build

# 2. 启动服务
docker-compose up -d

# 3. 查看状态
docker-compose ps

# 4. 查看日志
docker-compose logs -f frontend
docker-compose logs -f backend
```

---

## 📦 服务说明

### Frontend服务

- **镜像**: 基于 `nginx:alpine`
- **端口**: 3000 (宿主机) → 80 (容器)
- **功能**: 
  - 提供React应用
  - 反向代理API请求到后端
  - 静态资源缓存
  - Gzip压缩

### Backend服务

- **镜像**: 基于 `node:18-alpine`
- **端口**: 3001 (宿主机) → 3001 (容器)
- **功能**:
  - 代理阿里云百炼API
  - 解决CORS跨域问题
  - 健康检查端点

---

## 🔧 配置说明

### 环境变量（可选）

创建 `.env` 文件（可选，应用支持在设置页面配置）:

```bash
# Supabase配置
VITE_SUPABASE_URL=你的Supabase_URL
VITE_SUPABASE_ANON_KEY=你的Supabase_Key

# 科大讯飞配置
VITE_XFEI_APP_ID=你的讯飞APP_ID
VITE_XFEI_API_KEY=你的讯飞API_Key
VITE_XFEI_API_SECRET=你的讯飞API_Secret

# 高德地图配置
VITE_AMAP_KEY=你的高德地图Key
VITE_AMAP_SECRET=你的高德地图Secret

# 阿里云百炼配置
VITE_ALIYUN_LLM_API_KEY=你的阿里云API_Key
VITE_ALIYUN_LLM_ENDPOINT=https://bailian.aliyun.com/v1/api/completions
```

**注意**: 这些环境变量是可选的，应用支持在设置页面动态配置。

---

## 🎯 使用步骤

### 第一步: 启动服务

```bash
docker-compose up -d
```

等待1-2分钟，直到看到:
```
✔ Container ai-web-planner-backend   Started
✔ Container ai-web-planner-frontend  Started
```

### 第二步: 验证服务

```bash
# 检查服务状态
docker-compose ps

# 应该看到两个服务都是 "Up" 状态
```

**健康检查:**

```bash
# 检查后端
curl http://localhost:3001/health

# 应该返回: {"status":"ok","message":"代理服务器运行正常"}

# 检查前端
curl http://localhost:3000

# 应该返回HTML内容
```

### 第三步: 访问应用

打开浏览器: **http://localhost:3000**

### 第四步: 配置服务

1. 进入 **设置页面**
2. 配置API Key:
   - Supabase URL 和 Key
   - 阿里云百炼 API Key
   - 高德地图 API Key
3. 点击 **保存配置**
4. 测试各个服务

### 第五步: 开始使用

- 创建旅行计划
- AI生成行程
- 管理预算
- 查看地图

---

## 🛠️ 常用命令

### 启动和停止

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 停止并删除数据卷
docker-compose down -v

# 重启服务
docker-compose restart

# 重启单个服务
docker-compose restart frontend
docker-compose restart backend
```

### 查看日志

```bash
# 查看所有日志
docker-compose logs

# 实时查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs frontend
docker-compose logs backend

# 查看最近100行日志
docker-compose logs --tail=100
```

### 构建和更新

```bash
# 重新构建镜像
docker-compose build

# 强制重新构建（不使用缓存）
docker-compose build --no-cache

# 重新构建并启动
docker-compose up -d --build

# 拉取最新镜像
docker-compose pull
```

### 进入容器

```bash
# 进入前端容器
docker-compose exec frontend sh

# 进入后端容器
docker-compose exec backend sh

# 以root用户进入
docker-compose exec -u root frontend sh
```

### 清理

```bash
# 停止并删除容器
docker-compose down

# 删除所有未使用的镜像
docker image prune -a

# 删除所有未使用的容器、网络、镜像
docker system prune -a

# 查看磁盘使用
docker system df
```

---

## 📊 监控和调试

### 查看资源使用

```bash
# 查看容器资源使用
docker stats

# 查看特定容器
docker stats ai-web-planner-frontend ai-web-planner-backend
```

### 健康检查

```bash
# 查看容器健康状态
docker-compose ps

# 查看详细健康检查信息
docker inspect ai-web-planner-backend | grep -A 10 Health
```

### 网络调试

```bash
# 查看网络
docker network ls

# 查看网络详情
docker network inspect ai-web-planner_ai-planner-network

# 测试容器间连接
docker-compose exec frontend ping backend
```

---

## 🚢 生产部署

### 构建生产镜像

```bash
# 构建镜像
docker-compose build

# 标记镜像
docker tag ai-web-planner_frontend:latest your-registry/ai-web-planner-frontend:v1.0
docker tag ai-web-planner_backend:latest your-registry/ai-web-planner-backend:v1.0

# 推送到镜像仓库
docker push your-registry/ai-web-planner-frontend:v1.0
docker push your-registry/ai-web-planner-backend:v1.0
```

### 阿里云镜像仓库

```bash
# 登录阿里云镜像仓库
docker login --username=你的用户名 registry.cn-beijing.aliyuncs.com

# 标记镜像
docker tag ai-web-planner_frontend:latest registry.cn-beijing.aliyuncs.com/your-namespace/ai-web-planner-frontend:v1.0
docker tag ai-web-planner_backend:latest registry.cn-beijing.aliyuncs.com/your-namespace/ai-web-planner-backend:v1.0

# 推送镜像
docker push registry.cn-beijing.aliyuncs.com/your-namespace/ai-web-planner-frontend:v1.0
docker push registry.cn-beijing.aliyuncs.com/your-namespace/ai-web-planner-backend:v1.0
```

### 在服务器上部署

```bash
# 1. 拉取镜像
docker pull registry.cn-beijing.aliyuncs.com/your-namespace/ai-web-planner-frontend:v1.0
docker pull registry.cn-beijing.aliyuncs.com/your-namespace/ai-web-planner-backend:v1.0

# 2. 创建docker-compose.prod.yml
# 3. 启动服务
docker-compose -f docker-compose.prod.yml up -d
```

---

## ❓ 常见问题

### Q1: 端口被占用

**错误**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**解决方案**:

```bash
# 查看占用端口的进程
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9

# 或修改docker-compose.yml中的端口映射
ports:
  - "8080:80"  # 改用8080端口
```

### Q2: 构建失败

**错误**: `ERROR [internal] load metadata for docker.io/library/node:18-alpine`

**解决方案**:

```bash
# 检查网络连接
ping docker.io

# 配置Docker镜像加速
# 编辑 /etc/docker/daemon.json (Linux) 或 Docker Desktop设置 (Windows/Mac)
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://docker.mirrors.ustc.edu.cn"
  ]
}

# 重启Docker
sudo systemctl restart docker  # Linux
# 或重启Docker Desktop
```

### Q3: 容器无法启动

**检查日志**:

```bash
docker-compose logs backend
docker-compose logs frontend
```

**常见原因**:
1. 端口冲突
2. 依赖安装失败
3. 配置文件错误

### Q4: 前端无法连接后端

**检查**:

```bash
# 1. 确认后端运行正常
curl http://localhost:3001/health

# 2. 检查网络
docker network inspect ai-web-planner_ai-planner-network

# 3. 测试容器间连接
docker-compose exec frontend ping backend
```

### Q5: 数据库连接失败

**检查Supabase配置**:
1. 在设置页面填写正确的Supabase URL和Key
2. 确认数据库表已创建（执行`database_setup.sql`）
3. 检查网络连接

---

## 📝 最佳实践

### 1. 使用.env文件管理敏感信息

```bash
# 不要提交.env到Git
echo ".env" >> .gitignore
```

### 2. 定期清理

```bash
# 每周清理一次未使用的资源
docker system prune -a --volumes
```

### 3. 监控日志大小

```bash
# 限制日志大小（在docker-compose.yml中）
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### 4. 使用健康检查

已在docker-compose.yml中配置，确保服务正常运行。

### 5. 备份数据

```bash
# 导出容器数据
docker-compose exec backend sh -c 'tar czf /tmp/backup.tar.gz /app/data'
docker cp ai-web-planner-backend:/tmp/backup.tar.gz ./backup.tar.gz
```

---

## 🎉 完成！

现在你的AI Web Planner已经通过Docker成功部署！

**访问地址**: http://localhost:3000

**后端API**: http://localhost:3001

**健康检查**: http://localhost:3001/health

---

## 📞 需要帮助？

如果遇到问题:

1. 查看日志: `docker-compose logs -f`
2. 检查服务状态: `docker-compose ps`
3. 查看本文档的常见问题部分
4. 提供错误信息和日志

祝部署顺利！🚀

