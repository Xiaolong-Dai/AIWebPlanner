# 修复 404 错误和 API 端点问题

## 🐛 问题诊断

根据控制台日志,发现了以下问题:

### 1. 代理工作正常 ✅
- 前端请求 `/api/llm-proxy` 成功到达后端
- Vite 代理配置正确

### 2. 阿里云 API 端点错误 ❌
**后端日志显示**:
```
[2025-10-30T01:53:09.349Z] 代理请求到阿里云百炼: https://bailian.aliyun.com/v1/api/completions
[2025-10-30T01:53:09.584Z] 阿里云API错误: { status: 404, statusText: 'Not Found', error: {} }
```

**正确的端点应该是**:
```
https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
```

### 3. 根本原因
- `apiConfigStore` 使用了 `persist` 中间件
- 配置被保存在 `localStorage` 中
- 即使 `.env.local` 文件是正确的,也会使用 localStorage 中的旧值
- 需要清除 localStorage 并重新加载配置

---

## 🔧 解决方案

### 方法 1: 清除 localStorage (推荐)

**步骤**:
1. 打开浏览器控制台 (F12 → Console)
2. 复制并运行以下脚本:

```javascript
// 清除 API 配置
localStorage.removeItem('ai-web-planner-api-config');
console.log('✅ 已清除 API 配置');
console.log('📌 请刷新页面 (Ctrl + Shift + R)');
```

3. 刷新页面: `Ctrl + Shift + R`
4. 重新测试

---

### 方法 2: 手动更新配置

**步骤**:
1. 打开浏览器控制台 (F12 → Console)
2. 复制并运行以下脚本:

```javascript
// 读取当前配置
const currentConfig = JSON.parse(localStorage.getItem('ai-web-planner-api-config') || '{}');
console.log('当前配置:', currentConfig);

// 更新端点
if (currentConfig.state && currentConfig.state.config) {
  currentConfig.state.config.llm_endpoint = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
  localStorage.setItem('ai-web-planner-api-config', JSON.stringify(currentConfig));
  console.log('✅ 已更新端点配置');
  console.log('📌 请刷新页面 (Ctrl + Shift + R)');
} else {
  console.log('❌ 配置结构不正确,请使用方法 1 清除配置');
}
```

3. 刷新页面: `Ctrl + Shift + R`
4. 重新测试

---

### 方法 3: 通过设置页面更新

**步骤**:
1. 访问 `http://localhost:5173/settings`
2. 找到 "AI 大语言模型" 配置
3. 更新 "API Endpoint" 为:
   ```
   https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
   ```
4. 点击 "保存配置"
5. 返回创建计划页面重新测试

---

## 🧪 验证修复

### 步骤 1: 检查配置

在控制台运行:
```javascript
const config = JSON.parse(localStorage.getItem('ai-web-planner-api-config') || '{}');
console.log('LLM Endpoint:', config.state?.config?.llm_endpoint);
console.log('LLM API Key:', config.state?.config?.llm_api_key ? '已配置' : '未配置');
```

**预期输出**:
```
LLM Endpoint: https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
LLM API Key: 已配置
```

### 步骤 2: 测试 AI 对话

1. 刷新页面 (`Ctrl + Shift + R`)
2. 进入 "创建计划" 页面
3. 在对话框输入: **"介绍一下北京"**
4. 点击发送

**预期结果**:
- ✅ AI 正常返回
- ✅ 控制台显示成功日志
- ✅ 后端日志显示正确的端点

**控制台应该显示**:
```
使用代理调用阿里云百炼API
调用AI服务: {endpoint: '/api/llm-proxy', isAliyun: true, useProxy: true}
AI响应成功，内容长度: xxxx
```

**后端终端应该显示**:
```
[时间戳] 代理请求到阿里云百炼: https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
[时间戳] 阿里云API响应成功 {hasOutput: true, hasChoices: true, messageLength: xxxx}
```

---

## 🔍 详细诊断脚本

如果问题仍然存在,运行以下完整诊断脚本:

```javascript
console.log('🔍 开始诊断...\n');

// 1. 检查 localStorage
console.log('1️⃣ 检查 localStorage:');
const config = JSON.parse(localStorage.getItem('ai-web-planner-api-config') || '{}');
console.log('  完整配置:', config);
console.log('  LLM Endpoint:', config.state?.config?.llm_endpoint);
console.log('  LLM API Key:', config.state?.config?.llm_api_key ? '已配置 ✅' : '未配置 ❌');

// 2. 检查环境变量
console.log('\n2️⃣ 检查环境变量:');
console.log('  import.meta.env 在运行时不可访问');
console.log('  需要在代码中添加 console.log 来查看');

// 3. 检查后端连接
console.log('\n3️⃣ 检查后端连接:');
fetch('http://localhost:3001/health')
  .then(res => res.json())
  .then(data => {
    console.log('  后端健康检查:', data);
    console.log('  后端状态: ✅ 正常');
  })
  .catch(err => {
    console.log('  后端状态: ❌ 无法连接');
    console.log('  错误:', err.message);
  });

// 4. 检查代理
console.log('\n4️⃣ 检查 Vite 代理:');
fetch('/api/health')
  .then(res => res.json())
  .then(data => {
    console.log('  代理测试:', data);
    if (data.error === 'Not Found') {
      console.log('  代理状态: ✅ 工作正常 (404 是预期的,因为 /api/health 不存在)');
    }
  })
  .catch(err => {
    console.log('  代理状态: ❌ 无法工作');
    console.log('  错误:', err.message);
  });

console.log('\n✅ 诊断完成!');
```

---

## 📝 常见问题

### Q1: 清除 localStorage 后仍然报错?

**可能原因**:
- 浏览器缓存未清除
- 环境变量未正确加载

**解决方法**:
1. 硬刷新: `Ctrl + Shift + R`
2. 清除浏览器缓存
3. 重启 Vite 开发服务器

### Q2: 后端日志仍显示错误的端点?

**可能原因**:
- localStorage 未清除
- 配置未正确更新

**解决方法**:
1. 再次运行清除脚本
2. 检查 localStorage 内容
3. 手动更新配置

### Q3: API Key 无效?

**可能原因**:
- API Key 过期
- API Key 配额用完
- API Key 权限不足

**解决方法**:
1. 检查阿里云控制台
2. 验证 API Key 是否有效
3. 检查配额使用情况

---

## 🎯 快速修复命令

**一键清除并重新加载**:
```javascript
localStorage.removeItem('ai-web-planner-api-config');
location.reload();
```

**一键更新端点**:
```javascript
const config = JSON.parse(localStorage.getItem('ai-web-planner-api-config') || '{}');
if (config.state?.config) {
  config.state.config.llm_endpoint = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
  localStorage.setItem('ai-web-planner-api-config', JSON.stringify(config));
  location.reload();
}
```

---

**现在请按照方法 1 清除 localStorage,然后重新测试!** 🚀

