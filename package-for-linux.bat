@echo off
chcp 65001 >nul
REM 打包项目用于Linux部署

echo ================================
echo 📦 打包项目用于Linux部署
echo ================================
echo.

REM 设置变量
set PACKAGE_NAME=AI-Web-Planner-Deploy.tar.gz
set TEMP_DIR=deploy-temp

echo 📋 准备打包...
echo.

REM 创建临时目录
if exist %TEMP_DIR% rmdir /s /q %TEMP_DIR%
mkdir %TEMP_DIR%

echo ✅ 复制必要文件...
echo.

REM 复制必要的文件和目录
xcopy /E /I /Y frontend %TEMP_DIR%\frontend
xcopy /E /I /Y backend %TEMP_DIR%\backend
xcopy /E /I /Y docs %TEMP_DIR%\docs

REM 复制配置文件
copy /Y docker-compose.yml %TEMP_DIR%\
copy /Y .dockerignore %TEMP_DIR%\
copy /Y .gitignore %TEMP_DIR%\
copy /Y README.md %TEMP_DIR%\
copy /Y LICENSE %TEMP_DIR%\

REM 复制部署脚本
copy /Y deploy-linux.sh %TEMP_DIR%\
copy /Y docker-deploy.sh %TEMP_DIR%\

echo ✅ 清理不必要的文件...
echo.

REM 删除node_modules
if exist %TEMP_DIR%\frontend\node_modules rmdir /s /q %TEMP_DIR%\frontend\node_modules
if exist %TEMP_DIR%\backend\node_modules rmdir /s /q %TEMP_DIR%\backend\node_modules

REM 删除dist
if exist %TEMP_DIR%\frontend\dist rmdir /s /q %TEMP_DIR%\frontend\dist

REM 删除日志文件
del /s /q %TEMP_DIR%\*.log 2>nul

echo ✅ 创建压缩包...
echo.

REM 检查是否安装了tar
where tar >nul 2>nul
if %errorlevel% equ 0 (
    REM 使用Windows自带的tar
    tar -czf %PACKAGE_NAME% -C %TEMP_DIR% .
    echo ✅ 压缩包创建成功: %PACKAGE_NAME%
) else (
    echo ⚠️  未找到tar命令
    echo.
    echo 请手动压缩 %TEMP_DIR% 目录
    echo 或安装7-Zip后使用以下命令:
    echo "C:\Program Files\7-Zip\7z.exe" a -ttar %PACKAGE_NAME% %TEMP_DIR%\*
)

echo.
echo ✅ 清理临时文件...
rmdir /s /q %TEMP_DIR%

echo.
echo ================================
echo 🎉 打包完成！
echo ================================
echo.
echo 📦 压缩包: %PACKAGE_NAME%
echo 📏 大小: 
dir %PACKAGE_NAME% | findstr %PACKAGE_NAME%
echo.
echo 📤 上传到Linux虚拟机:
echo.
echo 方法1: 使用SCP
echo    scp %PACKAGE_NAME% user@linux-ip:/home/user/
echo.
echo 方法2: 使用SFTP
echo    sftp user@linux-ip
echo    put %PACKAGE_NAME%
echo.
echo 方法3: 使用共享文件夹
echo    复制到VMware/VirtualBox共享文件夹
echo.
echo 📋 在Linux上解压:
echo    tar -xzf %PACKAGE_NAME%
echo    cd AI-Web-Planner
echo    chmod +x deploy-linux.sh
echo    ./deploy-linux.sh
echo.
echo ================================
pause

