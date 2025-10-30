# AI Service Test Script
Write-Host "Testing AI Service..." -ForegroundColor Cyan
Write-Host ""

# Read configuration
$envFile = "frontend\.env.local"
if (Test-Path $envFile) {
    Write-Host "[OK] Found config file: $envFile" -ForegroundColor Green
    $content = Get-Content $envFile -Raw

    if ($content -match 'VITE_ALIYUN_LLM_API_KEY=(.+)') {
        $apiKey = $matches[1].Trim()
    }
    if ($content -match 'VITE_ALIYUN_LLM_ENDPOINT=(.+)') {
        $endpoint = $matches[1].Trim()
    }

    if ($apiKey -and $endpoint) {
        Write-Host "[OK] API Key: $($apiKey.Substring(0, 10))..." -ForegroundColor Green
        Write-Host "[OK] Endpoint: $endpoint" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Missing API Key or Endpoint in config" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[ERROR] Config file not found: $envFile" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Test 1: Check backend proxy service..." -ForegroundColor Yellow

try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get
    Write-Host "[OK] Backend status: $($healthResponse.status)" -ForegroundColor Green
    Write-Host "     Message: $($healthResponse.message)" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Backend service not running" -ForegroundColor Red
    Write-Host "        Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Test 2: Test AI chat function..." -ForegroundColor Yellow

# Build request body
$requestBody = @{
    prompt = "Hello, please briefly introduce Beijing tourist attractions in less than 100 words."
    systemPrompt = "You are a professional travel planning assistant."
    apiKey = $apiKey
    endpoint = $endpoint
} | ConvertTo-Json -Depth 10

Write-Host "     Sending test request..." -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/llm-proxy" `
        -Method Post `
        -ContentType "application/json; charset=utf-8" `
        -Body $requestBody `
        -TimeoutSec 60

    Write-Host "[OK] AI service responded successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "AI Response:" -ForegroundColor Cyan

    # Parse response
    if ($response.output -and $response.output.choices) {
        $content = $response.output.choices[0].message.content
        Write-Host "     $content" -ForegroundColor White
    } elseif ($response.choices) {
        $content = $response.choices[0].message.content
        Write-Host "     $content" -ForegroundColor White
    } else {
        Write-Host "     Response format: $($response | ConvertTo-Json -Depth 5)" -ForegroundColor Gray
    }

    Write-Host ""
    Write-Host "[OK] AI service test passed!" -ForegroundColor Green

} catch {
    Write-Host "[ERROR] AI service call failed" -ForegroundColor Red
    Write-Host "        Error: $($_.Exception.Message)" -ForegroundColor Red

    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "        Response: $responseBody" -ForegroundColor Red
    }

    exit 1
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "AI Service Test Completed!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test Summary:" -ForegroundColor Cyan
Write-Host "  [OK] Backend proxy service: Normal" -ForegroundColor Green
Write-Host "  [OK] AI chat function: Normal" -ForegroundColor Green
Write-Host "  [OK] API configuration: Correct" -ForegroundColor Green
Write-Host ""
Write-Host "Tip: Visit http://localhost:5173/service-test for complete service testing" -ForegroundColor Yellow
Write-Host ""

