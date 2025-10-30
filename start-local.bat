@echo off
chcp 65001 >nul
REM AI Web Planner - 本地运行脚本 (Windows)

echo.
echo ========================================
echo 🚀 AI Web Planner - 本地运行
echo ========================================
echo.

REM 检查Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未安装 Node.js
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js 已安装
node --version
npm --version
echo.

REM 检查后端依赖
echo 📦 检查后端依赖...
cd backend
if not exist "node_modules" (
    echo 安装后端依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 后端依赖安装失败
        cd ..
        pause
        exit /b 1
    )
)
cd ..
echo ✅ 后端依赖已就绪
echo.

REM 检查前端依赖
echo 📦 检查前端依赖...
cd frontend
if not exist "node_modules" (
    echo 安装前端依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 前端依赖安装失败
        cd ..
        pause
        exit /b 1
    )
)
cd ..
echo ✅ 前端依赖已就绪
echo.

echo ========================================
echo 🎯 启动服务
echo ========================================
echo.

REM 启动后端(后台运行)
echo 🔧 启动后端服务...
start "AI Web Planner - Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul
echo ✅ 后端服务已启动 (http://localhost:3001)
echo.

REM 启动前端(后台运行)
echo 🌐 启动前端服务...
start "AI Web Planner - Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul
echo ✅ 前端服务已启动
echo.

echo ========================================
echo 🎉 服务启动完成！
echo ========================================
echo.
echo 📍 访问地址:
echo    前端开发服务器: http://localhost:5173
echo    后端API服务器:  http://localhost:3001
echo.
echo 📝 说明:
echo    - 两个服务在独立的命令窗口中运行
echo    - 关闭命令窗口即可停止对应服务
echo    - 前端支持热重载,修改代码会自动刷新
echo.
echo 🔧 配置 API Keys:
echo    1. 访问 http://localhost:5173
echo    2. 点击右上角设置图标
echo    3. 在设置页面填入各项 API Keys
echo.
echo ⚠️  注意:
echo    - 请保持两个命令窗口打开
echo    - 如需停止服务,关闭对应窗口或按 Ctrl+C
echo.
echo ========================================
echo.

REM 等待5秒后自动打开浏览器
echo 5秒后将自动打开浏览器...
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo 按任意键退出此窗口(服务将继续运行)...
pause >nul

