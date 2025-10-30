# 后端代理服务 Dockerfile
FROM node:22-alpine

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 3001

# 启动应用
CMD ["node", "server.js"]

