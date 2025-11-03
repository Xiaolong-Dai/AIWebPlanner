# ========================================
# AI Web Planner - 本地 Docker 构建脚本 (Windows PowerShell)
# ========================================
# 
# 功能：
# 1. 从 frontend/.env 读取环境变量
# 2. 构建 Docker 镜像（注入环境变量）
# 3. 运行 Docker 容器
#
# 使用方法：
# .\docker-build-local.ps1
#
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🐳 AI Web Planner - 本地 Docker 构建" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Docker 是否安装
Write-Host "📋 检查 Docker..." -ForegroundColor Yellow
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker 未安装，请先安装 Docker Desktop" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker 已安装" -ForegroundColor Green
Write-Host ""

# 读取环境变量
Write-Host "📋 读取环境变量..." -ForegroundColor Yellow
$envFile = "frontend\.env"

if (-not (Test-Path $envFile)) {
    Write-Host "❌ 未找到 $envFile 文件" -ForegroundColor Red
    Write-Host "💡 请先创建 frontend\.env 文件并配置 API Keys" -ForegroundColor Yellow
    exit 1
}

# 解析 .env 文件
$envVars = @{}
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    # 跳过注释和空行
    if ($line -and -not $line.StartsWith('#')) {
        if ($line -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            $envVars[$key] = $value
        }
    }
}

# 显示读取到的配置
Write-Host "✅ 环境变量读取成功:" -ForegroundColor Green
$configStatus = @(
    @{Name="VITE_SUPABASE_URL"; Value=$envVars['VITE_SUPABASE_URL']},
    @{Name="VITE_SUPABASE_ANON_KEY"; Value=$envVars['VITE_SUPABASE_ANON_KEY']},
    @{Name="VITE_AMAP_KEY"; Value=$envVars['VITE_AMAP_KEY']},
    @{Name="VITE_ALIYUN_LLM_API_KEY"; Value=$envVars['VITE_ALIYUN_LLM_API_KEY']},
    @{Name="VITE_XFEI_APP_ID"; Value=$envVars['VITE_XFEI_APP_ID']}
)

foreach ($config in $configStatus) {
    $status = if ($config.Value) { "已配置 ✅" } else { "未配置 ❌" }
    $color = if ($config.Value) { "Green" } else { "Red" }
    Write-Host "  $($config.Name): $status" -ForegroundColor $color
}
Write-Host ""

# 构建 Docker 镜像
Write-Host "🔨 构建 Docker 镜像..." -ForegroundColor Yellow
Write-Host "💡 这可能需要几分钟时间..." -ForegroundColor Cyan
Write-Host ""

$buildArgs = @(
    "--build-arg", "VITE_SUPABASE_URL=$($envVars['VITE_SUPABASE_URL'])",
    "--build-arg", "VITE_SUPABASE_ANON_KEY=$($envVars['VITE_SUPABASE_ANON_KEY'])",
    "--build-arg", "VITE_AMAP_KEY=$($envVars['VITE_AMAP_KEY'])",
    "--build-arg", "VITE_AMAP_SECRET=$($envVars['VITE_AMAP_SECRET'])",
    "--build-arg", "VITE_ALIYUN_LLM_API_KEY=$($envVars['VITE_ALIYUN_LLM_API_KEY'])",
    "--build-arg", "VITE_ALIYUN_LLM_ENDPOINT=$($envVars['VITE_ALIYUN_LLM_ENDPOINT'])",
    "--build-arg", "VITE_XFEI_APP_ID=$($envVars['VITE_XFEI_APP_ID'])",
    "--build-arg", "VITE_XFEI_API_KEY=$($envVars['VITE_XFEI_API_KEY'])",
    "--build-arg", "VITE_XFEI_API_SECRET=$($envVars['VITE_XFEI_API_SECRET'])",
    "-t", "ai-web-planner-frontend:local",
    "-f", "frontend/Dockerfile",
    "frontend"
)

docker build @buildArgs

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Docker 镜像构建失败" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Docker 镜像构建成功！" -ForegroundColor Green
Write-Host ""

# 询问是否运行容器
Write-Host "========================================" -ForegroundColor Cyan
$run = Read-Host "是否立即运行容器？(Y/n)"
if ($run -eq '' -or $run -eq 'Y' -or $run -eq 'y') {
    Write-Host ""
    Write-Host "🚀 启动 Docker 容器..." -ForegroundColor Yellow
    
    # 停止并删除旧容器（如果存在）
    docker stop ai-web-planner-local 2>$null
    docker rm ai-web-planner-local 2>$null
    
    # 运行新容器
    docker run -d `
        --name ai-web-planner-local `
        -p 3000:80 `
        ai-web-planner-frontend:local
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ 容器启动成功！" -ForegroundColor Green
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "📱 访问应用:" -ForegroundColor Green
        Write-Host "   http://localhost:3000" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "🔍 查看日志:" -ForegroundColor Green
        Write-Host "   docker logs -f ai-web-planner-local" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "🛑 停止容器:" -ForegroundColor Green
        Write-Host "   docker stop ai-web-planner-local" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        
        # 等待 2 秒后自动打开浏览器
        Write-Host "⏳ 2 秒后自动打开浏览器..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        Start-Process "http://localhost:3000"
    } else {
        Write-Host ""
        Write-Host "❌ 容器启动失败" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host ""
    Write-Host "💡 手动运行容器:" -ForegroundColor Yellow
    Write-Host "   docker run -d --name ai-web-planner-local -p 3000:80 ai-web-planner-frontend:local" -ForegroundColor Cyan
    Write-Host ""
}

