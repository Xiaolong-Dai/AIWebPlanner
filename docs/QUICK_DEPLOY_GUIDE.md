# ⚡ 快速部署指南 - 5分钟上线

> 最快速的部署方式，适合快速演示和测试

---

## 🎯 目标

在 5 分钟内将 AI Web Planner 部署到 Vercel，并可以通过公网访问。

---

## 📋 前置要求

- ✅ GitHub 账号
- ✅ Vercel 账号 (可以用 GitHub 登录)
- ✅ Supabase 账号 (免费)
- ✅ 高德地图 Key (免费)
- ✅ 阿里云百炼 API Key (有免费额度)

---

## 🚀 部署步骤

### 步骤 1: 准备 API 密钥 (2分钟)

#### 1.1 Supabase (必需)

```
1. 访问: https://supabase.com
2. 点击 "Start your project" → "New Project"
3. 填写:
   - Name: ai-web-planner
   - Database Password: 设置密码
   - Region: Northeast Asia (Tokyo)
4. 等待创建完成 (约1分钟)
5. 进入项目 → Settings → API
6. 复制:
   - Project URL → 保存为 VITE_SUPABASE_URL
   - anon public → 保存为 VITE_SUPABASE_ANON_KEY
```

#### 1.2 初始化数据库

```
1. 在 Supabase 项目中，点击 SQL Editor
2. 点击 "New Query"
3. 复制粘贴以下 SQL:
```

```sql
-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建旅行计划表
CREATE TABLE IF NOT EXISTS travel_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  destination TEXT,
  start_date DATE,
  end_date DATE,
  budget DECIMAL(10, 2),
  status TEXT DEFAULT 'draft',
  plan_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建费用记录表
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES travel_plans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_travel_plans_user_id ON travel_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_plan_id ON expenses(plan_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
```

```
4. 点击 "Run" 执行
5. 确认显示 "Success. No rows returned"
```

#### 1.3 高德地图 (必需)

```
1. 访问: https://lbs.amap.com
2. 注册/登录
3. 控制台 → 应用管理 → 我的应用
4. 点击 "创建新应用"
5. 应用名称: AI Web Planner
6. 点击 "添加" → 添加 Key
7. Key 名称: Web端
8. 服务平台: Web端(JS API)
9. 复制 Key → 保存为 VITE_AMAP_KEY
```

#### 1.4 阿里云百炼 (推荐)

```
1. 访问: https://bailian.console.aliyun.com
2. 开通服务 (有免费额度)
3. API-KEY 管理 → 创建新 Key
4. 复制 API Key → 保存为 VITE_ALIYUN_LLM_API_KEY
5. 端点地址: https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
   保存为 VITE_ALIYUN_LLM_ENDPOINT
```

---

### 步骤 2: 部署到 Vercel (3分钟)

#### 2.1 Fork 或推送代码到 GitHub

**如果你已有代码**:
```bash
git add .
git commit -m "准备部署"
git push origin main
```

**如果你要 Fork 项目**:
1. 访问项目 GitHub 页面
2. 点击右上角 "Fork"
3. 等待 Fork 完成

#### 2.2 连接 Vercel

```
1. 访问: https://vercel.com
2. 点击 "Sign Up" → "Continue with GitHub"
3. 授权 Vercel 访问 GitHub
4. 点击 "Add New" → "Project"
5. 找到你的仓库 (AIWebPlanner)
6. 点击 "Import"
```

#### 2.3 配置项目

**Framework Preset**: Vite (自动检测)

**Build Settings**:
```
Build Command: cd frontend && npm install && npm run build
Output Directory: frontend/dist
Install Command: npm install
```

**Environment Variables** (点击 "Add" 添加):

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | 你的 Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | 你的 Supabase Key |
| `VITE_AMAP_KEY` | 你的高德地图 Key |
| `VITE_ALIYUN_LLM_API_KEY` | 你的阿里云 API Key |
| `VITE_ALIYUN_LLM_ENDPOINT` | `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions` |

**重要**: 每个环境变量都要勾选 **Production**, **Preview**, **Development**

#### 2.4 开始部署

