/**
 * JSON 解析修复测试脚本
 * 
 * 使用方法:
 * 1. 打开浏览器控制台 (F12 → Console)
 * 2. 复制整个脚本
 * 3. 粘贴到控制台并回车
 * 4. 查看测试结果
 */

console.log('🧪 开始 JSON 解析修复测试...\n');

// 测试用例集合
const testCases = [
  {
    name: '测试 1: 简单 JSON (无换行符)',
    json: '{"suggestions": "这是一个简单的建议", "itinerary": []}',
    shouldFail: false,
  },
  {
    name: '测试 2: 包含单个换行符的 JSON',
    json: `{
  "suggestions": "旅行建议：
注意安全",
  "itinerary": []
}`,
    shouldFail: true, // 直接解析会失败
  },
  {
    name: '测试 3: 包含多个换行符的 JSON',
    json: `{
  "suggestions": "旅行建议：
1. 注意安全
2. 准备雨伞
3. 提前预订酒店",
  "itinerary": []
}`,
    shouldFail: true,
  },
  {
    name: '测试 4: 包含制表符的 JSON',
    json: `{
  "suggestions": "建议：\t第一项\t第二项",
  "itinerary": []
}`,
    shouldFail: true,
  },
  {
    name: '测试 5: 复杂嵌套结构',
    json: `{
  "itinerary": [
    {
      "day": 1,
      "activities": [
        {
          "name": "参观景点",
          "description": "详细介绍：
- 开放时间: 9:00-17:00
- 门票: 50元
- 注意事项: 提前预约"
        }
      ]
    }
  ],
  "suggestions": "总体建议：
1. 合理安排时间
2. 注意天气变化"
}`,
    shouldFail: true,
  },
];

// 修复函数 (与 llm.ts 中的逻辑一致)
function fixJsonString(jsonStr) {
  let fixedStr = jsonStr;

  // 1. 提取 JSON 对象
  const jsonMatch = fixedStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    fixedStr = jsonMatch[0];
  }

  // 2. 修复字符串中的换行符
  fixedStr = fixedStr.replace(
    /"((?:[^"\\]|\\.)*)"/g,
    (_match, content) => {
      const fixed = content
        .replace(/\r\n/g, '\\n')  // Windows 换行
        .replace(/\n/g, '\\n')    // Unix 换行
        .replace(/\r/g, '\\n')    // Mac 换行
        .replace(/\t/g, '\\t');   // 制表符
      return `"${fixed}"`;
    }
  );

  // 3. 移除控制字符
  fixedStr = fixedStr.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '');

  return fixedStr;
}

// 运行测试
let passedCount = 0;
let failedCount = 0;

testCases.forEach((testCase, index) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📝 ${testCase.name}`);
  console.log(`${'='.repeat(60)}`);

  // 尝试直接解析
  let directParseSuccess = false;
  try {
    const result = JSON.parse(testCase.json);
    directParseSuccess = true;
    console.log('✅ 直接解析成功');
    console.log('结果:', result);
  } catch (error) {
    console.log('❌ 直接解析失败:', error.message);
  }

  // 尝试修复后解析
  let fixedParseSuccess = false;
  try {
    const fixed = fixJsonString(testCase.json);
    const result = JSON.parse(fixed);
    fixedParseSuccess = true;
    console.log('✅ 修复后解析成功');
    console.log('结果:', result);
  } catch (error) {
    console.log('❌ 修复后仍失败:', error.message);
  }

  // 判断测试是否通过
  const testPassed = fixedParseSuccess;
  if (testPassed) {
    console.log(`\n🎉 测试通过!`);
    passedCount++;
  } else {
    console.log(`\n💥 测试失败!`);
    failedCount++;
  }

  // 显示原始 JSON (前 200 字符)
  console.log('\n原始 JSON (前 200 字符):');
  console.log(testCase.json.substring(0, 200));
});

// 总结
console.log(`\n${'='.repeat(60)}`);
console.log('📊 测试总结');
console.log(`${'='.repeat(60)}`);
console.log(`总测试数: ${testCases.length}`);
console.log(`✅ 通过: ${passedCount}`);
console.log(`❌ 失败: ${failedCount}`);
console.log(`通过率: ${((passedCount / testCases.length) * 100).toFixed(1)}%`);

if (failedCount === 0) {
  console.log('\n🎉🎉🎉 所有测试通过! JSON 解析修复成功! 🎉🎉🎉');
} else {
  console.log('\n⚠️ 部分测试失败,需要进一步检查修复逻辑');
}

console.log('\n✅ 测试完成!\n');

