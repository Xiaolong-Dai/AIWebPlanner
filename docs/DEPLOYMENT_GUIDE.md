# 🚀 部署指南 - Vercel部署

## 方案选择

### 方案A: 通过GitHub自动部署（推荐 - 最简单）
- ✅ 自动构建和部署
- ✅ 每次push自动更新
- ✅ 完全免费
- ✅ 配置简单

### 方案B: 通过Vercel CLI部署
- ✅ 命令行部署
- ✅ 适合快速测试
- ⚠️ 需要手动部署

---

## 🌟 方案A: GitHub自动部署（推荐）

### 第一步: 推送代码到GitHub

#### 1. 创建GitHub仓库

1. 访问: https://github.com/new
2. 仓库名称: `AI-Web-Planner`
3. 设置为 **Public** 或 **Private**
4. **不要**勾选 "Initialize this repository with a README"
5. 点击 **Create repository**

#### 2. 推送本地代码

在项目根目录打开终端，运行:

```bash
# 初始化Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: AI Web Planner"

# 添加远程仓库（替换为你的GitHub用户名）
git remote add origin https://github.com/你的用户名/AI-Web-Planner.git

# 推送到GitHub
git push -u origin main
```

如果提示分支名称错误，运行:
```bash
git branch -M main
git push -u origin main
```

---

### 第二步: 连接Vercel

#### 1. 注册/登录Vercel

1. 访问: https://vercel.com
2. 点击 **Sign Up** 或 **Log In**
3. 选择 **Continue with GitHub**
4. 授权Vercel访问你的GitHub

#### 2. 导入项目

1. 在Vercel Dashboard，点击 **Add New** → **Project**
2. 找到你的 `AI-Web-Planner` 仓库
3. 点击 **Import**

#### 3. 配置项目

**Framework Preset:** Vite

**Root Directory:** `./` (保持默认)

**Build Command:** 
```
cd frontend && npm install && npm run build
```

**Output Directory:**
```
frontend/dist
```

**Install Command:**
```
npm install
```

#### 4. 环境变量（可选）

如果你想在Vercel中存储API Key，点击 **Environment Variables**:

```
VITE_SUPABASE_URL = 你的Supabase URL
VITE_SUPABASE_KEY = 你的Supabase Key
```

**注意:** 由于前端使用localStorage存储配置，这一步是可选的。

#### 5. 部署

点击 **Deploy** 按钮

等待3-5分钟，部署完成后你会得到一个URL:
```
https://ai-web-planner-xxx.vercel.app
```

---

### 第三步: 配置应用

1. 访问你的Vercel URL
2. 进入 **设置页面**
3. 配置API Key:
   - Supabase URL 和 Key
   - 阿里云百炼 API Key
   - 高德地图 API Key
4. 点击 **保存配置**
5. 测试各个服务

---

### 第四步: 自动部署

现在，每次你推送代码到GitHub:

```bash
git add .
git commit -m "更新功能"
git push
```

Vercel会自动检测并重新部署！

---

## 🌟 方案B: Vercel CLI部署

### 第一步: 安装Vercel CLI

```bash
npm install -g vercel
```

### 第二步: 登录

```bash
vercel login
```

选择登录方式（GitHub/Email等）

### 第三步: 部署

在项目根目录运行:

```bash
vercel
```

按照提示操作:
- **Set up and deploy?** → Y
- **Which scope?** → 选择你的账号
- **Link to existing project?** → N
- **Project name?** → ai-web-planner
- **In which directory is your code located?** → ./
- **Want to override the settings?** → Y
  - **Build Command:** `cd frontend && npm install && npm run build`
  - **Output Directory:** `frontend/dist`
  - **Development Command:** `cd frontend && npm run dev`

### 第四步: 生产部署

```bash
vercel --prod
```

部署完成后会显示URL。

---

## 📋 部署检查清单

### 部署前检查

- [ ] 代码已推送到GitHub
- [ ] `.gitignore` 包含敏感文件
- [ ] `vercel.json` 配置正确
- [ ] `package.json` 包含构建脚本
- [ ] 前端代码可以成功构建（`npm run build`）

### 部署后检查

- [ ] 网站可以访问
- [ ] 登录/注册功能正常
- [ ] Supabase连接正常
- [ ] AI服务代理正常
- [ ] 地图服务正常
- [ ] 所有页面可以访问

---

## 🔧 常见问题

### Q1: 构建失败 - "Command failed"

**检查:**
1. 本地是否能成功构建: `cd frontend && npm run build`
2. `package.json` 中的构建命令是否正确
3. Vercel日志中的具体错误

**解决方案:**
```bash
# 本地测试构建
cd frontend
npm install
npm run build

# 如果成功，重新部署
vercel --prod
```

### Q2: 部署成功但页面空白

**检查:**
1. 浏览器控制台是否有错误
2. Output Directory 是否设置为 `frontend/dist`
3. 路由配置是否正确

**解决方案:**
检查 `vercel.json` 中的 rewrites 配置。

### Q3: API代理不工作

**检查:**
1. `api/llm-proxy.ts` 文件是否存在
2. Vercel Functions 是否启用
3. 浏览器控制台的网络请求

**解决方案:**
确保 `api` 目录在项目根目录，且包含 `llm-proxy.ts`

### Q4: 环境变量不生效

**检查:**
1. Vercel Dashboard → Settings → Environment Variables
2. 变量名是否以 `VITE_` 开头（前端变量）
3. 是否重新部署

**解决方案:**
添加环境变量后需要重新部署:
```bash
vercel --prod
```

---

## 🎯 部署后配置

### 1. 自定义域名（可选）

1. Vercel Dashboard → Settings → Domains
2. 添加你的域名
3. 配置DNS记录
4. 等待SSL证书生成

### 2. 性能优化

1. 启用 **Edge Network**（默认启用）
2. 启用 **Image Optimization**
3. 配置 **Caching Headers**

### 3. 监控和日志

1. Vercel Dashboard → Analytics
2. 查看访问量和性能
3. 查看部署日志和错误

---

## 📊 部署架构

```
GitHub Repository
    ↓ (自动触发)
Vercel Build System
    ↓ (构建前端)
Static Files (frontend/dist)
    ↓ (部署到)
Vercel Edge Network
    ↓
用户访问
```

```
用户请求 AI 服务
    ↓
Vercel Serverless Function (/api/llm-proxy)
    ↓
阿里云百炼 API
    ↓
返回结果
```

---

## 🎉 完成！

部署完成后，你的应用将:

- ✅ 全球CDN加速
- ✅ 自动HTTPS
- ✅ 自动部署
- ✅ 无限带宽（免费版有限制）
- ✅ Serverless Functions支持

---

## 📞 需要帮助？

如果部署过程中遇到问题:

1. 查看Vercel部署日志
2. 检查浏览器控制台错误
3. 查看本文档的常见问题
4. 提供错误信息给我

祝部署顺利！🚀

