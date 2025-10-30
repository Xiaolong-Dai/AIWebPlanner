# AI Web Planner - 清除缓存并重启开发服务器 (Windows PowerShell)

Write-Host "🧹 清除 Vite 缓存..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue

Write-Host "🧹 清除 TypeScript 缓存..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

Write-Host "✅ 缓存已清除！" -ForegroundColor Green
Write-Host "🔄 请运行 'npm run dev' 重启开发服务器" -ForegroundColor Cyan

