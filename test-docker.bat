@echo off
chcp 65001 >nul
REM AI Web Planner - Docker 部署测试脚本

echo.
echo ========================================
echo 🧪 AI Web Planner - Docker 部署测试
echo ========================================
echo.

REM 检查Docker是否运行
docker info >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker Desktop 未运行
    echo 请先启动 Docker Desktop
    pause
    exit /b 1
)

echo ✅ Docker Desktop 运行正常
echo.

REM 测试1: 检查容器状态
echo 📊 测试1: 检查容器状态
echo ----------------------------------------
docker-compose ps
echo.

REM 测试2: 检查后端健康
echo 💚 测试2: 检查后端健康
echo ----------------------------------------
curl -s http://localhost:3001/health
echo.
echo.

REM 测试3: 检查前端访问
echo 🌐 测试3: 检查前端访问
echo ----------------------------------------
curl -s -o nul -w "HTTP状态码: %%{http_code}\n" http://localhost:3000
echo.

REM 测试4: 查看容器日志
echo 📋 测试4: 最近日志（后端）
echo ----------------------------------------
docker-compose logs --tail=10 backend
echo.

echo 📋 测试4: 最近日志（前端）
echo ----------------------------------------
docker-compose logs --tail=10 frontend
echo.

echo ========================================
echo 🎉 测试完成
echo ========================================
echo.
echo 如果所有测试都通过，可以访问:
echo http://localhost:3000
echo.
pause

