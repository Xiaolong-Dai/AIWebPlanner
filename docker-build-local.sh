#!/bin/bash

# ========================================
# AI Web Planner - 本地 Docker 构建脚本 (Linux/macOS)
# ========================================
# 
# 功能：
# 1. 从 frontend/.env 读取环境变量
# 2. 构建 Docker 镜像（注入环境变量）
# 3. 运行 Docker 容器
#
# 使用方法：
# chmod +x docker-build-local.sh
# ./docker-build-local.sh
#
# ========================================

echo "========================================"
echo "🐳 AI Web Planner - 本地 Docker 构建"
echo "========================================"
echo ""

# 检查 Docker 是否安装
echo "📋 检查 Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi
echo "✅ Docker 已安装"
echo ""

# 读取环境变量
echo "📋 读取环境变量..."
ENV_FILE="frontend/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ 未找到 $ENV_FILE 文件"
    echo "💡 请先创建 frontend/.env 文件并配置 API Keys"
    exit 1
fi

# 加载环境变量
set -a
source "$ENV_FILE"
set +a

# 显示读取到的配置
echo "✅ 环境变量读取成功:"
echo "  VITE_SUPABASE_URL: ${VITE_SUPABASE_URL:+已配置 ✅}"
echo "  VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY:+已配置 ✅}"
echo "  VITE_AMAP_KEY: ${VITE_AMAP_KEY:+已配置 ✅}"
echo "  VITE_ALIYUN_LLM_API_KEY: ${VITE_ALIYUN_LLM_API_KEY:+已配置 ✅}"
echo "  VITE_XFEI_APP_ID: ${VITE_XFEI_APP_ID:+已配置 ✅}"
echo ""

# 构建 Docker 镜像
echo "🔨 构建 Docker 镜像..."
echo "💡 这可能需要几分钟时间..."
echo ""

docker build \
    --build-arg VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
    --build-arg VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
    --build-arg VITE_AMAP_KEY="$VITE_AMAP_KEY" \
    --build-arg VITE_AMAP_SECRET="$VITE_AMAP_SECRET" \
    --build-arg VITE_ALIYUN_LLM_API_KEY="$VITE_ALIYUN_LLM_API_KEY" \
    --build-arg VITE_ALIYUN_LLM_ENDPOINT="$VITE_ALIYUN_LLM_ENDPOINT" \
    --build-arg VITE_XFEI_APP_ID="$VITE_XFEI_APP_ID" \
    --build-arg VITE_XFEI_API_KEY="$VITE_XFEI_API_KEY" \
    --build-arg VITE_XFEI_API_SECRET="$VITE_XFEI_API_SECRET" \
    -t ai-web-planner-frontend:local \
    -f frontend/Dockerfile \
    frontend

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Docker 镜像构建失败"
    exit 1
fi

echo ""
echo "✅ Docker 镜像构建成功！"
echo ""

# 询问是否运行容器
echo "========================================"
read -p "是否立即运行容器？(Y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    echo ""
    echo "🚀 启动 Docker 容器..."
    
    # 停止并删除旧容器（如果存在）
    docker stop ai-web-planner-local 2>/dev/null
    docker rm ai-web-planner-local 2>/dev/null
    
    # 运行新容器
    docker run -d \
        --name ai-web-planner-local \
        -p 3000:80 \
        ai-web-planner-frontend:local
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ 容器启动成功！"
        echo ""
        echo "========================================"
        echo "📱 访问应用:"
        echo "   http://localhost:3000"
        echo ""
        echo "🔍 查看日志:"
        echo "   docker logs -f ai-web-planner-local"
        echo ""
        echo "🛑 停止容器:"
        echo "   docker stop ai-web-planner-local"
        echo "========================================"
        echo ""
        
        # 尝试打开浏览器（仅 macOS 和 Linux）
        if command -v open &> /dev/null; then
            echo "⏳ 2 秒后自动打开浏览器..."
            sleep 2
            open "http://localhost:3000"
        elif command -v xdg-open &> /dev/null; then
            echo "⏳ 2 秒后自动打开浏览器..."
            sleep 2
            xdg-open "http://localhost:3000"
        fi
    else
        echo ""
        echo "❌ 容器启动失败"
        exit 1
    fi
else
    echo ""
    echo "💡 手动运行容器:"
    echo "   docker run -d --name ai-web-planner-local -p 3000:80 ai-web-planner-frontend:local"
    echo ""
fi

