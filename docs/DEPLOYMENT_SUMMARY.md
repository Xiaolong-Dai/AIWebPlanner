# 🚀 部署方案总结

## 📋 部署架构

```
┌─────────────────────────────────────────────────────┐
│              Docker Compose 环境                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────┐         ┌─────────────────┐  │
│  │    Frontend     │         │    Backend      │  │
│  │  (React + Nginx)│◄────────│   (Node.js)     │  │
│  │   Port: 3000    │  Proxy  │   Port: 3001    │  │
│  └─────────────────┘         └─────────────────┘  │
│         │                            │             │
│         │                            │             │
│         └────────────┬───────────────┘             │
│                      │                             │
│            ai-planner-network                      │
└─────────────────────────────────────────────────────┘
                       │
                       ▼
              用户访问 localhost:3000
                       │
                       ▼
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
   Supabase                    阿里云百炼
  (数据库/认证)                  (AI服务)
```

---

## 🎯 部署方案对比

| 特性 | Docker部署 | 本地开发 | Vercel部署 |
|------|-----------|---------|-----------|
| **难度** | ⭐ 简单 | ⭐⭐ 中等 | ⭐⭐⭐ 复杂 |
| **速度** | 🚀 5分钟 | ⏱️ 10分钟 | ⏱️ 15分钟 |
| **环境隔离** | ✅ 完全隔离 | ❌ 依赖本地 | ✅ 云端隔离 |
| **生产就绪** | ✅ 是 | ❌ 否 | ✅ 是 |
| **成本** | 💰 免费 | 💰 免费 | 💰 免费 |
| **推荐场景** | 生产部署 | 开发调试 | 在线演示 |

---

## ✅ 推荐方案: Docker部署

### 为什么选择Docker？

1. ✅ **一键部署** - 运行一个脚本即可
2. ✅ **环境一致** - 开发、测试、生产环境完全一致
3. ✅ **易于维护** - 统一的容器管理
4. ✅ **快速回滚** - 出问题可以快速回退
5. ✅ **资源隔离** - 不影响宿主机环境
6. ✅ **符合规范** - 项目要求使用Docker

---

## 🚀 Docker快速部署（5分钟）

### 第一步: 安装Docker

**Windows/Mac:**
- 下载并安装 Docker Desktop: https://www.docker.com/products/docker-desktop

**Linux:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl start docker
```

### 第二步: 运行部署脚本

**Windows:**
```bash
docker-deploy.bat
```

**Linux/Mac:**
```bash
chmod +x docker-deploy.sh
./docker-deploy.sh
```

### 第三步: 访问应用

打开浏览器: **http://localhost:3000**

### 第四步: 配置服务

1. 进入 **设置页面**
2. 配置API Key
3. 测试服务
4. 开始使用

---

## 📦 部署文件清单

### Docker相关文件

```
AI Web Planner/
├── docker-compose.yml          # Docker编排配置
├── .dockerignore               # Docker忽略文件
├── docker-deploy.bat           # Windows部署脚本
├── docker-deploy.sh            # Linux/Mac部署脚本
│
├── frontend/
│   ├── Dockerfile              # 前端镜像构建
│   └── nginx.conf              # Nginx配置（含API代理）
│
└── backend/
    ├── Dockerfile              # 后端镜像构建
    ├── package.json            # 后端依赖
    └── server.js               # 后端代理服务
