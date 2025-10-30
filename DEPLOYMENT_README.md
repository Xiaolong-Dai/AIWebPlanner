# 🚀 AI Web Planner - 部署说明

## 📋 部署方案总览

本项目支持多种部署方式，推荐使用 **Docker部署**。

---

## 🐧 推荐方案: Linux虚拟机 + Docker

### 为什么选择这个方案？

- ✅ **简单快速** - 一键部署，10分钟完成
- ✅ **环境一致** - Docker容器化，消除环境差异
- ✅ **易于管理** - 统一的容器管理命令
- ✅ **生产就绪** - 可直接用于生产环境
- ✅ **符合规范** - 项目要求使用Docker部署

### 快速开始（10分钟）

#### 第一步: 打包项目（Windows）

```bash
# 运行打包脚本
package-for-linux.bat
```

生成文件: `AI-Web-Planner-Deploy.tar.gz`

#### 第二步: 上传到Linux

```bash
# 使用SCP上传
scp AI-Web-Planner-Deploy.tar.gz user@linux-ip:/home/user/
```

#### 第三步: 在Linux上部署

```bash
# SSH连接到Linux
ssh user@linux-ip

# 解压
tar -xzf AI-Web-Planner-Deploy.tar.gz
cd AI-Web-Planner

# 一键部署
chmod +x deploy-linux.sh
./deploy-linux.sh
```

#### 第四步: 访问应用

```
http://虚拟机IP:3000
```

**详细文档**: [Linux快速部署指南](docs/QUICK_DEPLOY_LINUX.md)

---

## 🐳 其他Docker部署方式

### Windows本地Docker部署

```bash
# 启动Docker Desktop
# 然后运行
docker-deploy.bat
```

**访问**: http://localhost:3000

**详细文档**: [Docker部署指南](docs/DOCKER_DEPLOYMENT.md)

---

## 💻 本地开发部署

### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 步骤

```bash
# 1. 安装后端依赖
cd backend
npm install

# 2. 启动后端代理
npm start

# 3. 新开终端，安装前端依赖
cd frontend
npm install

# 4. 启动前端
npm run dev
```

**访问**: http://localhost:5173

**详细文档**: [本地开发指南](docs/SETUP.md)

---

## ☁️ 云平台部署（可选）

### Vercel部署

适合在线演示和测试。

**详细文档**: [Vercel部署指南](docs/DEPLOYMENT_GUIDE.md)

---

## 📦 部署文件清单

### 核心文件

```
AI Web Planner/
├── docker-compose.yml          # Docker编排配置
├── deploy-linux.sh             # Linux自动部署脚本
├── package-for-linux.bat       # Windows打包脚本
│
├── frontend/
│   ├── Dockerfile              # 前端镜像
│   └── nginx.conf              # Nginx配置
│
└── backend/
    ├── Dockerfile              # 后端镜像
    ├── server.js               # 代理服务
    └── package.json            # 依赖配置
```

### 文档文件

```
docs/
├── QUICK_DEPLOY_LINUX.md       # ⭐ Linux快速部署（推荐）
├── LINUX_DEPLOYMENT.md         # Linux详细部署指南
├── DOCKER_DEPLOYMENT.md        # Docker部署指南
├── DEPLOYMENT_SUMMARY.md       # 部署方案总结
├── ALIYUN_BAILIAN_SETUP.md     # 阿里云百炼配置
└── database_setup.sql          # 数据库初始化脚本
```

---

## 🎯 部署流程对比

| 步骤 | Linux虚拟机 | Windows Docker | 本地开发 |
|------|------------|---------------|---------|
| **1. 环境准备** | 安装Linux虚拟机 | 安装Docker Desktop | 安装Node.js |
| **2. 项目准备** | 打包上传 | 克隆代码 | 克隆代码 |
| **3. 部署** | 运行脚本 | 运行脚本 | 手动启动 |
| **4. 访问** | http://IP:3000 | http://localhost:3000 | http://localhost:5173 |
| **耗时** | 10-15分钟 | 5-10分钟 | 5分钟 |
| **难度** | ⭐⭐ 简单 | ⭐ 非常简单 | ⭐⭐⭐ 中等 |
| **推荐场景** | 生产部署 | 本地测试 | 开发调试 |

