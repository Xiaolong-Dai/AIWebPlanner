# 🐳 启动Docker Desktop

## ⚠️ 重要提示

部署前需要先启动Docker Desktop！

---

## 📋 启动步骤

### Windows系统

#### 方法1: 通过开始菜单

1. 点击 **开始菜单**
2. 搜索 **Docker Desktop**
3. 点击启动
4. 等待Docker图标变为绿色（右下角系统托盘）

#### 方法2: 通过命令行

```powershell
# 启动Docker Desktop
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

---

## ✅ 验证Docker已启动

打开PowerShell或命令提示符，运行:

```bash
docker info
```

如果看到Docker的详细信息（而不是错误），说明Docker已成功启动。

---

## ⏱️ 等待时间

Docker Desktop启动通常需要 **30-60秒**，请耐心等待。

你会看到:
1. Docker Desktop窗口打开
2. 系统托盘的Docker图标从灰色变为绿色
3. 显示 "Docker Desktop is running"

---

## 🚀 启动后继续部署

Docker启动成功后，运行部署脚本:

```bash
docker-deploy.bat
```

或手动执行:

```bash
docker-compose up -d
```

---

## ❓ 如果Docker Desktop未安装

### 下载安装

1. 访问: https://www.docker.com/products/docker-desktop
2. 下载Windows版本
3. 运行安装程序
4. 重启电脑
5. 启动Docker Desktop

---

## 🔧 常见问题

### Q1: Docker Desktop启动失败

**可能原因:**
- WSL2未安装或未启用
- Hyper-V未启用
- 系统资源不足

**解决方案:**

1. **启用WSL2** (推荐)
   ```powershell
   # 以管理员身份运行PowerShell
   wsl --install
   ```

2. **启用Hyper-V**
   - 控制面板 → 程序 → 启用或关闭Windows功能
   - 勾选 "Hyper-V"
   - 重启电脑

### Q2: Docker图标一直是灰色

**解决方案:**
- 等待1-2分钟
- 检查任务管理器中Docker进程是否运行
- 重启Docker Desktop
- 重启电脑

### Q3: 提示"Docker daemon未运行"

**解决方案:**
```bash
# 重启Docker Desktop
# 或在Docker Desktop设置中点击 "Restart"
```

---

## 📞 需要帮助？

如果Docker Desktop无法启动，请提供:
1. Windows版本
2. 错误信息截图
3. Docker Desktop日志

---

**准备好后，运行 `docker-deploy.bat` 开始部署！** 🚀

