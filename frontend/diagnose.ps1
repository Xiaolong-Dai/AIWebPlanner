# AI Web Planner - 诊断脚本

Write-Host "🔍 AI Web Planner 诊断工具" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js 版本
Write-Host "📦 检查 Node.js 版本..." -ForegroundColor Yellow
$nodeVersion = node -v
Write-Host "   Node.js: $nodeVersion" -ForegroundColor Green

# 检查 npm 版本
$npmVersion = npm -v
Write-Host "   npm: $npmVersion" -ForegroundColor Green
Write-Host ""

# 检查关键文件是否存在
Write-Host "📁 检查关键文件..." -ForegroundColor Yellow

$files = @(
    "package.json",
    "src/types/index.ts",
    "src/store/authStore.ts",
    "src/services/auth.ts",
    "src/App.tsx",
    "src/main.tsx",
    ".env.local"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file (缺失)" -ForegroundColor Red
    }
}
Write-Host ""

# 检查 node_modules
Write-Host "📦 检查依赖..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✅ node_modules 存在" -ForegroundColor Green
    
    $packages = @("react", "react-dom", "antd", "zustand", "@supabase/supabase-js")
    foreach ($pkg in $packages) {
        if (Test-Path "node_modules/$pkg") {
            Write-Host "   ✅ $pkg" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $pkg (未安装)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   ❌ node_modules 不存在，请运行 'npm install'" -ForegroundColor Red
}
Write-Host ""

# 检查 .env.local 配置
Write-Host "⚙️  检查环境变量配置..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    
    if ($envContent -match "VITE_SUPABASE_URL=(.+)") {
        $url = $matches[1]
        if ($url -match "your_") {
            Write-Host "   ⚠️  Supabase URL 是占位符，需要配置" -ForegroundColor Yellow
        } else {
            Write-Host "   ✅ Supabase URL 已配置" -ForegroundColor Green
        }
    }
    
    if ($envContent -match "VITE_SUPABASE_ANON_KEY=(.+)") {
        $key = $matches[1]
        if ($key -match "your_") {
            Write-Host "   ⚠️  Supabase Key 是占位符，需要配置" -ForegroundColor Yellow
        } else {
            Write-Host "   ✅ Supabase Key 已配置" -ForegroundColor Green
        }
    }
} else {
    Write-Host "   ❌ .env.local 不存在" -ForegroundColor Red
    Write-Host "   💡 运行: cp .env.example .env.local" -ForegroundColor Cyan
}
Write-Host ""

# 检查 TypeScript 编译
Write-Host "🔨 检查 TypeScript 编译..." -ForegroundColor Yellow
$tscOutput = & npx tsc --noEmit 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ TypeScript 编译通过" -ForegroundColor Green
} else {
    Write-Host "   ❌ TypeScript 编译错误:" -ForegroundColor Red
    Write-Host $tscOutput -ForegroundColor Red
}
Write-Host ""

# 检查缓存
Write-Host "🗑️  检查缓存..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") {
    Write-Host "   ⚠️  Vite 缓存存在 (如有问题可删除)" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ Vite 缓存已清除" -ForegroundColor Green
}
Write-Host ""

# 总结
Write-Host "================================" -ForegroundColor Cyan
Write-Host "📊 诊断完成！" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 常见问题解决方案:" -ForegroundColor Yellow
Write-Host "   1. 如果看到空白页面，请配置 .env.local 中的 Supabase" -ForegroundColor White
Write-Host "   2. 如果有模块错误，运行: npm install" -ForegroundColor White
Write-Host "   3. 如果有缓存问题，运行: .\fix-cache.ps1" -ForegroundColor White
Write-Host "   4. 查看详细故障排除: docs\TROUBLESHOOTING.md" -ForegroundColor White
Write-Host ""

