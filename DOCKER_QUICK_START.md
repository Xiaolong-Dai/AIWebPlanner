# 🐳 Docker 快速部署指南 (Windows)

## 📋 前置要求

### 1. 安装 Docker Desktop

如果还未安装 Docker Desktop:

1. 访问: https://www.docker.com/products/docker-desktop
2. 下载 Windows 版本
3. 运行安装程序
4. 重启电脑
5. 启动 Docker Desktop

### 2. 确保 Docker Desktop 正在运行

- 查看系统托盘（右下角）
- Docker 图标应该是**绿色**的
- 如果是灰色，请等待启动完成

---

## 🚀 一键部署

### 方法1: 使用部署脚本（推荐）

在项目根目录打开命令提示符或 PowerShell，运行:

```bash
docker-deploy.bat
```

脚本会自动:
- ✅ 检查 Docker 环境
- ✅ 构建镜像
- ✅ 启动容器
- ✅ 显示访问地址

### 方法2: 手动部署

```bash
# 1. 构建镜像
docker-compose build

# 2. 启动容器
docker-compose up -d

# 3. 查看状态
docker-compose ps
```

---

## 🌐 访问应用

部署成功后:

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:3001

---

## 🔧 配置 API Keys

### 方式1: 通过应用界面配置（推荐）

1. 打开浏览器访问 http://localhost:3000
2. 点击右上角的**设置图标** ⚙️
3. 在设置页面填入以下 API Keys:

   - **Supabase URL** 和 **Anon Key**
   - **科大讯飞** App ID、API Key、API Secret
   - **高德地图** Web Key
   - **阿里云通义千问** API Key 和 Endpoint

4. 点击保存

### 方式2: 通过环境变量配置

1. 复制环境变量模板:
   ```bash
   copy frontend\.env.example frontend\.env.local
   ```

2. 编辑 `frontend/.env.local`，填入真实的 API Keys

3. 重新构建和启动:
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

---

## 📊 管理容器

### 查看运行状态

```bash
docker-compose ps
```

### 查看日志

```bash
# 查看所有日志
docker-compose logs

# 实时查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs frontend
docker-compose logs backend
```

### 停止服务

```bash
docker-compose stop
```

### 启动服务

```bash
docker-compose start
```

### 重启服务

```bash
docker-compose restart
```

### 删除容器

```bash
docker-compose down
```

### 删除容器和镜像

```bash
docker-compose down --rmi all
```

---

## 🔍 故障排查

### 问题1: 端口被占用

**错误信息**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**解决方案**:

1. 查找占用端口的程序:
   ```powershell
   netstat -ano | findstr :3000
   netstat -ano | findstr :3001
   ```

2. 关闭占用端口的程序，或修改 `docker-compose.yml` 中的端口映射:
   ```yaml
   ports:
     - "3002:80"  # 将3000改为3002
   ```

### 问题2: Docker Desktop 未运行

**错误信息**: `Cannot connect to the Docker daemon`

**解决方案**:

1. 启动 Docker Desktop
2. 等待图标变为绿色
3. 重新运行部署脚本

### 问题3: 构建失败

**可能原因**:
- 网络问题
- 磁盘空间不足
- 依赖下载失败

**解决方案**:

1. 检查网络连接
2. 清理 Docker 缓存:
   ```bash
   docker system prune -a
   ```
3. 重新构建:
   ```bash
   docker-compose build --no-cache
   ```

### 问题4: 容器启动后无法访问

**解决方案**:

1. 检查容器状态:
   ```bash
   docker-compose ps
   ```

2. 查看容器日志:
   ```bash
   docker-compose logs
   ```

3. 检查健康状态:
   ```bash
   docker inspect ai-web-planner-frontend
   docker inspect ai-web-planner-backend
   ```

### 问题5: 前端显示空白页面

**解决方案**:

1. 检查浏览器控制台错误
2. 确认 API Keys 已正确配置
3. 检查后端服务是否正常:
   ```bash
   curl http://localhost:3001/health
   ```

---

## 🎯 验证部署

### 1. 检查容器状态

```bash
docker-compose ps
```

应该看到两个容器都是 `Up` 状态:
- `ai-web-planner-frontend`
- `ai-web-planner-backend`

### 2. 测试前端

打开浏览器访问: http://localhost:3000

应该看到登录页面

### 3. 测试后端

```bash
curl http://localhost:3001/health
```

应该返回: `{"status":"ok"}`

---

## 📦 更新应用

当代码有更新时:

```bash
# 1. 停止容器
docker-compose down

# 2. 拉取最新代码
git pull

# 3. 重新构建
docker-compose build

# 4. 启动容器
docker-compose up -d
```

---

## 🌟 性能优化

### 1. 限制资源使用

编辑 `docker-compose.yml`，添加资源限制:

```yaml
services:
  frontend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

### 2. 使用 Docker 缓存

构建时利用缓存:

```bash
docker-compose build
```

### 3. 清理未使用的资源

```bash
# 清理未使用的镜像
docker image prune

# 清理未使用的容器
docker container prune

# 清理所有未使用的资源
docker system prune -a
```

---

## 📚 相关文档

- [完整部署指南](docs/DOCKER_DEPLOYMENT.md)
- [项目文档](README.md)
- [故障排查](docs/TROUBLESHOOTING.md)

---

## 🆘 需要帮助？

如果遇到问题:

1. 查看日志: `docker-compose logs -f`
2. 检查 [故障排查](#-故障排查) 部分
3. 查看详细文档: `docs/DOCKER_DEPLOYMENT.md`

---

## 🎉 开始使用

部署成功后:

1. 访问 http://localhost:3000
2. 注册账号
3. 配置 API Keys（设置页面）
4. 开始规划你的旅行！

---

**祝你使用愉快！** 🚀

