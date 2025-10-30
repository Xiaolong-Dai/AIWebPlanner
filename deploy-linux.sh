#!/bin/bash

# AI Web Planner - Linux自动部署脚本
# 适用于: Ubuntu, Debian, CentOS, RHEL

set -e  # 遇到错误立即退出

echo "========================================"
echo "🐧 AI Web Planner - Linux自动部署"
echo "========================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检测操作系统
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VER=$VERSION_ID
    else
        echo -e "${RED}❌ 无法检测操作系统${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ 检测到操作系统: $OS $VER${NC}"
}

# 安装Docker
install_docker() {
    echo ""
    echo "📦 检查Docker安装状态..."
    
    if command -v docker &> /dev/null; then
        echo -e "${GREEN}✅ Docker已安装: $(docker --version)${NC}"
        return 0
    fi
    
    echo -e "${YELLOW}⚠️  Docker未安装，开始安装...${NC}"
    
    case $OS in
        ubuntu|debian)
            echo "安装Docker (Ubuntu/Debian)..."
            sudo apt-get update
            sudo apt-get install -y \
                ca-certificates \
                curl \
                gnupg \
                lsb-release
            
            # 添加Docker官方GPG密钥
            sudo mkdir -p /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/$OS/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
            
            # 设置仓库
            echo \
              "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$OS \
              $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            
            # 安装Docker Engine
            sudo apt-get update
            sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            ;;
            
        centos|rhel|fedora)
            echo "安装Docker (CentOS/RHEL/Fedora)..."
            sudo yum install -y yum-utils
            sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            ;;
            
        *)
            echo -e "${RED}❌ 不支持的操作系统: $OS${NC}"
            echo "请手动安装Docker: https://docs.docker.com/engine/install/"
            exit 1
            ;;
    esac
    
    # 启动Docker服务
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # 将当前用户添加到docker组
    sudo usermod -aG docker $USER
    
    echo -e "${GREEN}✅ Docker安装完成${NC}"
    echo -e "${YELLOW}⚠️  请注意: 需要重新登录以使docker组权限生效${NC}"
    echo -e "${YELLOW}   或运行: newgrp docker${NC}"
}

# 检查Docker服务
check_docker_service() {
    echo ""
    echo "🔍 检查Docker服务状态..."
    
    if ! sudo systemctl is-active --quiet docker; then
        echo -e "${YELLOW}⚠️  Docker服务未运行，正在启动...${NC}"
        sudo systemctl start docker
    fi
    
    if sudo systemctl is-active --quiet docker; then
        echo -e "${GREEN}✅ Docker服务正在运行${NC}"
    else
        echo -e "${RED}❌ Docker服务启动失败${NC}"
        exit 1
    fi
}

# 检查Docker Compose
check_docker_compose() {
    echo ""
    echo "📦 检查Docker Compose..."
    
    if docker compose version &> /dev/null; then
        echo -e "${GREEN}✅ Docker Compose已安装: $(docker compose version)${NC}"
    else
        echo -e "${RED}❌ Docker Compose未安装${NC}"
        exit 1
    fi
}

# 构建和部署
deploy_application() {
    echo ""
    echo "🚀 开始部署应用..."
    
    # 停止旧容器
    echo ""
    echo "📦 停止旧容器..."
    docker compose down 2>/dev/null || true
    
    # 构建镜像
    echo ""
    echo "🔨 构建Docker镜像..."
    docker compose build
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 构建失败${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 构建成功${NC}"
    
    # 启动服务
    echo ""
    echo "🚀 启动服务..."
    docker compose up -d
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 启动失败${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 服务已启动${NC}"
}

# 等待服务就绪
wait_for_services() {
    echo ""
    echo "⏳ 等待服务就绪..."
    sleep 10
    
    # 检查后端健康
    echo ""
    echo "🧪 测试后端服务..."
    for i in {1..5}; do
        if curl -s http://localhost:3001/health > /dev/null; then
            echo -e "${GREEN}✅ 后端服务正常${NC}"
            curl -s http://localhost:3001/health | jq . 2>/dev/null || curl -s http://localhost:3001/health
            break
        fi
        if [ $i -eq 5 ]; then
            echo -e "${YELLOW}⚠️  后端服务响应超时${NC}"
        fi
        sleep 2
    done
    
    # 检查前端
    echo ""
    echo "🧪 测试前端服务..."
    if curl -s http://localhost:3000 > /dev/null; then
        echo -e "${GREEN}✅ 前端服务正常${NC}"
    else
        echo -e "${YELLOW}⚠️  前端服务响应超时${NC}"
    fi
}

# 显示服务状态
show_status() {
    echo ""
    echo "📊 服务状态:"
    echo ""
    docker compose ps
}

# 显示访问信息
show_access_info() {
    echo ""
    echo "========================================"
    echo "🎉 部署完成！"
    echo "========================================"
    echo ""
    echo "📍 访问地址:"
    
    # 获取IP地址
    IP=$(hostname -I | awk '{print $1}')
    
    echo "   本地访问:"
    echo "   - 前端应用: http://localhost:3000"
    echo "   - 后端API:  http://localhost:3001"
    echo "   - 健康检查: http://localhost:3001/health"
    echo ""
    echo "   远程访问:"
    echo "   - 前端应用: http://$IP:3000"
    echo "   - 后端API:  http://$IP:3001"
    echo ""
    echo "📋 常用命令:"
    echo "   查看日志: docker compose logs -f"
    echo "   停止服务: docker compose down"
    echo "   重启服务: docker compose restart"
    echo "   查看状态: docker compose ps"
    echo ""
    echo "📖 详细文档: docs/DOCKER_DEPLOYMENT.md"
    echo "========================================"
}

# 主流程
main() {
    detect_os
    install_docker
    check_docker_service
    check_docker_compose
    deploy_application
    wait_for_services
    show_status
    show_access_info
}

# 运行主流程
main

