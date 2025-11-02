# 🚀 AI Web Planner - 完整部署指南

> **最后更新**: 2025-11-02  
> **适用版本**: v1.0+  
> **难度**: ⭐⭐⭐ (中等)

---

## 📋 目录

1. [部署方案对比](#部署方案对比)
2. [前置准备](#前置准备)
3. [方案一: Vercel 部署 (推荐)](#方案一-vercel-部署-推荐)
4. [方案二: Docker 部署](#方案二-docker-部署)
5. [方案三: 传统服务器部署](#方案三-传统服务器部署)
6. [API 密钥配置](#api-密钥配置)
7. [常见问题](#常见问题)
8. [性能优化](#性能优化)

---

## 🎯 部署方案对比

| 方案 | 难度 | 成本 | 性能 | 推荐场景 |
|------|------|------|------|----------|
| **Vercel** | ⭐ 简单 | 免费 | ⭐⭐⭐⭐⭐ | 个人项目、演示 |
| **Docker** | ⭐⭐ 中等 | 服务器费用 | ⭐⭐⭐⭐ | 生产环境、企业 |
| **传统服务器** | ⭐⭐⭐ 复杂 | 服务器费用 | ⭐⭐⭐ | 自定义需求 |

---

## 📦 前置准备

### 1. 必需的账号

- ✅ **GitHub 账号** - 用于代码托管
- ✅ **Supabase 账号** - 用于数据库 (免费)
- ✅ **阿里云账号** - 用于 AI 服务 (可选)

### 2. 必需的 API 密钥

#### 2.1 Supabase (数据库 - 必需)

**注册地址**: https://supabase.com

**步骤**:
1. 注册并登录 Supabase
2. 点击 **New Project**
3. 填写项目信息:
   - Name: `ai-web-planner`
   - Database Password: 设置一个强密码
   - Region: 选择 `Northeast Asia (Tokyo)` (最近的区域)
4. 等待项目创建完成 (约 2 分钟)
5. 进入项目后，点击左侧 **Settings** → **API**
6. 复制以下信息:
   - `Project URL` → 这是你的 `VITE_SUPABASE_URL`
   - `anon public` key → 这是你的 `VITE_SUPABASE_ANON_KEY`

**创建数据表**:
1. 点击左侧 **SQL Editor**
2. 点击 **New Query**
3. 复制并执行 `docs/database_setup.sql` 中的 SQL 语句
4. 点击 **Run** 执行

#### 2.2 阿里云百炼 (AI 服务 - 推荐)

**注册地址**: https://bailian.console.aliyun.com

**步骤**:
1. 注册并登录阿里云
2. 访问百炼控制台: https://bailian.console.aliyun.com
3. 开通服务 (有免费额度)
4. 点击 **API-KEY 管理**
5. 创建新的 API Key
6. 复制 API Key → 这是你的 `VITE_ALIYUN_LLM_API_KEY`
7. 端点地址: `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`

#### 2.3 高德地图 (地图服务 - 必需)

**注册地址**: https://lbs.amap.com

**步骤**:
1. 注册并登录高德开放平台
2. 进入控制台: https://console.amap.com/dev/key/app
3. 点击 **创建新应用**
4. 应用名称: `AI Web Planner`
5. 点击 **添加 Key**
6. Key 名称: `Web端`
7. 服务平台: 选择 **Web端(JS API)**
8. 复制 Key → 这是你的 `VITE_AMAP_KEY`

#### 2.4 科大讯飞 (语音识别 - 可选)

**注册地址**: https://www.xfyun.cn

**步骤**:
1. 注册并登录科大讯飞开放平台
2. 进入控制台
3. 创建新应用
4. 开通 **语音听写(流式版)** 服务
5. 获取:
   - `APPID` → `VITE_XFEI_APP_ID`
   - `APIKey` → `VITE_XFEI_API_KEY`
   - `APISecret` → `VITE_XFEI_API_SECRET`

---

## 🌟 方案一: Vercel 部署 (推荐)

### 优势
- ✅ **完全免费** (个人项目)
- ✅ **自动部署** (每次 push 自动更新)
- ✅ **全球 CDN** (访问速度快)
- ✅ **HTTPS 自动配置**
- ✅ **零配置** (开箱即用)

### 步骤详解

#### 第一步: 推送代码到 GitHub

**1. 确认代码已提交**

```bash
# 查看当前状态
git status

# 如果有未提交的更改
git add .
git commit -m "准备部署到 Vercel"
git push origin main
```

**2. 确认仓库可访问**

访问你的 GitHub 仓库: `https://github.com/你的用户名/AIWebPlanner`

#### 第二步: 连接 Vercel

**1. 注册/登录 Vercel**

- 访问: https://vercel.com
- 点击 **Sign Up** (如果已有账号则 **Log In**)
- 选择 **Continue with GitHub**
- 授权 Vercel 访问你的 GitHub

**2. 导入项目**

- 在 Vercel Dashboard，点击 **Add New** → **Project**
- 在列表中找到 `AIWebPlanner` 仓库
- 点击 **Import**

**3. 配置构建设置**

Vercel 会自动检测到 `vercel.json` 配置文件，但请确认以下设置:

```
Framework Preset: Vite
Root Directory: ./
Build Command: cd frontend && npm install && npm run build
Output Directory: frontend/dist
Install Command: npm install
```

**4. 配置环境变量 (重要!)**

点击 **Environment Variables**，添加以下变量:

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_SUPABASE_URL` | 你的 Supabase URL | 必需 |
| `VITE_SUPABASE_ANON_KEY` | 你的 Supabase Key | 必需 |
| `VITE_AMAP_KEY` | 你的高德地图 Key | 必需 |
| `VITE_ALIYUN_LLM_API_KEY` | 你的阿里云 API Key | 推荐 |
| `VITE_ALIYUN_LLM_ENDPOINT` | `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions` | 推荐 |
| `VITE_XFEI_APP_ID` | 科大讯飞 APPID | 可选 |
| `VITE_XFEI_API_KEY` | 科大讯飞 APIKey | 可选 |
| `VITE_XFEI_API_SECRET` | 科大讯飞 APISecret | 可选 |

**注意**: 
- 所有环境变量都要选择 **Production**, **Preview**, **Development** 三个环境
- 点击 **Add** 添加每个变量

**5. 部署**

- 点击 **Deploy** 按钮
- 等待构建完成 (约 2-5 分钟)
- 构建成功后会显示 **Congratulations!**

**6. 访问你的应用**

- Vercel 会自动分配一个域名: `https://你的项目名.vercel.app`
- 点击 **Visit** 访问你的应用

#### 第三步: 配置自定义域名 (可选)

**1. 在 Vercel 项目设置中**

- 进入项目 → **Settings** → **Domains**
- 输入你的域名 (例如: `ai-planner.com`)
- 点击 **Add**

**2. 在域名提供商处配置 DNS**

添加以下记录:

```
类型: CNAME
名称: @
值: cname.vercel-dns.com
```

**3. 等待 DNS 生效**

- 通常需要 5-30 分钟
- Vercel 会自动配置 HTTPS 证书

---

## 🐳 方案二: Docker 部署

### 优势
- ✅ **环境一致性** (开发和生产环境相同)
- ✅ **易于扩展** (可以轻松添加更多服务)
- ✅ **完全控制** (自定义配置)

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 服务器 (至少 2GB RAM)

### 步骤详解

#### 第一步: 准备服务器

**1. 安装 Docker**

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 验证安装
docker --version
docker-compose --version
```

**2. 克隆代码**

```bash
# 克隆仓库
git clone https://github.com/你的用户名/AIWebPlanner.git
cd AIWebPlanner
```

#### 第二步: 配置环境变量

**1. 创建环境变量文件**

```bash
# 复制示例文件
cp .env.example .env

# 编辑环境变量
nano .env
```

**2. 填写环境变量**

```bash
# Supabase 配置
VITE_SUPABASE_URL=你的Supabase_URL
VITE_SUPABASE_ANON_KEY=你的Supabase_Key

# 高德地图配置
VITE_AMAP_KEY=你的高德地图Key
VITE_AMAP_SECRET=你的高德地图Secret

# 阿里云百炼配置
VITE_ALIYUN_LLM_API_KEY=你的阿里云API_Key
VITE_ALIYUN_LLM_ENDPOINT=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions

# 科大讯飞配置 (可选)
VITE_XFEI_APP_ID=你的科大讯飞APPID
VITE_XFEI_API_KEY=你的科大讯飞APIKey
VITE_XFEI_API_SECRET=你的科大讯飞APISecret
```

#### 第三步: 构建和启动

**1. 构建镜像**

```bash
# 构建所有服务
docker-compose build

# 或者分别构建
docker-compose build frontend
docker-compose build backend
```

**2. 启动服务**

```bash
# 启动所有服务 (后台运行)
docker-compose up -d

# 查看日志
docker-compose logs -f

# 查看服务状态
docker-compose ps
```

**3. 验证部署**

```bash
# 检查前端
curl http://localhost:3000

# 检查后端
curl http://localhost:3001/health
```

#### 第四步: 配置反向代理 (生产环境)

**使用 Nginx**

```bash
# 安装 Nginx
sudo apt install nginx

# 创建配置文件
sudo nano /etc/nginx/sites-available/ai-planner
```

**Nginx 配置**:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 后端 API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**启用配置**:

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/ai-planner /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

**配置 HTTPS (Let's Encrypt)**:

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 🖥️ 方案三: 传统服务器部署

### 步骤详解

#### 第一步: 安装 Node.js

```bash
# 安装 Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

#### 第二步: 克隆并构建

```bash
# 克隆代码
git clone https://github.com/你的用户名/AIWebPlanner.git
cd AIWebPlanner

# 安装依赖
npm install
cd frontend && npm install && cd ..

# 构建前端
cd frontend
npm run build
cd ..
```

#### 第三步: 配置 PM2 (进程管理)

```bash
# 安装 PM2
sudo npm install -g pm2

# 启动后端代理
pm2 start proxy-server.js --name ai-planner-backend

# 使用 PM2 serve 静态文件
pm2 serve frontend/dist 3000 --name ai-planner-frontend --spa

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
```

#### 第四步: 配置 Nginx (同 Docker 方案)

参考上面 Docker 部署中的 Nginx 配置部分。

---

## 🔑 API 密钥配置

### 方式一: 环境变量 (推荐用于生产环境)

在部署平台配置环境变量，应用会自动读取。

### 方式二: 应用内配置 (推荐用于个人使用)

1. 访问应用
2. 点击右上角 **设置** 图标
3. 在 **API 配置** 页面填写各项密钥
4. 点击 **保存配置**

**优势**:
- ✅ 无需重新部署
- ✅ 密钥存储在浏览器本地
- ✅ 更灵活

---

## ❓ 常见问题

### 1. Vercel 部署失败

**问题**: Build failed

**解决方案**:
```bash
# 检查 vercel.json 配置
# 确保 buildCommand 正确
# 检查 package.json 中的 scripts
```

### 2. 数据库连接失败

**问题**: Supabase connection error

**解决方案**:
- 检查 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 是否正确
- 确认 Supabase 项目状态正常
- 检查数据表是否已创建

### 3. AI 服务调用失败

**问题**: LLM API error

**解决方案**:
- 检查 API Key 是否正确
- 确认 API 额度是否充足
- 检查网络连接

### 4. 地图无法显示

**问题**: Map not loading

**解决方案**:
- 检查高德地图 Key 是否正确
- 确认 Key 的服务平台设置为 "Web端(JS API)"
- 检查浏览器控制台错误信息

---

## ⚡ 性能优化

### 1. 启用 CDN

Vercel 自动提供全球 CDN，无需额外配置。

### 2. 图片优化

```bash
# 使用 WebP 格式
# 压缩图片资源
# 使用懒加载
```

### 3. 代码分割

项目已配置 Vite 自动代码分割，无需额外配置。

### 4. 缓存策略

Nginx 配置示例:

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 📞 获取帮助

- **GitHub Issues**: https://github.com/你的用户名/AIWebPlanner/issues
- **文档**: 查看 `docs/` 目录下的其他文档
- **常见问题**: 参考 `docs/TROUBLESHOOTING.md`

---

**祝你部署顺利！** 🎉

