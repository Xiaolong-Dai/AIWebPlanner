@echo off
chcp 65001 >nul
REM AI Web Planner - Docker部署脚本 (Windows)
REM 使用方法: docker-deploy.bat

echo.
echo ========================================
echo 🐳 AI Web Planner - Docker 部署脚本
echo ========================================
echo.

REM 检查Docker是否安装
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未安装 Docker Desktop
    echo.
    echo 请先安装 Docker Desktop:
    echo https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

REM 检查Docker是否运行
docker info >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  Docker Desktop 未运行
    echo.
    echo 正在尝试启动 Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo.
    echo 请等待 Docker Desktop 启动（约30-60秒）...
    echo 当系统托盘的Docker图标变为绿色后，按任意键继续...
    pause >nul
    
    REM 再次检查
    docker info >nul 2>nul
    if %errorlevel% neq 0 (
        echo ❌ Docker Desktop 仍未运行
        echo.
        echo 请手动启动 Docker Desktop，然后重新运行此脚本
        pause
        exit /b 1
    )
)

echo ✅ Docker Desktop 运行正常
echo.

REM 显示当前Docker版本
echo 📦 Docker 版本信息:
docker --version
docker-compose --version
echo.

REM 询问是否需要配置环境变量
echo ========================================
echo 📝 环境变量配置
echo ========================================
echo.
echo 注意: API Key 可以在应用启动后通过设置页面配置
echo 也可以现在通过 .env 文件配置
echo.
echo 是否现在配置环境变量? (y/n)
set /p CONFIG_ENV=

if /i "%CONFIG_ENV%"=="y" (
    echo.
    echo 请编辑 frontend/.env.local 文件，填入你的 API Keys
    echo 参考模板: frontend/.env.example
    echo.
    echo 编辑完成后，按任意键继续...
    pause >nul
)

echo.
echo ========================================
echo 🏗️  开始构建和部署
echo ========================================
echo.

REM 停止并删除旧容器
echo 📦 清理旧容器...
docker-compose down 2>nul
echo.

REM 构建镜像
echo 🔨 构建 Docker 镜像...
echo 这可能需要几分钟时间，请耐心等待...
echo.
docker-compose build

if %errorlevel% neq 0 (
    echo.
    echo ❌ 构建失败！
    echo.
    echo 常见问题:
    echo 1. 网络问题 - 请检查网络连接
    echo 2. 磁盘空间不足 - 请清理磁盘空间
    echo 3. 端口被占用 - 请关闭占用3000或3001端口的程序
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ 镜像构建成功
echo.

REM 启动容器
echo 🚀 启动容器...
docker-compose up -d

if %errorlevel% neq 0 (
    echo.
    echo ❌ 启动失败！
    echo.
    echo 查看错误日志:
    docker-compose logs
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ 容器启动成功
echo.

REM 等待服务启动
echo ⏳ 等待服务启动...
timeout /t 10 /nobreak >nul
echo.

REM 检查容器状态
echo 📊 容器状态:
docker-compose ps
echo.

REM 显示日志
echo 📋 最近日志:
docker-compose logs --tail=20
echo.

echo ========================================
echo 🎉 部署完成！
echo ========================================
echo.
echo 📍 访问地址:
echo    前端应用: http://localhost:3000
echo    后端API:  http://localhost:3001
echo.
echo 📝 常用命令:
echo    查看日志:   docker-compose logs -f
echo    停止服务:   docker-compose stop
echo    启动服务:   docker-compose start
echo    重启服务:   docker-compose restart
echo    删除容器:   docker-compose down
echo    查看状态:   docker-compose ps
echo.
echo 🔧 配置 API Keys:
echo    1. 访问 http://localhost:3000
echo    2. 点击右上角设置图标
echo    3. 在设置页面填入各项 API Keys
echo.
echo 📖 详细文档: docs/DOCKER_DEPLOYMENT.md
echo ========================================
echo.

REM 询问是否打开浏览器
echo 是否现在打开浏览器? (y/n)
set /p OPEN_BROWSER=

if /i "%OPEN_BROWSER%"=="y" (
    start http://localhost:3000
)

echo.
echo 按任意键退出...
pause >nul

