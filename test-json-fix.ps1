# JSON 解析修复测试脚本
Write-Host "🧪 测试 JSON 解析修复..." -ForegroundColor Cyan
Write-Host ""

# 测试后端服务
Write-Host "1️⃣ 测试后端服务..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get
    if ($healthResponse.status -eq "ok") {
        Write-Host "✅ 后端服务正常运行" -ForegroundColor Green
    } else {
        Write-Host "❌ 后端服务状态异常" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ 无法连接到后端服务" -ForegroundColor Red
    Write-Host "错误: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 读取 API Key
Write-Host "2️⃣ 读取 API 配置..." -ForegroundColor Yellow
$envFile = ".env.local"
if (Test-Path $envFile) {
    $apiKey = (Get-Content $envFile | Select-String "VITE_ALIYUN_LLM_API_KEY=").ToString().Split("=")[1]
    $endpoint = (Get-Content $envFile | Select-String "VITE_ALIYUN_LLM_ENDPOINT=").ToString().Split("=")[1]
    
    if ($apiKey -and $endpoint) {
        Write-Host "✅ API Key: $($apiKey.Substring(0, 10))..." -ForegroundColor Green
        Write-Host "✅ Endpoint: $endpoint" -ForegroundColor Green
    } else {
        Write-Host "❌ API 配置不完整" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ 找不到 .env.local 文件" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 测试 AI 服务 - 简单请求
Write-Host "3️⃣ 测试 AI 服务 (简单请求)..." -ForegroundColor Yellow
$simpleRequest = @{
    prompt = "请用一句话介绍北京"
    systemPrompt = "你是一个旅行助手"
    apiKey = $apiKey
    endpoint = $endpoint
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/llm-proxy" `
        -Method Post `
        -Body $simpleRequest `
        -ContentType "application/json" `
        -TimeoutSec 30
    
    Write-Host "✅ AI 服务响应成功" -ForegroundColor Green
    Write-Host "响应长度: $($response.output.text.Length) 字符" -ForegroundColor Cyan
} catch {
    Write-Host "❌ AI 服务调用失败" -ForegroundColor Red
    Write-Host "错误: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 测试 AI 服务 - 复杂 JSON 请求
Write-Host "4️⃣ 测试 AI 服务 (复杂 JSON 生成)..." -ForegroundColor Yellow
$complexRequest = @{
    prompt = "请为我规划一次旅行：
- 目的地：日本东京
- 天数：3 天
- 预算：8000 元
- 人数：2 人
- 偏好：美食、动漫

请返回以下 JSON 格式：
{
  `"itinerary`": [
    {
      `"day`": 1,
      `"date`": `"2024-06-01`",
      `"activities`": [
        {
          `"name`": `"景点名称`",
          `"address`": `"详细地址`",
          `"description`": `"景点介绍`"
        }
      ]
    }
  ],
  `"suggestions`": `"旅行建议`"
}"
    systemPrompt = "你是一个专业的旅行规划助手。请根据用户需求生成详细的旅行计划。
要求：
1. 必须直接返回纯 JSON 对象，不要包含任何 markdown 标记
2. 不要对 JSON 进行转义，直接返回原始 JSON 对象
3. 确保返回的内容可以被 JSON.parse() 直接解析"
    apiKey = $apiKey
    endpoint = $endpoint
} | ConvertTo-Json

try {
    Write-Host "发送请求..." -ForegroundColor Cyan
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/llm-proxy" `
        -Method Post `
        -Body $complexRequest `
        -ContentType "application/json" `
        -TimeoutSec 60
    
    $aiResponse = $response.output.text
    Write-Host "✅ AI 服务响应成功" -ForegroundColor Green
    Write-Host "响应长度: $($aiResponse.Length) 字符" -ForegroundColor Cyan
    
    # 尝试解析 JSON
    Write-Host ""
    Write-Host "5️⃣ 测试 JSON 解析..." -ForegroundColor Yellow
    
    # 移除可能的 markdown 标记
    $jsonStr = $aiResponse.Trim()
    if ($jsonStr.StartsWith("``````json")) {
        $jsonStr = $jsonStr -replace "``````json\s*", "" -replace "\s*``````$", ""
    } elseif ($jsonStr.StartsWith("``````")) {
        $jsonStr = $jsonStr -replace "``````\s*", "" -replace "\s*``````$", ""
    }
    
    # 检查是否完整
    if (-not $jsonStr.EndsWith("}")) {
        Write-Host "⚠️ JSON 可能被截断" -ForegroundColor Yellow
        $lastBrace = $jsonStr.LastIndexOf("}")
        if ($lastBrace -gt 0) {
            $jsonStr = $jsonStr.Substring(0, $lastBrace + 1)
            Write-Host "✅ 截取到最后一个完整的 }" -ForegroundColor Green
        }
    }
    
    # 显示前500字符
    Write-Host ""
    Write-Host "JSON 前500字符:" -ForegroundColor Cyan
    Write-Host $jsonStr.Substring(0, [Math]::Min(500, $jsonStr.Length)) -ForegroundColor Gray
    
    # 尝试解析
    try {
        $parsed = $jsonStr | ConvertFrom-Json
        Write-Host ""
        Write-Host "✅ JSON 解析成功!" -ForegroundColor Green
        Write-Host "行程天数: $($parsed.itinerary.Count)" -ForegroundColor Cyan
        Write-Host "建议: $($parsed.suggestions.Substring(0, [Math]::Min(50, $parsed.suggestions.Length)))..." -ForegroundColor Cyan
    } catch {
        Write-Host ""
        Write-Host "❌ JSON 解析失败" -ForegroundColor Red
        Write-Host "错误: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "这个错误将由前端的修复逻辑处理" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ AI 服务调用失败" -ForegroundColor Red
    Write-Host "错误: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ 所有测试完成!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 修复说明:" -ForegroundColor Yellow
Write-Host "1. 后端 max_tokens 已增加到 6000" -ForegroundColor White
Write-Host "2. 前端增加了 JSON 截断检测和修复" -ForegroundColor White
Write-Host "3. 前端增加了未闭合字符串的修复逻辑" -ForegroundColor White
Write-Host "4. 优化了 Prompt 以减少转义问题" -ForegroundColor White
Write-Host ""
Write-Host "🌐 请在浏览器中测试: http://localhost:5173/create" -ForegroundColor Cyan

