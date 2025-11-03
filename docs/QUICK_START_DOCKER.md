# Docker 快速开始指南

## 🚀 快速部署（3 步完成）

### 步骤 1：准备环境变量

在**项目根目录**创建 `.env` 文件：

```bash
# .env (项目根目录)
VITE_SUPABASE_URL=https://blghnzrjwbmkkopvxfyo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsZ2huenJqd2Jta2tvcHZ4ZnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzU3MDIsImV4cCI6MjA3NzA1MTcwMn0.vI-IhKARaafxfwtfayXRh1HLhUUFHMHkmlcKRY9gm8U
VITE_AMAP_KEY=4760097a9ac4d94d0295fff44f39b8dd
VITE_ALIYUN_LLM_API_KEY=sk-3a6fcd7c0b04482d8bc3596725520d18
VITE_ALIYUN_LLM_ENDPOINT=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
VITE_XFEI_APP_ID=81268405
VITE_XFEI_API_KEY=89c8b4049d35aa7cf759d0120a860648
VITE_XFEI_API_SECRET=YjU4OTBlOWEyOTkyZTgzMGY2ZjE3ZDg3
```

**注意**：
- 文件位置：项目根目录（与 `docker-compose.yml` 同级）
- 不要提交到 Git（已在 `.gitignore` 中）

### 步骤 2：构建并启动

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d
```

### 步骤 3：访问应用

打开浏览器访问：**http://localhost:3000**

---

## 🎯 本地测试（使用自动化脚本）

如果你想在本地快速测试 Docker 镜像，使用我们提供的自动化脚本：

### Windows (PowerShell)

```powershell
# 运行脚本（会自动从 frontend/.env 读取配置）
.\docker-build-local.ps1
```

### Linux / macOS

```bash
# 添加执行权限
chmod +x docker-build-local.sh

# 运行脚本
./docker-build-local.sh
```

**脚本功能**：
- ✅ 自动读取 `frontend/.env` 文件
- ✅ 检查必需的环境变量是否配置
- ✅ 使用 `--build-arg` 传入所有环境变量
- ✅ 构建 Docker 镜像
- ✅ 可选：自动运行容器并打开浏览器

---

## 🔍 验证部署是否成功

### 1. 检查容器状态

```bash
docker-compose ps
```

应该看到：

```
NAME                        STATUS
ai-web-planner-backend      Up (healthy)
ai-web-planner-frontend     Up (healthy)
```

### 2. 检查日志

```bash
# 查看前端日志
docker logs ai-web-planner-frontend

# 查看后端日志
docker logs ai-web-planner-backend
```

### 3. 测试功能

打开 http://localhost:3000，测试以下功能：

- ✅ **地图显示**：进入"创建行程"页面，地图应该正常显示
- ✅ **AI 规划**：输入旅行需求，AI 应该能生成行程
- ✅ **语音输入**：点击语音按钮，应该能正常录音和识别
- ✅ **用户认证**：注册/登录功能正常

---

## 🛠️ 常用命令

### 启动服务

```bash
docker-compose up -d
```

### 停止服务

```bash
docker-compose down
```

### 重新构建

```bash
# 重新构建所有服务
docker-compose build

# 重新构建并启动
docker-compose up -d --build
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
```

### 进入容器

```bash
# 进入前端容器
docker exec -it ai-web-planner-frontend sh

# 进入后端容器
docker exec -it ai-web-planner-backend sh
```

---

## ⚠️ 常见问题

### Q1: 构建失败，提示找不到环境变量

**A**: 确保在**项目根目录**创建了 `.env` 文件，并包含所有必需的环境变量。

```bash
# 检查 .env 文件是否存在
ls -la .env

# 查看 .env 文件内容
cat .env
```

### Q2: 地图不显示

**A**: 检查 `VITE_AMAP_KEY` 是否正确配置：

```bash
# 查看构建日志，确认环境变量被传入
docker-compose build frontend 2>&1 | grep VITE_AMAP_KEY
```

### Q3: AI 功能不工作

**A**: 检查 `VITE_ALIYUN_LLM_API_KEY` 和 `VITE_ALIYUN_LLM_ENDPOINT` 是否正确配置。

### Q4: 端口冲突

**A**: 如果 3000 或 3001 端口被占用，修改 `docker-compose.yml`：

```yaml
frontend:
  ports:
    - "8080:80"  # 改为其他端口

backend:
  ports:
    - "8081:3001"  # 改为其他端口
```

### Q5: 修改了代码，如何重新部署？

**A**: 重新构建并启动：

```bash
docker-compose down
docker-compose build
docker-compose up -d
```

---

## 📊 部署架构

```
┌─────────────────────────────────────────┐
│         Docker Compose 网络              │
│                                          │
│  ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │    │   Backend    │  │
│  │   (Nginx)    │◄───│  (Node.js)   │  │
│  │   Port: 80   │    │  Port: 3001  │  │
│  └──────────────┘    └──────────────┘  │
│         │                                │
└─────────┼────────────────────────────────┘
          │
          ▼
    Host Port: 3000
```

**说明**：
- **Frontend**: Nginx 服务器，提供静态文件
- **Backend**: Node.js 代理服务器，处理 API 请求
- **网络**: 两个容器在同一个 Docker 网络中通信
- **端口映射**: 
  - Frontend: `3000:80` (主机 3000 → 容器 80)
  - Backend: `3001:3001` (主机 3001 → 容器 3001)

---

## 🎓 技术细节

### 为什么需要在构建时传入环境变量？

**Vite 的环境变量是在构建时注入的，而不是运行时！**

```javascript
// 开发模式 (npm run dev)
const apiKey = import.meta.env.VITE_AMAP_KEY;
// ↓ Vite 在运行时从 .env 读取

// 生产构建 (npm run build)
const apiKey = import.meta.env.VITE_AMAP_KEY;
// ↓ Vite 在构建时替换为实际值
// const apiKey = "4760097a9ac4d94d0295fff44f39b8dd";
```

**Docker 构建流程**：

1. `docker-compose.yml` 读取 `.env` 文件
2. 通过 `build.args` 传递给 Dockerfile
3. Dockerfile 的 `ARG` 接收参数
4. 转换为 `ENV` 环境变量
5. `npm run build` 时 Vite 读取 ENV
6. Vite 将 `import.meta.env.*` 替换为实际值
7. 生成静态文件

**详细技术文档**：[docs/DOCKER_ENV_VARS.md](./DOCKER_ENV_VARS.md)

---

## 📚 相关文档

- [Docker 环境变量技术文档](./DOCKER_ENV_VARS.md) - 详细技术原理
- [项目 README](../README.md) - 项目概述和功能介绍
- [API 密钥配置](../README.md#-api-密钥配置) - 如何获取 API Keys

---

## 🆘 需要帮助？

如果遇到问题：

1. 查看 [常见问题](#️-常见问题) 部分
2. 查看 [Docker 环境变量技术文档](./DOCKER_ENV_VARS.md)
3. 检查容器日志：`docker-compose logs`
4. 提交 Issue 到 GitHub 仓库

