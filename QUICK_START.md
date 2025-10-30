# 🚀 AI Web Planner - 快速启动指南

## 📋 目录
- [Windows 用户](#windows-用户)
- [Linux/Mac 用户](#linuxmac-用户)
- [常见问题](#常见问题)
- [下一步](#下一步)

---

## Windows 用户

### 方式一: PowerShell 部署 (推荐)

#### 1. 打开 PowerShell
- 按 `Win + X`
- 选择 "Windows PowerShell" 或 "终端"

#### 2. 进入项目目录
```powershell
cd "E:\code\augment\AI Web Planner"
```

#### 3. 运行部署脚本
```powershell
.\docker-deploy.ps1
```

#### 4. 按照提示操作
- 等待 Docker Desktop 启动
- 选择是否配置环境变量 (可以稍后在应用中配置)
- 等待镜像构建和容器启动

#### 5. 访问应用
打开浏览器访问: http://localhost:3000

---

### 方式二: CMD 部署

#### 1. 打开命令提示符
- 按 `Win + R`
- 输入 `cmd` 并回车

#### 2. 进入项目目录
```cmd
cd /d "E:\code\augment\AI Web Planner"
```

#### 3. 运行部署脚本
```cmd
docker-deploy.bat
```

> **注意**: 如果出现乱码,请使用 PowerShell 方式

---

### 方式三: 本地开发模式

#### 1. 安装依赖
```powershell
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend
npm install
cd ..

# 安装后端依赖
cd backend
npm install
cd ..
```

#### 2. 启动服务
```powershell
# 方式1: 同时启动前后端 (推荐)
npm run dev

# 方式2: 分别启动
# 终端1 - 启动后端
npm run proxy

# 终端2 - 启动前端
npm run frontend
```

#### 3. 访问应用
- 前端: http://localhost:5173
- 后端: http://localhost:3001

---

## Linux/Mac 用户

### 方式一: Docker 部署 (推荐)

#### 1. 打开终端

#### 2. 进入项目目录
```bash
cd ~/AI-Web-Planner
```

#### 3. 运行部署脚本
```bash
bash docker-deploy.sh
```

#### 4. 访问应用
打开浏览器访问: http://localhost:3000

---

### 方式二: 本地开发模式

#### 1. 安装依赖
```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend && npm install && cd ..

# 安装后端依赖
cd backend && npm install && cd ..
```

#### 2. 启动服务
```bash
# 同时启动前后端
npm run dev
```

#### 3. 访问应用
- 前端: http://localhost:5173
- 后端: http://localhost:3001

---

## 🔧 配置 API Keys

### 第一步: 访问设置页面
1. 打开应用: http://localhost:3000
2. 点击右上角的 ⚙️ 设置图标

### 第二步: 配置必需的 API Keys

#### 1. Supabase (必需)
- **Supabase URL**: 你的 Supabase 项目 URL
- **Supabase Anon Key**: 你的 Supabase 匿名密钥

> 获取方式: [Supabase 配置指南](docs/ALIYUN_BAILIAN_SETUP.md#supabase-配置)

#### 2. 阿里云百炼 (必需)
- **API Key**: 你的阿里云百炼 API Key
- **API Endpoint**: `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`

> 获取方式: [阿里云百炼配置指南](docs/ALIYUN_BAILIAN_SETUP.md)

#### 3. 高德地图 (可选)
- **高德地图 Key**: 你的高德地图 Web 服务 Key

> 获取方式: [高德地图开放平台](https://lbs.amap.com/)

#### 4. 科大讯飞语音 (可选)
- **App ID**: 你的科大讯飞应用 ID
- **API Key**: 你的科大讯飞 API Key
- **API Secret**: 你的科大讯飞 API Secret

> 获取方式: [科大讯飞开放平台](https://www.xfyun.cn/)

### 第三步: 测试配置
1. 切换到 "🧪 服务测试" 标签页
2. 点击 "🚀 一键测试所有服务" 按钮
3. 查看测试结果:
   - ✅ 绿色对勾 = 配置正确
   - ❌ 红色叉号 = 配置错误

---

## 📝 使用流程

### 1. 注册/登录
- 首次使用需要注册账号
- 使用邮箱和密码注册
- 注册后自动登录

### 2. 创建旅行计划
- 点击 "创建新计划" 按钮
- 输入旅行需求,例如:
  ```
  我想去日本旅游,5天,预算1万元,喜欢美食和动漫
  ```
- 点击发送或按回车
- 等待 AI 生成行程

### 3. 查看行程详情
- 在 "我的行程" 页面查看所有计划
- 点击计划卡片查看详细信息
- 可以查看:
  - 📅 详细行程
  - 🗺️ 地图视图
  - 💰 费用记录
  - 📋 行程时间轴

### 4. 管理预算
- 进入 "预算管理" 页面
- 选择要管理的计划
- 添加费用记录
- 查看预算分析

---

## ❓ 常见问题

### Q1: Docker Desktop 启动失败?
**A:** 
1. 确认已安装 Docker Desktop
2. 以管理员身份运行
3. 检查系统虚拟化是否启用
4. 重启电脑后再试

### Q2: 端口被占用?
**A:**
```powershell
# 查看占用端口的进程
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# 结束进程 (替换 PID)
taskkill /PID <进程ID> /F
```

### Q3: 构建失败?
**A:**
1. 检查网络连接
2. 清理 Docker 缓存: `docker system prune -a`
3. 重新运行部署脚本

### Q4: API 调用失败?
**A:**
1. 检查 API Key 是否正确
2. 检查网络连接
3. 查看后端日志: `docker-compose logs backend`
4. 使用测试功能验证配置

### Q5: 页面空白?
**A:**
1. 按 F12 打开开发者工具
2. 查看 Console 标签的错误信息
3. 检查 Supabase 配置是否正确
4. 清除浏览器缓存并刷新

### Q6: PowerShell 脚本无法运行?
**A:**
```powershell
# 设置执行策略 (以管理员身份运行)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 然后重新运行脚本
.\docker-deploy.ps1
```

---

## 🎯 下一步

### 学习更多
- 📖 [完整文档](README.md)
- 🐳 [Docker 部署指南](docs/DOCKER_DEPLOYMENT.md)
- 🐧 [Linux 部署指南](docs/QUICK_DEPLOY_LINUX.md)
- 🔧 [故障排除](docs/TROUBLESHOOTING.md)
- 📚 [用户手册](docs/USER_MANUAL.md)

### 获取帮助
- 查看 [常见问题](docs/TROUBLESHOOTING.md)
- 查看 [API 配置指南](API配置指南.md)
- 查看项目 Issues

### 贡献代码
- Fork 项目
- 创建功能分支
- 提交 Pull Request

---

## 📞 联系方式

- 项目地址: [GitHub Repository]
- 问题反馈: [Issues]
- 文档: [docs/](docs/)

---

**祝你使用愉快！** 🎉

