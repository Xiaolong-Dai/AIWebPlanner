# AI Web Planner - Docker Deployment Script
# Usage: .\docker-deploy.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI Web Planner - Docker Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "[1/4] Checking Docker..." -ForegroundColor Yellow
$docker = Get-Command docker -ErrorAction SilentlyContinue
if (-not $docker) {
    Write-Host "ERROR: Docker not installed" -ForegroundColor Red
    Write-Host "Install from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "Docker OK" -ForegroundColor Green

# Check Docker running
Write-Host ""
Write-Host "[2/4] Checking Docker status..." -ForegroundColor Yellow
docker info 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop first" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "Docker running" -ForegroundColor Green

# Stop containers
Write-Host ""
Write-Host "[3/4] Stopping old containers..." -ForegroundColor Yellow
docker-compose down 2>$null | Out-Null
Write-Host "Done" -ForegroundColor Green

# Build and start
Write-Host ""
Write-Host "[4/4] Building and starting..." -ForegroundColor Yellow
docker-compose up -d --build
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Deployment failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment Successful!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
