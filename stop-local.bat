@echo off
chcp 65001 >nul
REM AI Web Planner - 停止本地服务脚本

echo.
echo ========================================
echo 🛑 AI Web Planner - 停止服务
echo ========================================
echo.

echo 正在查找运行中的服务...
echo.

REM 查找并停止占用3001端口的进程(后端)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo 停止后端服务 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>nul
)

REM 查找并停止占用5173端口的进程(前端)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    echo 停止前端服务 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>nul
)

echo.
echo ✅ 服务已停止
echo.
pause