```

### 文档文件

```
docs/
├── DOCKER_DEPLOYMENT.md        # Docker部署详细指南
├── DEPLOYMENT_SUMMARY.md       # 本文档
├── ALIYUN_BAILIAN_SETUP.md     # 阿里云百炼配置
├── QUICK_START_FIX.md          # 快速修复指南
└── database_setup.sql          # 数据库初始化脚本
```

---

## 🔧 核心组件说明

### 1. Frontend容器

**基础镜像**: `nginx:alpine`

**功能**:
- 提供React应用静态文件
- 反向代理API请求到后端
- Gzip压缩
- 静态资源缓存

**配置文件**: `frontend/nginx.conf`

**关键配置**:
```nginx
# API代理 - 转发到后端服务
location /api/ {
    proxy_pass http://backend:3001;
    # ... 其他代理配置
}
```

### 2. Backend容器

**基础镜像**: `node:18-alpine`

**功能**:
- 代理阿里云百炼API
- 解决CORS跨域问题
- 提供健康检查端点

**入口文件**: `backend/server.js`

**端点**:
- `GET /health` - 健康检查
- `POST /api/llm-proxy` - AI服务代理

### 3. Docker网络

**网络名称**: `ai-planner-network`

**类型**: bridge

**作用**: 容器间通信

---

## 🎯 部署流程详解

### 构建阶段

```bash
docker-compose build
```

**Frontend构建**:
1. 安装Node.js依赖
2. 运行 `npm run build`
3. 将构建产物复制到Nginx
4. 配置Nginx反向代理

**Backend构建**:
1. 安装Node.js依赖
2. 复制服务器代码
3. 暴露3001端口

### 启动阶段

```bash
docker-compose up -d
```

**启动顺序**:
1. 创建网络 `ai-planner-network`
2. 启动Backend容器
3. 等待Backend健康检查通过
4. 启动Frontend容器
5. 等待Frontend健康检查通过

### 健康检查

**Backend**:
```bash
curl http://localhost:3001/health
# 返回: {"status":"ok","message":"代理服务器运行正常"}
```

**Frontend**:
```bash
curl http://localhost:3000
# 返回: HTML内容
```

---

## 📊 资源使用

### 镜像大小

- **Frontend**: ~50MB (nginx:alpine + 静态文件)
- **Backend**: ~150MB (node:18-alpine + 依赖)
- **总计**: ~200MB

### 运行时资源

- **CPU**: < 5% (空闲时)
- **内存**: 
  - Frontend: ~10MB
  - Backend: ~50MB
  - 总计: ~60MB

### 磁盘空间

- 镜像: ~200MB
- 容器: ~10MB
- 日志: ~100MB (可配置)
- **总计**: ~310MB

---

## 🛠️ 常用操作

### 启动和停止

```bash
# 启动
docker-compose up -d

# 停止
docker-compose down

# 重启
docker-compose restart
```

### 查看日志

```bash
# 所有日志
docker-compose logs -f

# 前端日志
docker-compose logs -f frontend

# 后端日志
docker-compose logs -f backend
```

### 更新应用

```bash
# 1. 停止服务
docker-compose down

# 2. 拉取最新代码
git pull

# 3. 重新构建
docker-compose build

# 4. 启动服务
docker-compose up -d
```

### 清理资源

```bash
# 停止并删除容器
docker-compose down

# 删除镜像
docker rmi ai-web-planner_frontend ai-web-planner_backend

# 清理所有未使用资源
docker system prune -a
```

---

## 🚢 生产部署建议

### 1. 使用镜像仓库

```bash
# 构建镜像
docker-compose build

# 标记镜像
docker tag ai-web-planner_frontend:latest registry.cn-beijing.aliyuncs.com/your-namespace/ai-web-planner-frontend:v1.0

# 推送镜像
docker push registry.cn-beijing.aliyuncs.com/your-namespace/ai-web-planner-frontend:v1.0
```

### 2. 配置环境变量

创建 `.env` 文件:
```bash
VITE_SUPABASE_URL=你的URL
VITE_SUPABASE_ANON_KEY=你的Key
```

### 3. 配置日志

在 `docker-compose.yml` 中添加:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### 4. 配置重启策略

```yaml
restart: unless-stopped
```

### 5. 使用健康检查

已在 `docker-compose.yml` 中配置。

---

## ❓ 常见问题

### Q1: 端口被占用

**解决方案**: 修改 `docker-compose.yml` 中的端口映射
```yaml
ports:
  - "8080:80"  # 改用8080端口
```

### Q2: 构建失败

**解决方案**: 配置Docker镜像加速
```json
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com"
  ]
}
```

### Q3: 容器无法启动

**检查日志**:
```bash
docker-compose logs backend
docker-compose logs frontend
```

### Q4: 前端无法连接后端

**检查网络**:
```bash
docker-compose exec frontend ping backend
```

---

## 📚 相关文档

- [Docker部署详细指南](DOCKER_DEPLOYMENT.md)
- [阿里云百炼配置](ALIYUN_BAILIAN_SETUP.md)
- [快速修复指南](QUICK_START_FIX.md)
- [数据库初始化](database_setup.sql)

---

## 🎉 总结

### 部署优势

1. ✅ **简单快速** - 5分钟完成部署
2. ✅ **环境一致** - 消除"在我机器上能跑"问题
3. ✅ **易于维护** - 统一的容器管理
4. ✅ **生产就绪** - 可直接用于生产环境
5. ✅ **符合规范** - 满足项目要求

### 下一步

1. 运行部署脚本
2. 访问应用
3. 配置API服务
4. 开始使用

---

**部署愉快！** 🚀

