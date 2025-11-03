# 多阶段构建 Dockerfile

# 阶段 1: 构建阶段
FROM node:22-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装所有依赖 (包括 devDependencies,因为构建需要)
RUN npm ci

# 复制源代码
COPY . .

# ========================================
# 定义构建参数 (从 docker build --build-arg 传入)
# ========================================
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_AMAP_KEY
ARG VITE_AMAP_SECRET
ARG VITE_ALIYUN_LLM_API_KEY
ARG VITE_ALIYUN_LLM_ENDPOINT
ARG VITE_XFEI_APP_ID
ARG VITE_XFEI_API_KEY
ARG VITE_XFEI_API_SECRET

# ========================================
# 将构建参数转换为环境变量 (Vite 会在构建时读取)
# ========================================
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_AMAP_KEY=$VITE_AMAP_KEY
ENV VITE_AMAP_SECRET=$VITE_AMAP_SECRET
ENV VITE_ALIYUN_LLM_API_KEY=$VITE_ALIYUN_LLM_API_KEY
ENV VITE_ALIYUN_LLM_ENDPOINT=$VITE_ALIYUN_LLM_ENDPOINT
ENV VITE_XFEI_APP_ID=$VITE_XFEI_APP_ID
ENV VITE_XFEI_API_KEY=$VITE_XFEI_API_KEY
ENV VITE_XFEI_API_SECRET=$VITE_XFEI_API_SECRET

# 构建应用 (Vite 会读取上面的 ENV 并注入到代码中)
RUN npm run build

# 阶段 2: 生产阶段
FROM nginx:alpine

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]