---

## ✅ 部署后配置

无论使用哪种部署方式，都需要在应用中配置API服务：

### 1. 访问应用

打开浏览器访问应用地址

### 2. 进入设置页面

点击右上角 **"设置"** 按钮

### 3. 配置API服务

**Supabase配置:**
```
URL: 你的Supabase URL
Key: 你的Supabase Anon Key
```

**阿里云百炼配置:**
```
API Key: 你的阿里云API Key
Endpoint: https://bailian.aliyun.com/v1/api/completions
```

**高德地图配置:**
```
API Key: 你的高德地图Key
```

### 4. 测试服务

点击各个 **"测试"** 按钮，确保服务正常

### 5. 初始化数据库

在Supabase Dashboard执行 `docs/database_setup.sql`

**详细步骤**: [快速修复指南](docs/QUICK_START_FIX.md)

---

## 📊 部署架构

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
    用户访问应用
           │
           ▼
    ┌──────┴──────┐
    │             │
    ▼             ▼
 Supabase    阿里云百炼
(数据库)      (AI服务)
```

---

## 🔧 常用管理命令

### Docker部署

```bash
# 启动服务
docker compose up -d

# 停止服务
docker compose down

# 查看日志
docker compose logs -f

# 查看状态
docker compose ps

# 重启服务
docker compose restart
```

### 本地开发

```bash
# 启动后端
cd backend && npm start

# 启动前端
cd frontend && npm run dev

# 构建前端
cd frontend && npm run build
```

---

## ❓ 常见问题

### Q1: 选择哪种部署方式？

**推荐**: Linux虚拟机 + Docker
- 适合生产环境
- 符合项目要求
- 易于管理和维护

### Q2: 如何获取虚拟机IP？

```bash
# 在Linux上运行
ip addr show
# 或
hostname -I
```

### Q3: 无法访问应用？

**检查**:
1. 容器是否运行: `docker compose ps`
2. 防火墙是否开放端口
3. 虚拟机网络设置

### Q4: 数据库连接失败？

**解决**:
1. 确认已执行 `database_setup.sql`
2. 检查Supabase配置是否正确
3. 测试Supabase连接

---

## 📚 详细文档索引

### 部署相关
- ⭐ [Linux快速部署](docs/QUICK_DEPLOY_LINUX.md) - **推荐阅读**
- [Linux详细部署](docs/LINUX_DEPLOYMENT.md)
- [Docker部署指南](docs/DOCKER_DEPLOYMENT.md)
- [部署方案总结](docs/DEPLOYMENT_SUMMARY.md)

### 配置相关
- [快速修复指南](docs/QUICK_START_FIX.md)
- [阿里云百炼配置](docs/ALIYUN_BAILIAN_SETUP.md)
- [数据库初始化](docs/database_setup.sql)

### 开发相关
- [本地开发指南](docs/SETUP.md)
- [故障排查](docs/TROUBLESHOOTING.md)
- [用户手册](docs/USER_MANUAL.md)

---

## 🎉 快速开始

### 最快的部署方式（推荐）

1. **打包**: 运行 `package-for-linux.bat`
2. **上传**: SCP到Linux虚拟机
3. **部署**: 运行 `./deploy-linux.sh`
4. **访问**: 浏览器打开 `http://虚拟机IP:3000`
5. **配置**: 在设置页面配置API Key
6. **使用**: 开始创建旅行计划！

**总耗时**: 10-15分钟

---

## 📞 需要帮助？

如果遇到问题:

1. 查看对应的详细文档
2. 检查日志: `docker compose logs -f`
3. 查看故障排查文档
4. 提供错误信息和日志

---

**祝部署顺利！** 🚀

---

**项目地址**: https://github.com/你的用户名/AI-Web-Planner  
**文档更新**: 2024年12月  
**版本**: v1.0

