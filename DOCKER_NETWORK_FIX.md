# 🔧 Docker 网络问题解决方案

## 问题描述

构建Docker镜像时出现网络连接错误:
```
failed to fetch oauth token: Post "https://auth.docker.io/token": dial tcp 162.125.2.5:443: connectex
```

这是因为无法连接到 Docker Hub 下载基础镜像。

---

## 解决方案

### 方案1: 配置Docker镜像加速器(推荐)

#### 1.1 打开 Docker Desktop 设置

1. 右键点击系统托盘的 Docker 图标
2. 选择 **Settings** (设置)
3. 选择 **Docker Engine**

#### 1.2 添加镜像加速器

在配置文件中添加以下内容:

```json
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://docker.1panel.live",
    "https://hub.rat.dev"
  ]
}
```

完整配置示例:
```json
{
  "builder": {
    "gc": {
      "defaultKeepStorage": "20GB",
      "enabled": true
    }
  },
  "experimental": false,
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://docker.1panel.live",
    "https://hub.rat.dev"
  ]
}
```

#### 1.3 应用并重启

1. 点击 **Apply & Restart** (应用并重启)
2. 等待 Docker Desktop 重启完成
3. 重新运行构建命令

---

### 方案2: 使用VPN或代理

如果你有VPN或代理:

#### 2.1 配置Docker代理

1. 打开 Docker Desktop 设置
2. 选择 **Resources** → **Proxies**
3. 启用 **Manual proxy configuration**
4. 填入代理地址,例如:
   - HTTP Proxy: `http://127.0.0.1:7890`
   - HTTPS Proxy: `http://127.0.0.1:7890`
5. 点击 **Apply & Restart**

---

### 方案3: 手动下载镜像

如果上述方法都不行,可以手动下载镜像:

```bash
# 下载 Node.js 镜像
docker pull node:18-alpine

# 下载 Nginx 镜像
docker pull nginx:alpine
```

然后重新构建:
```bash
docker-compose build
```

---

### 方案4: 使用国内镜像源

修改 Dockerfile,使用国内镜像:

#### 前端 Dockerfile (frontend/Dockerfile)

```dockerfile
# 使用阿里云镜像
FROM registry.cn-hangzhou.aliyuncs.com/library/node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM registry.cn-hangzhou.aliyuncs.com/library/nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 后端 Dockerfile (backend/Dockerfile)

```dockerfile
FROM registry.cn-hangzhou.aliyuncs.com/library/node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
```

---

### 方案5: 本地运行(不使用Docker)

如果Docker网络问题无法解决,可以直接在本地运行:

#### 5.1 启动后端

```bash
cd backend
npm install
npm start
```

后端将运行在 http://localhost:3001

#### 5.2 启动前端

打开新的终端:

```bash
cd frontend
npm install
npm run dev
```

前端将运行在 http://localhost:5173

---

## 推荐步骤

### 第一步: 配置镜像加速器

1. 打开 Docker Desktop → Settings → Docker Engine
2. 添加镜像加速器配置(见方案1)
3. 应用并重启

### 第二步: 重新构建

```bash
# 清理旧的构建缓存
docker system prune -a

# 重新构建
docker-compose build

# 启动容器
docker-compose up -d
```

### 第三步: 验证

```bash
# 查看容器状态
docker-compose ps

# 访问应用
# 前端: http://localhost:3000
# 后端: http://localhost:3001/health
```

---

## 常用Docker镜像加速器列表

| 提供商 | 镜像地址 | 说明 |
|--------|----------|------|
| DaoCloud | https://docker.m.daocloud.io | 推荐 |
| 1Panel | https://docker.1panel.live | 推荐 |
| Rat Dev | https://hub.rat.dev | 推荐 |
| 阿里云 | https://[你的ID].mirror.aliyuncs.com | 需要注册 |
| 腾讯云 | https://mirror.ccs.tencentyun.com | 公开 |
| 网易云 | https://hub-mirror.c.163.com | 公开 |

---

## 测试网络连接

### 测试Docker Hub连接

```bash
# 测试连接
curl -I https://hub.docker.com

# 测试镜像拉取
docker pull hello-world
```

### 测试镜像加速器

```bash
# 查看Docker配置
docker info | findstr "Registry Mirrors"
```

---

## 故障排查

### 问题1: 镜像加速器配置后仍然失败

**解决方案**:
1. 确认Docker Desktop已重启
2. 尝试更换其他镜像加速器
3. 检查防火墙设置

### 问题2: 代理配置无效

**解决方案**:
1. 确认代理服务正在运行
2. 检查代理地址和端口是否正确
3. 尝试在终端中设置环境变量:
   ```bash
   set HTTP_PROXY=http://127.0.0.1:7890
   set HTTPS_PROXY=http://127.0.0.1:7890
   docker-compose build
   ```

### 问题3: 下载速度很慢

**解决方案**:
1. 使用多个镜像加速器
2. 更换网络环境
3. 考虑使用本地运行方式

---

## 下一步

配置完成后,运行:

```bash
# Windows
docker-deploy.bat

# 或手动执行
docker-compose build
docker-compose up -d
```

---

**需要帮助?** 请提供:
1. Docker Desktop 版本
2. 网络环境(是否使用代理/VPN)
3. 错误信息截图

