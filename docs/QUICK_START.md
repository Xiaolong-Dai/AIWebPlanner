# AI Web Planner - 快速启动指南

## 🚀 5 分钟快速上手

### 步骤 1: 克隆项目

```bash
git clone https://github.com/your-username/AI-Web-Planner.git
cd AI-Web-Planner/frontend
```

### 步骤 2: 安装依赖

```bash
npm install
```

### 步骤 3: 配置 Supabase（必需）

1. 访问 [supabase.com](https://supabase.com) 并创建账号
2. 创建新项目（等待 2 分钟初始化）
3. 进入项目设置 > API，复制：
   - Project URL
   - anon public key

4. 在 Supabase SQL Editor 中执行数据库初始化：
   - 复制 `docs/DATABASE_SCHEMA.md` 中的所有 SQL
   - 粘贴到 SQL Editor
   - 点击 Run

### 步骤 4: 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`，至少填入 Supabase 配置：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 步骤 5: 启动应用

```bash
npm run dev
```

访问 `http://localhost:5173`

### 步骤 6: 注册账号

1. 点击"注册"标签
2. 输入邮箱和密码（至少 6 位）
3. 点击注册
4. 查收邮箱验证邮件（可选）
5. 返回登录

---

## 🎯 可选配置

### 高德地图（用于地图展示）

1. 访问 [lbs.amap.com](https://lbs.amap.com)
2. 注册并创建应用
3. 获取 Web 服务 Key
4. 在应用的"设置"页面配置，或添加到 `.env.local`：

```env
VITE_AMAP_KEY=your-amap-key
```

### AI 大语言模型（用于智能规划）

1. 访问 [百炼平台](https://bailian.console.aliyun.com)
2. 开通服务并获取 API Key
3. 在应用的"设置"页面配置，或添加到 `.env.local`：

```env
VITE_ALIYUN_LLM_API_KEY=your-api-key
VITE_ALIYUN_LLM_ENDPOINT=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
```

### 科大讯飞语音（用于语音输入）

1. 访问 [xfyun.cn](https://www.xfyun.cn)
2. 创建语音听写应用
3. 获取 APPID、APIKey、APISecret
4. 在应用的"设置"页面配置

---

## 📱 使用应用

### 1. 登录后进入仪表盘

- 查看统计数据
- 浏览最近的旅行计划

### 2. 创建旅行计划（第二阶段功能）

- 点击"创建新计划"
- 输入目的地、日期、预算等信息
- AI 自动生成行程

### 3. 管理预算（第二阶段功能）

- 查看预算分配
- 记录费用
- 查看统计图表

### 4. 配置 API Keys

- 进入"设置"页面
- 在各个标签页输入 API Keys
- 点击"保存配置"

---

## 🐳 Docker 快速启动

如果您已安装 Docker：

```bash
# 1. 配置环境变量
cp .env.example .env

# 2. 编辑 .env 文件，填入配置

# 3. 启动
docker-compose up -d

# 4. 访问
# http://localhost:3000
```

---

## ❓ 常见问题

### 无法登录？
- 检查 Supabase 配置是否正确
- 确认数据库表已创建
- 查看浏览器控制台错误

### 环境变量不生效？
- 确保文件名是 `.env.local`
- 重启开发服务器
- 变量名必须以 `VITE_` 开头

### 端口被占用？
```bash
# 修改端口
npm run dev -- --port 3000
```

---

## 📚 更多文档

- [完整安装指南](./SETUP.md)
- [数据库设计](./DATABASE_SCHEMA.md)
- [项目状态](./PROJECT_STATUS.md)
- [主 README](../README.md)

---

## 🎉 开始使用

现在您已经成功启动了 AI Web Planner！

下一步：
1. 探索仪表盘
2. 配置 API Keys
3. 等待第二阶段功能上线（AI 规划、地图展示等）

祝您使用愉快！ 🚀

