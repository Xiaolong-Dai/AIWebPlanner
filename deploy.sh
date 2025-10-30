#!/bin/bash

# AI Web Planner - 快速部署脚本
# 使用方法: bash deploy.sh

echo "🚀 AI Web Planner - 部署脚本"
echo "================================"
echo ""

# 检查是否安装了git
if ! command -v git &> /dev/null; then
    echo "❌ 错误: 未安装 Git"
    echo "请先安装 Git: https://git-scm.com/downloads"
    exit 1
fi

# 检查是否安装了Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装 Node.js"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ 环境检查通过"
echo ""

# 步骤1: 构建测试
echo "📦 步骤1: 测试构建..."
cd frontend
npm install
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi

echo "✅ 构建成功"
cd ..
echo ""

# 步骤2: Git初始化
echo "📝 步骤2: 准备Git仓库..."

if [ ! -d ".git" ]; then
    echo "初始化Git仓库..."
    git init
    git branch -M main
fi

echo "✅ Git仓库准备完成"
echo ""

# 步骤3: 提交代码
echo "💾 步骤3: 提交代码..."
git add .
git commit -m "Deploy: AI Web Planner v1.0"

echo "✅ 代码已提交"
echo ""

# 步骤4: 推送到GitHub
echo "📤 步骤4: 推送到GitHub..."
echo ""
echo "请输入你的GitHub仓库URL（例如: https://github.com/username/AI-Web-Planner.git）:"
read REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "⚠️  未输入仓库URL，跳过推送"
else
    # 检查是否已添加remote
    if git remote | grep -q "origin"; then
        echo "更新remote URL..."
        git remote set-url origin $REPO_URL
    else
        echo "添加remote..."
        git remote add origin $REPO_URL
    fi
    
    echo "推送到GitHub..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ 代码已推送到GitHub"
    else
        echo "⚠️  推送失败，请手动推送"
    fi
fi

echo ""
echo "================================"
echo "🎉 部署准备完成！"
echo ""
echo "下一步:"
echo "1. 访问 https://vercel.com"
echo "2. 使用GitHub登录"
echo "3. 导入你的仓库"
echo "4. 配置构建设置:"
echo "   - Build Command: cd frontend && npm install && npm run build"
echo "   - Output Directory: frontend/dist"
echo "5. 点击 Deploy"
echo ""
echo "详细步骤请查看: docs/DEPLOYMENT_GUIDE.md"
echo "================================"

