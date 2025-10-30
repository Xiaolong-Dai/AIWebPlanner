# 🚀 快速修复指南

根据你的错误日志，需要完成以下2个步骤才能正常使用应用：

---

## ✅ 第一步: 初始化数据库（必须）

### 问题
```
Failed to load resource: the server responded with a status of 404
supabase.co/rest/v1/travel_plans
```

### 解决方案

1. **打开Supabase Dashboard**
   - 访问: https://supabase.com/dashboard
   - 登录并选择你的项目

2. **进入SQL Editor**
   - 点击左侧菜单 **"SQL Editor"**
   - 点击 **"New query"**

3. **执行数据库脚本**
   - 打开项目文件: `docs/database_setup.sql`
   - **复制全部内容**（246行）
   - **粘贴到SQL Editor**
   - 点击 **"Run"** 或按 **Ctrl+Enter**

4. **验证创建成功**
   - 点击左侧 **"Table Editor"**
   - 应该看到:
     - ✅ `travel_plans` 表
     - ✅ `expenses` 表

5. **刷新应用**
   - 回到应用页面
   - 按 **F5** 刷新
   - 404错误应该消失了

---

## ✅ 第二步: 配置AI服务（必须）

### 问题
```
Access to XMLHttpRequest at 'https://bailian.aliyun.com/v1/api/completions' 
has been blocked by CORS policy
```

### 原因
阿里云百炼API **不支持浏览器直接调用**（CORS限制）

### 解决方案（3选1）

---

### 🌟 方案A: 使用OpenAI（推荐 - 最简单）

#### 1. 获取OpenAI API Key

- 访问: https://platform.openai.com/api-keys
- 注册/登录
- 点击 **"Create new secret key"**
- 复制API Key（格式: `sk-xxxxxxxxxxxxxxxx`）

#### 2. 在应用中配置

1. 打开应用的 **设置页面**
2. 找到 **"AI 服务配置"**
3. 填写:
   ```
   AI 服务类型: OpenAI
   API Key: sk-xxxxxxxxxxxxxxxx (你的Key)
   API Endpoint: https://api.openai.com/v1/chat/completions
   ```
4. 点击 **"保存配置"**
5. 点击 **"测试 AI 服务"**
6. 看到 ✅ 成功提示

#### 3. 测试

- 进入 **创建计划** 页面
- 输入: "我想去日本，5天，预算1万元"
- 点击发送
- 应该能正常生成行程了！

**费用说明:**
- 新用户有 $5 免费额度
- GPT-3.5-turbo: $0.002/1K tokens
- 生成一次行程约 $0.01-0.05

---

### 🌟 方案B: 使用百度文心一言（免费）

#### 1. 获取API Key

- 访问: https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application
- 登录百度账号
- 创建应用
- 获取 **API Key** 和 **Secret Key**

#### 2. 获取Access Token

百度需要先用API Key换取Access Token:

```bash
curl -X POST \
  'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=你的API_Key&client_secret=你的Secret_Key'
```

返回的 `access_token` 就是你要填的Key

#### 3. 在应用中配置

```
AI 服务类型: 百度文心一言
API Key: 你的access_token
API Endpoint: https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions
```

---

### 🌟 方案C: 继续使用阿里云（需要后端）

如果你一定要用阿里云百炼，需要搭建后端代理。

详细步骤见: `docs/CORS_FIX_GUIDE.md`

---

## 📋 完整操作清单

### 必须完成（否则无法使用）

- [ ] **步骤1:** 执行数据库脚本 `database_setup.sql`
- [ ] **步骤2:** 验证数据库表创建成功
- [ ] **步骤3:** 选择AI服务（OpenAI/百度/其他）
- [ ] **步骤4:** 获取对应的API Key
- [ ] **步骤5:** 在设置页面配置API Key
- [ ] **步骤6:** 测试AI服务连接
- [ ] **步骤7:** 刷新应用页面

### 验证成功

完成后，你应该能够:

- ✅ 登录后看到仪表盘（无404错误）
- ✅ 创建新的旅行计划
- ✅ AI能正常生成行程
- ✅ 保存计划到数据库
- ✅ 查看我的行程列表

---

## 🎯 推荐配置（最快）

如果你想最快开始使用，推荐这样配置:

### 1. 数据库（5分钟）
```
Supabase Dashboard → SQL Editor → 粘贴 database_setup.sql → Run
```

### 2. AI服务（5分钟）
```
OpenAI官网 → 注册 → 获取API Key → 应用设置页面 → 配置 → 测试
```

### 3. 开始使用（1分钟）
```
创建计划 → 输入需求 → AI生成 → 保存
```

**总耗时: 约10-15分钟**

---

## ❓ 遇到问题？

### 问题1: 数据库脚本执行失败

**可能原因:**
- RLS策略冲突
- 表已存在

**解决方案:**
```sql
-- 先删除旧表（如果存在）
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS travel_plans CASCADE;

-- 然后重新执行 database_setup.sql
```

### 问题2: OpenAI API Key无效

**检查:**
- Key是否完整复制（以`sk-`开头）
- Key是否已激活
- 账号是否有余额

### 问题3: 仍然有CORS错误

**检查:**
- 是否使用了OpenAI endpoint
- 是否保存了配置
- 是否刷新了页面

---

## 📞 需要帮助

如果按照上述步骤操作后仍有问题，请提供:

1. 你选择的AI服务
2. 数据库表是否创建成功
3. 控制台的完整错误信息
4. 设置页面的配置截图

我会帮你解决！😊

---

## 🎉 完成后

完成上述步骤后，你就可以:

1. ✅ 创建旅行计划
2. ✅ AI智能生成行程
3. ✅ 管理预算和费用
4. ✅ 查看地图可视化
5. ✅ 编辑和删除计划

享受你的AI旅行规划助手吧！🌍✈️

