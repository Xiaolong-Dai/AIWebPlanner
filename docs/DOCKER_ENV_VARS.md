# Docker 环境变量注入技术文档

## 📋 问题说明

### 现象

**本地开发环境和 Docker 部署环境的前端渲染结果不一致**

- **本地开发** (`npm run dev`)：界面正常，所有功能可用
- **Docker 部署**：界面元素缺失，部分功能无法使用

### 根本原因

**Vite 的环境变量是在构建时注入的，而不是运行时！**

---

## 🔍 技术原理

### Vite 环境变量处理机制

#### 1. 开发模式 (`npm run dev`)

```javascript
// Vite 在运行时读取 .env 文件
const apiKey = import.meta.env.VITE_AMAP_KEY;
// ↓ 运行时从 .env 文件读取
// apiKey = "4760097a9ac4d94d0295fff44f39b8dd"
```

**流程**：
1. 启动 Vite 开发服务器
2. Vite 读取 `frontend/.env` 文件
3. 在浏览器请求时，动态替换 `import.meta.env.*`
4. ✅ 环境变量可用

#### 2. 生产构建 (`npm run build`)

```javascript
// Vite 在构建时将 import.meta.env.* 替换为实际值
const apiKey = import.meta.env.VITE_AMAP_KEY;
// ↓ 构建后的代码（如果环境变量存在）
// const apiKey = "4760097a9ac4d94d0295fff44f39b8dd";
// ↓ 构建后的代码（如果环境变量不存在）
// const apiKey = undefined;
```

**流程**：
1. 运行 `npm run build`
2. Vite 读取环境变量（从 `.env` 或系统 ENV）
3. **静态替换**所有 `import.meta.env.*` 为实际值
4. 生成静态 HTML/JS/CSS 文件
5. ⚠️ 构建后无法再修改环境变量

---

## ❌ 错误的 Docker 配置

### 之前的 Dockerfile（错误）

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build  # ❌ 此时没有环境变量！
```

**问题**：
- 构建时没有环境变量
- Vite 将所有 `import.meta.env.VITE_*` 替换为 `undefined`
- 构建后的 JS 文件中所有 API Key 都是空的

### 之前的 docker-compose.yml（错误）

```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
  environment:  # ❌ 这是运行时环境变量，构建时无效！
    - VITE_AMAP_KEY=${VITE_AMAP_KEY}
```

**问题**：
- `environment` 是**运行时**环境变量
- Vite 需要的是**构建时**环境变量
- 构建时无法读取这些变量

---

## ✅ 正确的 Docker 配置

### 修复后的 Dockerfile

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# ========================================
# 定义构建参数 (从 docker build --build-arg 传入)
# ========================================
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_AMAP_KEY
ARG VITE_AMAP_SECRET
ARG VITE_ALIYUN_LLM_API_KEY
ARG VITE_ALIYUN_LLM_ENDPOINT
ARG VITE_XFEI_APP_ID
ARG VITE_XFEI_API_KEY
ARG VITE_XFEI_API_SECRET

# ========================================
# 将构建参数转换为环境变量 (Vite 会在构建时读取)
# ========================================
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_AMAP_KEY=$VITE_AMAP_KEY
ENV VITE_AMAP_SECRET=$VITE_AMAP_SECRET
ENV VITE_ALIYUN_LLM_API_KEY=$VITE_ALIYUN_LLM_API_KEY
ENV VITE_ALIYUN_LLM_ENDPOINT=$VITE_ALIYUN_LLM_ENDPOINT
ENV VITE_XFEI_APP_ID=$VITE_XFEI_APP_ID
ENV VITE_XFEI_API_KEY=$VITE_XFEI_API_KEY
ENV VITE_XFEI_API_SECRET=$VITE_XFEI_API_SECRET

# 构建应用 (Vite 会读取上面的 ENV 并注入到代码中)
RUN npm run build  # ✅ 此时环境变量可用！
```

### 修复后的 docker-compose.yml

```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
    # ========================================
    # 构建时参数 (传递给 Dockerfile 的 ARG)
    # ========================================
    args:  # ✅ 使用 args 传递构建时参数
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
      - VITE_AMAP_KEY=${VITE_AMAP_KEY}
      - VITE_AMAP_SECRET=${VITE_AMAP_SECRET}
      - VITE_ALIYUN_LLM_API_KEY=${VITE_ALIYUN_LLM_API_KEY}
      - VITE_ALIYUN_LLM_ENDPOINT=${VITE_ALIYUN_LLM_ENDPOINT}
      - VITE_XFEI_APP_ID=${VITE_XFEI_APP_ID}
      - VITE_XFEI_API_KEY=${VITE_XFEI_API_KEY}
      - VITE_XFEI_API_SECRET=${VITE_XFEI_API_SECRET}
```

---

## 🚀 使用方法

### 方法 1：使用 docker-compose（推荐）

