# Fix Docker Network Issues - Configure Registry Mirrors
# Usage: .\fix-docker-network.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Docker Network Issue Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will help you configure Docker registry mirrors" -ForegroundColor Yellow
Write-Host "to solve Docker Hub connection issues." -ForegroundColor Yellow
Write-Host ""

# Check if Docker is installed
$docker = Get-Command docker -ErrorAction SilentlyContinue
if (-not $docker) {
    Write-Host "ERROR: Docker is not installed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Step 1: Checking Docker configuration..." -ForegroundColor Cyan
Write-Host ""

# Get Docker config path
$dockerConfigPath = "$env:USERPROFILE\.docker\daemon.json"
Write-Host "Docker config file: $dockerConfigPath" -ForegroundColor Gray

# Backup existing config
if (Test-Path $dockerConfigPath) {
    $backupPath = "$dockerConfigPath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $dockerConfigPath $backupPath
    Write-Host "Existing config backed up to: $backupPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 2: Recommended registry mirrors:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. DaoCloud:  https://docker.m.daocloud.io" -ForegroundColor Yellow
Write-Host "2. 1Panel:    https://docker.1panel.live" -ForegroundColor Yellow
Write-Host "3. Rat Dev:   https://hub.rat.dev" -ForegroundColor Yellow
Write-Host "4. Tencent:   https://mirror.ccs.tencentyun.com" -ForegroundColor Yellow
Write-Host "5. NetEase:   https://hub-mirror.c.163.com" -ForegroundColor Yellow
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "IMPORTANT: Manual Configuration Required" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please follow these steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Right-click Docker Desktop icon in system tray" -ForegroundColor White
Write-Host "2. Select 'Settings'" -ForegroundColor White
Write-Host "3. Go to 'Docker Engine'" -ForegroundColor White
Write-Host "4. Add the following to the configuration:" -ForegroundColor White
Write-Host ""

$configExample = @'
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://docker.1panel.live",
    "https://hub.rat.dev"
  ]
}
'@

Write-Host $configExample -ForegroundColor Green
Write-Host ""
Write-Host "5. Click 'Apply & Restart'" -ForegroundColor White
Write-Host "6. Wait for Docker Desktop to restart (30-60 seconds)" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Alternative: Aliyun Mirror (Recommended)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you have an Aliyun account:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Visit: https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors" -ForegroundColor White
Write-Host "2. Login to get your exclusive mirror URL" -ForegroundColor White
Write-Host "3. Use that URL in the registry-mirrors configuration" -ForegroundColor White
Write-Host ""

Write-Host "Press Enter to open Docker Desktop settings..." -ForegroundColor Yellow
Read-Host

# Try to open Docker Desktop settings
try {
    Start-Process "docker://settings/docker-engine"
    Write-Host ""
    Write-Host "Docker Desktop settings should open now." -ForegroundColor Green
    Write-Host "If not, please open it manually." -ForegroundColor Yellow
} catch {
    Write-Host ""
    Write-Host "Could not open Docker Desktop automatically." -ForegroundColor Yellow
    Write-Host "Please open Docker Desktop settings manually." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "After Configuration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "After you've configured the registry mirrors:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Wait for Docker Desktop to restart" -ForegroundColor White
Write-Host "2. Verify configuration with: docker info" -ForegroundColor White
Write-Host "3. Run deployment script: .\docker-deploy.ps1" -ForegroundColor White
Write-Host ""

$verify = Read-Host "Have you configured the registry mirrors? (y/N)"
if ($verify -eq "y" -or $verify -eq "Y") {
    Write-Host ""
    Write-Host "Verifying configuration..." -ForegroundColor Yellow
    Write-Host ""
    
    docker info | Select-String "Registry Mirrors" -Context 0,5
    
    Write-Host ""
    Write-Host "If you see registry mirrors listed above, configuration is successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run: .\docker-deploy.ps1" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Please configure the registry mirrors first, then run this script again." -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to exit"

