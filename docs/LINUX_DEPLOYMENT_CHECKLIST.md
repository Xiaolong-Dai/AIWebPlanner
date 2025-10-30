# ✅ Linux虚拟机部署检查清单

## 📋 快速检查（5分钟）

### 核心检查项

- [ ] 容器运行正常: `docker compose ps`
- [ ] 前端可访问: `http://虚拟机IP:3000`
- [ ] 后端健康检查: `curl http://localhost:3001/health`
- [ ] 防火墙已配置
- [ ] API服务已配置

---

## 📦 详细检查清单

### 1. 环境准备 (部署前)

- [ ] Linux虚拟机已安装
- [ ] 虚拟机内存 >= 2GB
- [ ] 虚拟机磁盘 >= 10GB
- [ ] 可以SSH连接
- [ ] 知道虚拟机IP地址

### 2. 打包上传 (Windows)

- [ ] 运行 `package-for-linux.bat`
- [ ] 生成 `AI-Web-Planner-Deploy.tar.gz`
- [ ] 上传到Linux虚拟机
- [ ] 文件大小正常 (10-50MB)

### 3. 解压部署 (Linux)

- [ ] 解压: `tar -xzf AI-Web-Planner-Deploy.tar.gz`
- [ ] 进入目录: `cd AI-Web-Planner`
- [ ] 文件完整 (frontend, backend, docs等)
- [ ] 运行: `chmod +x deploy-linux.sh`
- [ ] 执行: `./deploy-linux.sh`

### 4. Docker检查

- [ ] Docker已安装: `docker --version`
- [ ] Docker Compose已安装: `docker compose version`
- [ ] Docker服务运行: `sudo systemctl status docker`
- [ ] 用户在docker组: `groups | grep docker`

### 5. 容器状态

- [ ] 后端容器: `Up (healthy)`
- [ ] 前端容器: `Up (healthy)`
- [ ] 无Exited状态容器
- [ ] 查看: `docker compose ps`

### 6. 网络配置

- [ ] 防火墙允许3000端口
- [ ] 防火墙允许3001端口
- [ ] Windows可以ping通虚拟机
- [ ] 虚拟机可以访问互联网

### 7. 服务测试

**后端:**
- [ ] `curl http://localhost:3001/health` 返回OK
- [ ] `curl http://虚拟机IP:3001/health` 返回OK

**前端:**
- [ ] `curl -I http://localhost:3000` 返回200
- [ ] 浏览器访问 `http://虚拟机IP:3000` 正常

### 8. 应用配置

- [ ] 进入设置页面
- [ ] 配置Supabase (URL + Key)
- [ ] 配置阿里云百炼 (API Key)
- [ ] 配置高德地图 (API Key)
- [ ] 所有服务测试通过

### 9. 数据库初始化

- [ ] 登录Supabase Dashboard
- [ ] 执行 `docs/database_setup.sql`
- [ ] 表创建成功 (travel_plans, expenses)

### 10. 功能测试

- [ ] 用户注册/登录
- [ ] 创建旅行计划
- [ ] AI生成行程
- [ ] 地图显示正常
- [ ] 预算管理功能
- [ ] 数据持久化

---

## 🎯 部署完成标准

### 必须通过 (Critical)

✅ 容器状态: `Up (healthy)`  
✅ 前端可访问: `http://虚拟机IP:3000`  
✅ 后端健康检查通过  
✅ API服务配置成功  
✅ 核心功能正常  

### 建议通过 (Recommended)

✅ 防火墙配置完整  
✅ 性能指标正常  
✅ 日志无严重错误  
✅ 文档齐全  

---

## 📊 部署信息记录

```
部署日期: _______________
虚拟机IP: _______________
操作系统: _______________
Docker版本: _______________
访问地址: http://_______________:3000
部署人员: _______________
```

---

## 🚨 常见问题快速检查

### 问题1: 无法访问应用

```bash
# 检查容器
docker compose ps

# 检查端口
sudo netstat -tulpn | grep 3000

# 检查防火墙
sudo ufw status  # Ubuntu
sudo firewall-cmd --list-ports  # CentOS
```

### 问题2: 容器启动失败

```bash
# 查看日志
docker compose logs backend
docker compose logs frontend

# 重新构建
docker compose down
docker compose build
docker compose up -d
```

### 问题3: API服务失败

```bash
# 测试后端代理
curl http://localhost:3001/health

# 查看后端日志
docker compose logs backend

# 检查网络
docker network ls
```

---

## ✅ 最终确认

部署完成后，确认以下所有项:

- [ ] ✅ 所有容器运行正常
- [ ] ✅ 可以从Windows访问应用
- [ ] ✅ 所有API服务配置成功
- [ ] ✅ 可以创建和管理旅行计划
- [ ] ✅ 数据可以正常保存和加载
- [ ] ✅ 日志无严重错误
- [ ] ✅ 性能符合要求

**签名**: _______________  
**日期**: _______________

---

## 📚 相关文档

- [快速部署指南](QUICK_DEPLOY_LINUX.md)
- [详细部署指南](LINUX_DEPLOYMENT.md)
- [Docker部署指南](DOCKER_DEPLOYMENT.md)
- [故障排查](TROUBLESHOOTING.md)

---

**部署成功！** 🎉