#### 1. 创建 `.env` 文件（项目根目录）

```bash
# .env (项目根目录，docker-compose 会读取)
VITE_SUPABASE_URL=https://blghnzrjwbmkkopvxfyo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_AMAP_KEY=4760097a9ac4d94d0295fff44f39b8dd
VITE_ALIYUN_LLM_API_KEY=sk-3a6fcd7c0b04482d8bc3596725520d18
VITE_ALIYUN_LLM_ENDPOINT=https://dashscope.aliyuncs.com/...
VITE_XFEI_APP_ID=81268405
VITE_XFEI_API_KEY=89c8b4049d35aa7cf759d0120a860648
VITE_XFEI_API_SECRET=YjU4OTBlOWEyOTkyZTgzMGY2ZjE3ZDg3
```

#### 2. 构建并运行

```bash
docker-compose build
docker-compose up -d
```

### 方法 2：使用自动化脚本（本地测试）

#### Windows (PowerShell)

```powershell
.\docker-build-local.ps1
```

#### Linux / macOS

```bash
chmod +x docker-build-local.sh
./docker-build-local.sh
```

**脚本功能**：
- ✅ 自动从 `frontend/.env` 读取配置
- ✅ 检查必需的环境变量
- ✅ 使用 `--build-arg` 传入所有环境变量
- ✅ 构建 Docker 镜像
- ✅ 可选：自动运行容器并打开浏览器

### 方法 3：手动构建（高级用户）

```bash
docker build \
  --build-arg VITE_SUPABASE_URL="https://xxx.supabase.co" \
  --build-arg VITE_SUPABASE_ANON_KEY="eyJxxx..." \
  --build-arg VITE_AMAP_KEY="xxx" \
  --build-arg VITE_ALIYUN_LLM_API_KEY="sk-xxx" \
  --build-arg VITE_ALIYUN_LLM_ENDPOINT="https://..." \
  --build-arg VITE_XFEI_APP_ID="xxx" \
  --build-arg VITE_XFEI_API_KEY="xxx" \
  --build-arg VITE_XFEI_API_SECRET="xxx" \
  -t ai-web-planner-frontend:local \
  -f frontend/Dockerfile \
  frontend
```

---

## 🔍 验证方法

### 1. 检查构建日志

构建时应该看到环境变量被传入：

```
Step 18/25 : ARG VITE_AMAP_KEY
 ---> Running in xxx
Step 19/25 : ENV VITE_AMAP_KEY=$VITE_AMAP_KEY
 ---> Running in xxx
```

### 2. 检查浏览器控制台

打开 http://localhost:3000，按 F12 打开控制台：

```javascript
// 检查 localStorage 中的配置
const config = JSON.parse(localStorage.getItem('ai-web-planner-api-config') || '{}');
console.log('API 配置:', config);
```

### 3. 测试功能

- **地图功能**：进入"创建行程"页面，地图应该正常显示
- **AI 功能**：输入旅行需求，AI 应该能生成行程
- **语音功能**：点击语音输入，应该能正常录音和识别

---

## 📊 对比总结

| 项目 | 本地开发 | Docker（错误） | Docker（正确） |
|------|---------|---------------|---------------|
| 环境变量来源 | `.env` 文件 | 无 | `--build-arg` |
| 注入时机 | 运行时 | - | 构建时 |
| Vite 读取 | ✅ 可以 | ❌ 不可以 | ✅ 可以 |
| 构建后的代码 | 正确的值 | `undefined` | 正确的值 |
| 功能状态 | ✅ 正常 | ❌ 失效 | ✅ 正常 |

---

## ⚠️ 常见问题

### Q1: 为什么不能在运行时传入环境变量？

**A**: 因为 Vite 构建后生成的是**静态文件**，所有 `import.meta.env.*` 已经被替换为实际值，无法在运行时动态修改。

```bash
# ❌ 这样做无效！
docker run -e VITE_AMAP_KEY=xxx ai-web-planner

# ✅ 必须在构建时传入
docker build --build-arg VITE_AMAP_KEY=xxx ...
```

### Q2: docker-compose 的 environment 和 args 有什么区别？

**A**:
- `environment`: **运行时**环境变量，容器启动后可用
- `args`: **构建时**参数，传递给 Dockerfile 的 ARG

Vite 需要的是**构建时**参数，所以必须使用 `args`。

### Q3: GitHub Actions 部署的镜像为什么能正常工作？

**A**: GitHub Actions 配置文件（`.github/workflows/docker-build.yml`）中已经正确配置了所有 `build-args`，从 GitHub Secrets 读取并传入。

---

## 📚 相关文档

- [Vite 环境变量文档](https://vitejs.dev/guide/env-and-mode.html)
- [Docker ARG vs ENV](https://docs.docker.com/engine/reference/builder/#arg)
- [Docker Compose build.args](https://docs.docker.com/compose/compose-file/build/#args)

