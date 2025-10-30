# 🚀 Linux虚拟机快速部署指南

## 📋 部署流程概览

```
Windows电脑 → 打包项目 → 上传到Linux → 运行部署脚本 → 完成！
```

**总耗时**: 约10-15分钟

---

## 🎯 第一步: 在Windows上打包项目

### 运行打包脚本

在项目根目录，双击运行:

```
package-for-linux.bat
```

或在命令行运行:

```bash
package-for-linux.bat
```

脚本会自动:
- ✅ 复制必要文件
- ✅ 清理node_modules和dist
- ✅ 创建压缩包 `AI-Web-Planner-Deploy.tar.gz`

---

## 🎯 第二步: 上传到Linux虚拟机

### 方法1: 使用SCP（推荐）

**在Windows PowerShell中运行:**

```powershell
# 替换为你的Linux虚拟机IP和用户名
scp AI-Web-Planner-Deploy.tar.gz user@192.168.1.100:/home/user/
```

### 方法2: 使用WinSCP（图形界面）

1. 下载WinSCP: https://winscp.net/
2. 连接到Linux虚拟机
3. 拖拽 `AI-Web-Planner-Deploy.tar.gz` 到Linux

### 方法3: 使用共享文件夹

**VMware:**
1. 虚拟机设置 → 选项 → 共享文件夹
2. 添加Windows文件夹
3. 在Linux中访问 `/mnt/hgfs/共享文件夹名/`

**VirtualBox:**
1. 设备 → 共享文件夹 → 添加共享文件夹
2. 在Linux中挂载:
   ```bash
   sudo mount -t vboxsf 共享文件夹名 /mnt/shared
   ```

---

## 🎯 第三步: 在Linux上解压

SSH连接到Linux虚拟机:

```bash
# 从Windows连接到Linux
ssh user@192.168.1.100
```

解压项目:

```bash
# 解压
tar -xzf AI-Web-Planner-Deploy.tar.gz

# 进入目录
cd AI-Web-Planner

# 查看文件
ls -la
```

---

## 🎯 第四步: 运行部署脚本

### 一键部署（推荐）

```bash
# 给脚本执行权限
chmod +x deploy-linux.sh

# 运行部署脚本
./deploy-linux.sh
```

脚本会自动:
1. ✅ 检测操作系统
2. ✅ 安装Docker（如果未安装）
3. ✅ 启动Docker服务
4. ✅ 构建镜像
5. ✅ 启动服务
6. ✅ 测试健康检查
7. ✅ 显示访问地址

### 手动部署

如果自动脚本失败，可以手动执行:

```bash
# 1. 安装Docker（Ubuntu/Debian）
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 2. 启动Docker
sudo systemctl start docker
sudo systemctl enable docker

# 3. 添加当前用户到docker组
sudo usermod -aG docker $USER
newgrp docker

# 4. 构建并启动
docker compose up -d --build

# 5. 查看日志
docker compose logs -f
```

---

## 🎯 第五步: 访问应用

### 获取虚拟机IP

```bash
# 方法1
ip addr show

# 方法2
hostname -I

# 方法3
ifconfig
```

### 在浏览器访问

```
http://虚拟机IP:3000
```

例如: `http://192.168.1.100:3000`

### 测试后端API

```bash
# 在Linux上测试
curl http://localhost:3001/health

# 在Windows上测试
curl http://192.168.1.100:3001/health
```

---

## 🎯 第六步: 配置应用

1. 打开浏览器访问应用
2. 进入 **设置页面**
3. 配置API Key:
   - Supabase URL 和 Key
   - 阿里云百炼 API Key
   - 高德地图 API Key
4. 点击 **保存配置**
5. 测试各个服务
6. 开始使用！

---

## 📊 验证部署

### 检查容器状态

```bash
docker compose ps
```

应该看到:
```
NAME                        STATUS
ai-web-planner-backend      Up (healthy)
ai-web-planner-frontend     Up (healthy)
```

### 检查日志

```bash
# 查看所有日志
docker compose logs

# 实时查看
docker compose logs -f

# 查看后端日志
docker compose logs backend

# 查看前端日志
docker compose logs frontend
```

### 测试健康检查

```bash
# 后端健康检查
curl http://localhost:3001/health

# 应该返回
{"status":"ok","message":"代理服务器运行正常","timestamp":"..."}

# 前端访问
curl -I http://localhost:3000

# 应该返回 200 OK
```

---

## 🔧 配置防火墙（重要）

### Ubuntu/Debian

```bash
# 允许3000和3001端口
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

### CentOS/RHEL

```bash
# 允许端口
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=3001/tcp

# 重载
sudo firewall-cmd --reload

# 查看
sudo firewall-cmd --list-ports
```

---

## 📋 常用管理命令

### 启动和停止

```bash
# 启动
docker compose up -d

# 停止
docker compose down

# 重启
docker compose restart
```

### 查看状态

```bash
# 容器状态
docker compose ps

# 资源使用
docker stats

# 磁盘使用
docker system df
```

### 更新应用

```bash
# 如果使用Git
git pull
docker compose up -d --build

# 如果手动上传
# 1. 重新打包并上传
# 2. 解压覆盖
# 3. 重新构建
docker compose down
docker compose build
docker compose up -d
```

---

## ❓ 常见问题

### Q1: 无法访问应用

**检查:**
1. 容器是否运行: `docker compose ps`
2. 防火墙是否开放端口
3. 虚拟机网络设置（NAT/桥接）

**解决:**
```bash
# 检查端口监听
sudo netstat -tulpn | grep 3000
sudo netstat -tulpn | grep 3001

# 检查防火墙
sudo ufw status
```

### Q2: Docker命令需要sudo

**解决:**
```bash
# 添加用户到docker组
sudo usermod -aG docker $USER

# 重新登录或运行
newgrp docker

# 现在可以不用sudo
docker ps
```

### Q3: 构建失败

**检查:**
```bash
# 查看详细日志
docker compose build --no-cache

# 检查磁盘空间
df -h

# 清理Docker缓存
docker system prune -a
```

### Q4: 端口被占用

**解决:**
```bash
# 查找占用进程
sudo lsof -i :3000
sudo lsof -i :3001

# 杀死进程
sudo kill -9 <PID>

# 或修改端口
# 编辑 docker-compose.yml
ports:
  - "8080:80"  # 改用8080
```

---

## 🎉 完成检查清单

部署完成后，确认以下项目:

- [ ] Docker已安装并运行
- [ ] 容器状态为 "Up (healthy)"
- [ ] 可以访问 http://虚拟机IP:3000
- [ ] 后端健康检查返回正常
- [ ] 防火墙已配置
- [ ] 可以登录/注册
- [ ] 可以配置API服务
- [ ] 可以创建旅行计划

---

## 📚 相关文档

- [详细Linux部署指南](LINUX_DEPLOYMENT.md)
- [Docker部署指南](DOCKER_DEPLOYMENT.md)
- [故障排查指南](TROUBLESHOOTING.md)

---

## 🎯 总结

### 完整流程回顾

1. **Windows**: 运行 `package-for-linux.bat`
2. **上传**: 使用SCP/WinSCP上传到Linux
3. **Linux**: 解压 `tar -xzf AI-Web-Planner-Deploy.tar.gz`
4. **部署**: 运行 `./deploy-linux.sh`
5. **访问**: 浏览器打开 `http://虚拟机IP:3000`
6. **配置**: 在设置页面配置API Key
7. **使用**: 开始创建旅行计划！

**总耗时**: 10-15分钟

---

**祝部署顺利！** 🚀

如有问题，请查看详细文档或提供错误日志。

