# 🐧 Linux虚拟机部署指南

## 📋 支持的系统

- ✅ Ubuntu 20.04 / 22.04 / 24.04
- ✅ Debian 10 / 11 / 12
- ✅ CentOS 7 / 8 / Stream
- ✅ RHEL 7 / 8 / 9
- ✅ Fedora 35+

---

## 🚀 快速部署（一键安装）

### 方法1: 自动部署脚本（推荐）

```bash
# 1. 上传项目到Linux虚拟机
# 2. 进入项目目录
cd AI\ Web\ Planner

# 3. 给脚本执行权限
chmod +x deploy-linux.sh

# 4. 运行部署脚本
./deploy-linux.sh
```

脚本会自动:
- ✅ 检测操作系统
- ✅ 安装Docker（如果未安装）
- ✅ 启动Docker服务
- ✅ 构建镜像
- ✅ 启动服务
- ✅ 测试健康检查

---

## 📦 手动部署步骤

### 第一步: 安装Docker

#### Ubuntu/Debian

```bash
# 更新包索引
sudo apt-get update

# 安装依赖
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 添加Docker官方GPG密钥
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 设置仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 启动Docker
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
sudo docker run hello-world
```

#### CentOS/RHEL

```bash
# 安装yum-utils
sudo yum install -y yum-utils

# 添加Docker仓库
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安装Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 启动Docker
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
sudo docker run hello-world
```

### 第二步: 配置Docker权限（可选）

```bash
# 将当前用户添加到docker组
sudo usermod -aG docker $USER

# 重新登录或运行
newgrp docker

# 现在可以不用sudo运行docker命令
docker ps
```

### 第三步: 上传项目文件

#### 方法1: 使用Git

```bash
# 克隆仓库
git clone https://github.com/你的用户名/AI-Web-Planner.git
cd AI-Web-Planner
```

#### 方法2: 使用SCP

```bash
# 在本地Windows机器上打包
# 然后上传到Linux虚拟机

# 从Windows上传到Linux
scp -r "E:\code\augment\AI Web Planner" user@linux-ip:/home/user/

# 在Linux上解压（如果打包了）
cd /home/user
tar -xzf AI-Web-Planner.tar.gz
cd AI-Web-Planner
```

#### 方法3: 使用共享文件夹

如果使用VMware/VirtualBox，可以设置共享文件夹。

### 第四步: 部署应用

```bash
# 进入项目目录
cd AI-Web-Planner

# 构建并启动
docker compose up -d --build

# 查看日志
docker compose logs -f
```

---

## 🔧 配置防火墙

### Ubuntu/Debian (UFW)

```bash
# 允许3000和3001端口
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

### CentOS/RHEL (firewalld)

```bash
# 允许3000和3001端口
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=3001/tcp

# 重载防火墙
sudo firewall-cmd --reload

# 查看状态
sudo firewall-cmd --list-ports
```

---

## 🌐 访问应用

### 本地访问

```bash
# 前端
http://localhost:3000

# 后端
http://localhost:3001

# 健康检查
curl http://localhost:3001/health
```

### 远程访问

```bash
# 获取虚拟机IP
ip addr show

# 或
hostname -I

# 然后在浏览器访问
http://虚拟机IP:3000
```

---

## 📊 管理命令

### 查看服务状态

```bash
# 查看容器状态
docker compose ps

# 查看详细信息
docker ps -a

# 查看资源使用
docker stats
```

### 查看日志

```bash
# 查看所有日志
docker compose logs

# 实时查看日志
docker compose logs -f

# 查看特定服务
docker compose logs frontend
docker compose logs backend

# 查看最近100行
docker compose logs --tail=100
```

### 重启服务

```bash
# 重启所有服务
docker compose restart

# 重启单个服务
docker compose restart frontend
docker compose restart backend
```

### 停止服务

```bash
# 停止服务
docker compose stop

# 停止并删除容器
docker compose down

# 停止并删除容器、网络、卷
docker compose down -v
```

### 更新应用

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker compose up -d --build

# 或分步执行
docker compose down
docker compose build
docker compose up -d
```

---

## 🔍 故障排查

### 检查Docker服务

```bash
# 查看Docker状态
sudo systemctl status docker

# 启动Docker
sudo systemctl start docker

# 查看Docker日志
sudo journalctl -u docker -f
```

### 检查容器日志

```bash
# 查看容器日志
docker compose logs backend
docker compose logs frontend

# 查看容器详细信息
docker inspect ai-web-planner-backend
docker inspect ai-web-planner-frontend
```

### 检查网络

```bash
# 查看网络
docker network ls

# 查看网络详情
docker network inspect aiwebplanner_ai-planner-network

# 测试容器间连接
docker compose exec frontend ping backend
```

### 检查端口

```bash
# 查看端口占用
sudo netstat -tulpn | grep 3000
sudo netstat -tulpn | grep 3001

# 或使用ss
sudo ss -tulpn | grep 3000
```

### 常见问题

#### Q1: 端口被占用

```bash
# 查找占用端口的进程
sudo lsof -i :3000
sudo lsof -i :3001

# 杀死进程
sudo kill -9 <PID>

# 或修改docker-compose.yml中的端口
```

#### Q2: 权限错误

```bash
# 确保当前用户在docker组
groups

# 如果没有，添加并重新登录
sudo usermod -aG docker $USER
newgrp docker
```

#### Q3: 磁盘空间不足

```bash
# 查看磁盘使用
df -h

# 清理Docker资源
docker system prune -a

# 查看Docker磁盘使用
docker system df
```

---

## 🚢 生产环境优化

### 1. 使用Nginx反向代理

```bash
# 安装Nginx
sudo apt-get install nginx  # Ubuntu/Debian
sudo yum install nginx       # CentOS/RHEL

# 配置Nginx
sudo nano /etc/nginx/sites-available/ai-web-planner
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/ai-web-planner /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2. 配置SSL证书

```bash
# 安装Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 3. 设置自动启动

```bash
# Docker服务已设置为开机自动启动
sudo systemctl enable docker

# 容器设置为自动重启（已在docker-compose.yml中配置）
# restart: unless-stopped
```

### 4. 配置日志轮转

创建 `/etc/logrotate.d/docker-compose`:

```
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=10M
    missingok
    delaycompress
    copytruncate
}
```

---

## 📈 监控和维护

### 查看资源使用

```bash
# 实时监控
docker stats

# 查看磁盘使用
docker system df

# 查看镜像
docker images
```

### 定期清理

```bash
# 清理未使用的容器
docker container prune

# 清理未使用的镜像
docker image prune -a

# 清理所有未使用资源
docker system prune -a --volumes
```

### 备份

```bash
# 备份数据（如果有持久化数据）
docker compose exec backend tar czf /tmp/backup.tar.gz /app/data
docker cp ai-web-planner-backend:/tmp/backup.tar.gz ./backup-$(date +%Y%m%d).tar.gz
```

---

## 🎉 完成！

现在你的AI Web Planner已经在Linux虚拟机上成功部署！

**访问地址**: http://虚拟机IP:3000

**后端API**: http://虚拟机IP:3001

**健康检查**: http://虚拟机IP:3001/health

---

## 📞 需要帮助？

如果遇到问题:

1. 查看日志: `docker compose logs -f`
2. 检查服务状态: `docker compose ps`
3. 查看系统日志: `sudo journalctl -u docker -f`
4. 查看本文档的故障排查部分

祝部署顺利！🚀