```
1. 点击 "Deploy"
2. 等待构建完成 (约 2-3 分钟)
3. 看到 "Congratulations!" 表示成功
4. 点击 "Visit" 访问你的应用
```

---

## ✅ 验证部署

### 1. 访问应用

访问 Vercel 提供的 URL: `https://你的项目名.vercel.app`

### 2. 测试功能

1. **注册账号**
   - 点击 "注册"
   - 填写邮箱和密码
   - 点击 "注册"

2. **创建行程**
   - 点击 "创建行程"
   - 输入: "我想去日本东京，5天，预算1万元"
   - 点击 "生成行程"
   - 等待 AI 生成

3. **查看地图**
   - 行程应该显示在地图上
   - 可以点击标记查看详情

4. **测试预算**
   - 进入 "预算管理"
   - 添加一笔费用
   - 查看统计图表

---

## 🎉 完成！

恭喜！你的 AI Web Planner 已经成功部署！

### 你的应用地址

```
https://你的项目名.vercel.app
```

### 分享给朋友

你可以将这个链接分享给任何人，他们都可以访问和使用！

---

## 🔧 后续配置 (可选)

### 1. 自定义域名

```
1. 在 Vercel 项目中，进入 Settings → Domains
2. 输入你的域名
3. 按照提示配置 DNS
4. 等待生效 (5-30分钟)
```

### 2. 添加科大讯飞语音识别

```
1. 访问: https://www.xfyun.cn
2. 创建应用
3. 开通语音听写服务
4. 获取 APPID, APIKey, APISecret
5. 在 Vercel 项目 Settings → Environment Variables 添加:
   - VITE_XFEI_APP_ID
   - VITE_XFEI_API_KEY
   - VITE_XFEI_API_SECRET
6. 重新部署 (Deployments → 最新部署 → Redeploy)
```

### 3. 配置其他 AI 服务

支持的 AI 服务:
- ✅ 阿里云百炼 (已配置)
- ✅ OpenAI GPT
- ✅ 百度文心一言
- ✅ 腾讯混元

在应用的 "设置" 页面可以配置多个 AI 服务。

---

## ❓ 常见问题

### Q1: 部署失败怎么办？

**A**: 检查以下几点:
1. `vercel.json` 文件是否存在
2. Build Command 是否正确
3. 环境变量是否都已添加
4. GitHub 代码是否最新

### Q2: 应用打不开怎么办？

**A**: 
1. 检查 Vercel 部署状态是否为 "Ready"
2. 查看 Vercel 的 Logs 是否有错误
3. 确认环境变量配置正确

### Q3: AI 生成失败怎么办？

**A**:
1. 检查阿里云 API Key 是否正确
2. 确认阿里云账户有可用额度
3. 查看浏览器控制台错误信息

### Q4: 地图不显示怎么办？

**A**:
1. 检查高德地图 Key 是否正确
2. 确认 Key 的服务平台是 "Web端(JS API)"
3. 检查浏览器控制台是否有错误

### Q5: 数据库连接失败怎么办？

**A**:
1. 检查 Supabase URL 和 Key 是否正确
2. 确认 Supabase 项目状态正常
3. 确认数据表已创建

---

## 📚 更多文档

- **完整部署指南**: `docs/COMPLETE_DEPLOYMENT_GUIDE.md`
- **部署检查清单**: `docs/DEPLOYMENT_CHECKLIST_2025.md`
- **用户手册**: `docs/USER_MANUAL.md`
- **故障排除**: `docs/TROUBLESHOOTING.md`

---

## 🆘 获取帮助

遇到问题？

1. 查看 `docs/TROUBLESHOOTING.md`
2. 查看 GitHub Issues
3. 查看 Vercel 文档: https://vercel.com/docs

---

**祝你部署顺利！** 🚀

---

## 📊 部署时间统计

- ⏱️ 准备 API 密钥: 2 分钟
- ⏱️ 配置 Vercel: 1 分钟
- ⏱️ 等待构建: 2 分钟
- ⏱️ **总计**: 约 5 分钟

---

**下一步**: 开始使用你的 AI 旅行规划助手！✈️

