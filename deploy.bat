@echo off
chcp 65001 >nul
REM AI Web Planner - Windows部署脚本
REM 使用方法: deploy.bat

echo 🚀 AI Web Planner - 部署脚本
echo ================================
echo.

REM 检查Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未安装 Node.js
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查Git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未安装 Git
    echo 请先安装 Git: https://git-scm.com/downloads
    pause
    exit /b 1
)

echo ✅ 环境检查通过
echo.

REM 步骤1: 构建测试
echo 📦 步骤1: 测试构建...
cd frontend
call npm install
call npm run build

if %errorlevel% neq 0 (
    echo ❌ 构建失败，请检查错误信息
    pause
    exit /b 1
)

echo ✅ 构建成功
cd ..
echo.

REM 步骤2: Git初始化
echo 📝 步骤2: 准备Git仓库...

if not exist ".git" (
    echo 初始化Git仓库...
    git init
    git branch -M main
)

echo ✅ Git仓库准备完成
echo.

REM 步骤3: 提交代码
echo 💾 步骤3: 提交代码...
git add .
git commit -m "Deploy: AI Web Planner v1.0"

echo ✅ 代码已提交
echo.

REM 步骤4: 推送到GitHub
echo 📤 步骤4: 推送到GitHub...
echo.
echo 请输入你的GitHub仓库URL（例如: https://github.com/username/AI-Web-Planner.git）:
set /p REPO_URL=

if "%REPO_URL%"=="" (
    echo ⚠️  未输入仓库URL，跳过推送
) else (
    REM 检查是否已添加remote
    git remote | findstr "origin" >nul
    if %errorlevel% equ 0 (
        echo 更新remote URL...
        git remote set-url origin %REPO_URL%
    ) else (
        echo 添加remote...
        git remote add origin %REPO_URL%
    )
    
    echo 推送到GitHub...
    git push -u origin main
    
    if %errorlevel% equ 0 (
        echo ✅ 代码已推送到GitHub
    ) else (
        echo ⚠️  推送失败，请手动推送
    )
)

echo.
echo ================================
echo 🎉 部署准备完成！
echo.
echo 下一步:
echo 1. 访问 https://vercel.com
echo 2. 使用GitHub登录
echo 3. 导入你的仓库
echo 4. 配置构建设置:
echo    - Build Command: cd frontend ^&^& npm install ^&^& npm run build
echo    - Output Directory: frontend/dist
echo 5. 点击 Deploy
echo.
echo 详细步骤请查看: docs/DEPLOYMENT_GUIDE.md
echo ================================
echo.
pause

