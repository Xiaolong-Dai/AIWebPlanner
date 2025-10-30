/**
 * 清除 localStorage 中的 API 配置
 * 
 * 使用方法:
 * 1. 打开浏览器控制台 (F12 → Console)
 * 2. 复制整个脚本
 * 3. 粘贴到控制台并回车
 * 4. 刷新页面 (Ctrl + Shift + R)
 */

console.log('🧹 开始清除 localStorage 配置...\n');

// 显示当前配置
console.log('📋 当前 localStorage 内容:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key) {
    const value = localStorage.getItem(key);
    console.log(`  ${key}:`, value);
  }
}

// 清除 API 配置
const apiConfigKey = 'ai-web-planner-api-config';
if (localStorage.getItem(apiConfigKey)) {
  console.log(`\n🗑️  删除 ${apiConfigKey}...`);
  localStorage.removeItem(apiConfigKey);
  console.log('✅ 已删除');
} else {
  console.log(`\n⚠️  未找到 ${apiConfigKey}`);
}

// 显示清除后的配置
console.log('\n📋 清除后的 localStorage 内容:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key) {
    const value = localStorage.getItem(key);
    console.log(`  ${key}:`, value);
  }
}

console.log('\n✅ 清除完成!');
console.log('📌 请刷新页面 (Ctrl + Shift + R) 以重新加载配置');
console.log('📌 新配置将从 .env.local 文件中读取\n');

