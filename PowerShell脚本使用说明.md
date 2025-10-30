# PowerShell 部署脚本使用说明

## ✅ 问题已修复!

之前的 `docker-deploy.ps1` 脚本因为编码问题导致无法运行,现在已经完全重写,使用纯英文避免编码问题。

---

## 🚀 使用方法

### 方法一: 直接运行 (推荐)

```powershell
.\docker-deploy.ps1
```

### 方法二: 如果提示权限问题

```powershell
powershell -ExecutionPolicy Bypass -File .\docker-deploy.ps1
```

### 方法三: 永久设置执行策略

```powershell
# 以管理员身份运行 PowerShell,然后执行:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 然后就可以直接运行:
.\docker-deploy.ps1
```

---

## 📋 脚本功能

新的脚本非常简洁,只做核心功能:

1. ✅ **检查 Docker 安装**
   - 检测 Docker 是否已安装
   - 如果未安装,提示安装链接

2. ✅ **检查 Docker 运行状态**
   - 检测 Docker Desktop 是否正在运行
   - 如果未运行,提示先启动 Docker Desktop

3. ✅ **停止旧容器**
   - 自动停止并删除旧的容器

4. ✅ **构建并启动**
   - 构建 Docker 镜像
   - 启动所有容器
   - 显示访问地址

---

## 🔧 使用步骤

### 第一步: 启动 Docker Desktop

在运行脚本之前,请确保 Docker Desktop 已经启动:

1. 打开 Docker Desktop 应用
2. 等待 Docker 图标变为绿色
3. 确认 Docker 正在运行

### 第二步: 运行脚本

```powershell
# 1. 打开 PowerShell
# 2. 进入项目目录
cd "E:\code\augment\AI Web Planner"

# 3. 运行脚本
.\docker-deploy.ps1
```

### 第三步: 等待部署完成

脚本会自动:
- 停止旧容器
- 构建新镜像 (首次运行需要几分钟)
- 启动容器

### 第四步: 访问应用

部署成功后,访问:
- **前端**: http://localhost:3000
- **后端**: http://localhost:3001

---

## ❓ 常见问题

### Q1: 提示 "无法加载文件,因为在此系统上禁止运行脚本"

**解决方法**:
```powershell
# 方法1: 临时绕过
powershell -ExecutionPolicy Bypass -File .\docker-deploy.ps1

# 方法2: 永久设置 (推荐)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Q2: 提示 "Docker is not running"

**解决方法**:
1. 打开 Docker Desktop
2. 等待 Docker 完全启动 (图标变绿)
3. 重新运行脚本

### Q3: 构建失败

**解决方法**:
```powershell
# 1. 清理 Docker 缓存
docker system prune -a

# 2. 重新运行脚本
.\docker-deploy.ps1
```

### Q4: 端口被占用

**解决方法**:
```powershell
# 查看占用端口的进程
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# 结束进程 (替换 <PID> 为实际进程ID)
taskkill /PID <PID> /F

# 或者停止所有容器
docker-compose down
```

---

## 🆚 与批处理文件的对比

| 特性 | docker-deploy.bat | docker-deploy.ps1 |
|------|-------------------|-------------------|
| 编码问题 | ❌ 有乱码 | ✅ 无问题 |
| PowerShell 兼容 | ❌ 不兼容 | ✅ 完美兼容 |
| 彩色输出 | ⚠️ 部分支持 | ✅ 完全支持 |
| 错误处理 | ⚠️ 基础 | ✅ 完善 |
| 推荐使用 | ❌ 不推荐 | ✅ 推荐 |

---

## 📝 脚本内容

新脚本非常简洁 (只有 59 行),主要流程:

```powershell
# 1. 检查 Docker 安装
Get-Command docker

# 2. 检查 Docker 运行状态
docker info

# 3. 停止旧容器
docker-compose down

# 4. 构建并启动
docker-compose up -d --build
```

---

## 🎯 下一步

部署成功后:

1. ✅ 访问 http://localhost:3000
2. ✅ 配置 API Keys (设置页面)
3. ✅ 测试功能
4. ✅ 开始使用!

---

## 📚 相关文档

- [快速启动指南](QUICK_START.md)
- [修复完成报告](修复完成报告.md)
- [检查报告](检查报告_2025-10-29.md)
- [Docker 部署指南](docs/DOCKER_DEPLOYMENT.md)

---

**更新时间**: 2025-10-29  
**状态**: ✅ 已修复,可正常使用

