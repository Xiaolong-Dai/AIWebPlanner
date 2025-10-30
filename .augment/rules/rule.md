---
type: "always_apply"
---

# AI Web Planner - 项目开发规则文档

## 一、项目概述

### 1.1 项目目标
开发一款智能旅行规划Web应用，通过AI理解用户需求，自动生成详细旅行路线和预算建议，并提供实时旅行辅助功能。

### 1.2 核心价值
- 简化旅行规划流程
- AI智能推荐个性化路线
- 实时预算管理和追踪
- 多设备云端同步

---

## 二、核心功能规范

### 2.1 智能行程规划模块

**功能要求：**
1. **多模态输入**（必须同时支持语音和文字）
   - 语音输入：集成语音识别API，支持中英文识别
   - 文字输入：提供文本框输入
   - 输入内容解析：目的地、日期范围、预算、同行人数、旅行偏好

2. **AI路线生成**
   - 输入示例："我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"
   - 输出内容：
     - 每日行程安排
     - 交通方案（航班、高铁、市内交通）
     - 住宿推荐（酒店名称、位置、价格）
     - 景点推荐（名称、地址、开放时间、门票）
     - 餐厅推荐（名称、位置、菜系、人均消费）
     - 购物指南（商场、特产推荐）

3. **交互要求**
   - 支持多次对话调整行程
   - 支持实时修改和优化建议
   - 展示推荐的合理性说明

### 2.2 费用预算与管理模块

**功能要求：**
1. **预算分析**
   - AI自动分解总预算到各个支出类别
   - 交通、住宿、餐饮、景点、购物等分类预算
   - 显示预算占比和建议

2. **费用记录**
   - 支持语音录入（推荐方式）
   - 支持手动输入
   - 费用分类和标记
   - 实时预算余额计算

3. **费用统计**
   - 可视化图表展示
   - 按类别统计支出
   - 预算执行情况分析

### 2.3 用户管理与数据存储模块

**功能要求：**
1. **用户认证**
   - 注册/登录功能
   - 支持邮箱、手机号注册
   - 密码安全存储

2. **数据管理**
   - 保存多份旅行计划
   - 计划命名和分类
   - 计划查看和编辑
   - 计划删除和归档

3. **云端同步**
   - 多设备数据同步
   - 离线数据缓存
   - 同步冲突处理

---

## 三、技术栈规范

### 3.1 前端技术选型

**框架：** React + TypeScript（推荐）或 Vue 3 + TypeScript

**UI组件库：** 
- Ant Design / Material-UI / Chakra UI（选择其一）
- 地图组件：React Map GL（Mapbox）或高德地图 JS API

**关键依赖：**
```json
{
  "语音识别": "@dtworkins/react-speech-recognition 或 @xfe-tech/speech-sdk",
  "地图组件": "react-map-gl / @amap/amap-react",
  "状态管理": "Redux Toolkit / Zustand",
  "HTTP客户端": "axios",
  "路由": "react-router-dom"
}
```

### 3.2 后端技术选型

**方案A - Serverless架构（推荐）：**
- 认证：Supabase Auth
- 数据库：Supabase PostgreSQ
- 函数服务：Vercel Functions

### 3.3 第三方服务集成

#### 3.3.1 语音识别服务
- **首选：** 科大讯飞语音识别API
- **备选：** 百度语音识别、Google Speech-to-Text、Azure Speech
- **要求：** 
  - 支持实时流式识别
  - 支持中英文混合识别
  - 提供Web SDK

#### 3.3.2 地图服务
- **首选：** 高德地图API
- **备选：** 百度地图API、Mapbox
- **功能：** 
  - 地理编码/逆地理编码
  - 路线规划
  - POI搜索
  - 地图可视化

#### 3.3.3 AI大语言模型
- **推荐选项：**
  1. 阿里云通义千问（百炼平台）
  2. OpenAI GPT-4/3.5
  3. 腾讯混元
  4. 百度文心一言
- **要求：**
  - 支持长文本上下文
  - 返回结构化JSON数据
  - 稳定性高，响应速度快

### 3.4 云服务选型

**数据库：**
- Supabase（PostgreSQL + 实时同步）

**存储：**
- 用户数据、行程记录、偏好设置
- 旅行计划、费用记录
- 图片缓存（景点图片）

---

## 四、安全规范

### 4.1 API Key 管理（至关重要）

**严禁事项：**
- ❌ 禁止将任何API Key硬编码在代码中
- ❌ 禁止将API Key提交到GitHub公开仓库
- ❌ 禁止在前端代码中存储敏感密钥

**正确做法：**

1. **环境变量管理**
   ```bash
   # .env.local (本地开发，不提交到Git)
   VITE_XFEI_APP_ID=your_app_id
   VITE_XFEI_API_KEY=your_api_key
   VITE_AMAP_KEY=your_amap_key
   VITE_LLM_API_KEY=your_llm_key
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_KEY=your_key
   ```

2. **配置页面**
   - 在应用设置页面提供API Key输入界面
   - 用户输入后保存在浏览器本地存储（localStorage）
   - 前端使用这些Key调用服务

3. **后端代理（如使用后端）**
   - API Key仅存储在后端环境变量
   - 前端通过后端接口调用第三方服务
   - 使用.env文件管理（不提交到Git）

4. **Docker部署**
   - 通过docker-compose.yml传递环境变量
   - 或使用Docker secrets
   - 或使用K8s ConfigMap

### 4.2 数据安全

- 用户密码使用bcrypt加密存储
- 敏感数据加密传输（HTTPS）
- 实现CSRF防护
- 实现XSS防护
- 实现SQL注入防护（使用ORM）

### 4.3 文件清单

**必须添加到.gitignore：**
```
.env
.env.local
.env.production
*.key
*.pem
config/secrets.js
docker-compose.override.yml
```

---

## 五、开发规范

### 5.1 项目结构

```
ai-web-planner/
├── frontend/
│   ├── src/
│   │   ├── components/      # 通用组件
│   │   ├── pages/           # 页面组件
│   │   ├── hooks/           # 自定义Hooks
│   │   ├── services/        # API调用
│   │   ├── utils/           # 工具函数
│   │   ├── types/           # TypeScript类型
│   │   ├── store/           # 状态管理
│   │   └── constants/       # 常量
│   ├── public/
│   ├── package.json
│   └── Dockerfile
│
├── backend/                 # 可选，如使用后端
│   ├── src/
│   ├── Dockerfile
│   └── package.json
│
├── docs/
│   ├── README.md           # 项目说明
│   ├── SETUP.md             # 安装运行指南
│   └── API.md              # API文档
│
├── docker-compose.yml       # Docker编排配置
├── .dockerignore
├── .gitignore
├── LICENSE
└── PROJECT_RULES.md        # 本文档
```

### 5.2 代码规范

**命名规范：**
- 组件文件：PascalCase（如：`TravelPlan.tsx`）
- 函数/变量：camelCase（如：`generateTripPlan`）
- 常量：UPPER_SNAKE_CASE（如：`MAX_BUDGET`）
- CSS类：kebab-case（如：`trip-card`）

**代码质量：**
- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- TypeScript严格模式（`strict: true`）
- 添加必要的注释和文档

### 5.3 Git提交规范

**提交信息格式：**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型（type）：**
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式化
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例：**
```
feat(语音): 集成科大讯飞语音识别功能

- 添加语音录制组件
- 实现实时语音转文字
- 添加语音输入UI界面

Closes #123
```

**分支管理：**
- `main`: 生产环境代码
- `develop`: 开发主分支
- `feature/*`: 功能开发分支
- `fix/*`: bug修复分支

---

## 六、UI/UX规范

### 6.1 设计原则

1. **地图为主**
   - 行程可视化在地图上
   - 行程点可点击查看详情
   - 支持路线高亮显示

2. **信息层级**
   - 清晰的行程展示（时间轴或卡片）
   - 重要信息突出显示
   - 辅助信息可收起

3. **视觉美观**
   - 现代化的界面设计
   - 美观的图片展示
   - 统一的配色方案

### 6.2 核心页面

1. **首页/登录页**
   - 简洁的欢迎界面
   - 登录/注册入口

2. **行程规划页**
   - 地图视图（主要）
   - 行程时间轴
   - AI对话界面
   - 语音输入按钮

3. **预算管理页**
   - 预算概览卡片
   - 费用录入界面
   - 统计图表

4. **我的行程页**
   - 行程列表
   - 新建/编辑/删除功能

5. **设置页**
   - API Key配置
   - 用户信息
   - 偏好设置

---

## 七、提交要求

### 7.1 代码提交

**GitHub仓库要求：**
1. 创建公开仓库（或授权助教访问）
2. 仓库名称：`AI-Web-Planner`
3. 详细的Git提交记录（按规范提交）
4. 至少包含以下分支提交：
   - 功能开发和迭代记录
   - Bug修复记录
   - 文档更新记录

### 7.2 文档要求

**README.md 必须包含：**
```markdown
# AI Web Planner

## 项目简介
[项目概述]

## 技术栈
[使用的技术]

## 功能特性
[核心功能说明]

## 快速开始
[安装运行步骤]

## Docker部署
[详细部署说明]

## API密钥配置
[如何配置各种API Key]

## 项目结构
[目录说明]

## 演示
[截图或视频]

## 许可证
MIT License
```

### 7.3 Docker镜像要求

**必须提供：**
1. `Dockerfile`（前端应用）
2. `docker-compose.yml`（如需要多容器）
3. `.dockerignore`
4. 阿里云镜像仓库地址或Docker Hub地址

**镜像标签示例：**
```bash
registry.cn-beijing.aliyuncs.com/your-namespace/ai-web-planner:latest
```

**运行命令：**
```bash
docker pull [镜像地址]
docker run -p 3000:3000 [镜像名称]
```

### 7.4 PDF文档要求

**包含内容：**
1. 封面：项目名称、作者、日期
2. 项目简介（一段话）
3. GitHub仓库链接（可点击）
4. README文档（完整内容）
5. 部署说明
6. 功能截图
7. API Key配置说明（如使用非助教提供的Key）

**注意事项：**
- PDF中添加的Key必须是3个月内有效
- 如使用助教的阿里云百炼Key，则无需提交Key

### 7.5 GitHub Actions CI/CD

**建议实现：**
1. 自动构建Docker镜像
2. 推送到阿里云镜像仓库
3. 自动化测试（如需要）

**配置文件：** `.github/workflows/build.yml`

---

## 八、开发里程碑

### 8.1 阶段一：项目搭建（第1周）
- [ ] 初始化项目（前端+后端）
- [ ] 配置开发环境
- [ ] 设计数据库结构
- [ ] 搭建基础UI框架

### 8.2 阶段二：核心功能开发（第2-3周）
- [ ] 用户认证功能
- [ ] 语音识别集成
- [ ] AI行程规划核心逻辑
- [ ] 地图展示功能
- [ ] 预算管理功能

### 8.3 阶段三：完善与优化（第4周）
- [ ] UI/UX优化
- [ ] 性能优化
- [ ] 数据同步功能
- [ ] 错误处理
- [ ] 单元测试

### 8.4 阶段四：部署与文档（第5周）
- [ ] Docker镜像构建
- [ ] 部署到生产环境
- [ ] 编写完整文档
- [ ] 准备演示材料

---

## 九、质量保证

### 9.1 代码审查
- 所有代码必须通过ESLint检查
- 重要功能需要Code Review
- 遵循SOLID原则

### 9.2 测试要求
- 核心功能需要单元测试
- 关键流程需要集成测试
- UI组件需要可视化测试

### 9.3 性能要求
- 页面加载时间 < 3秒
- 语音识别响应 < 1秒
- AI生成行程 < 10秒
- 地图渲染流畅（60fps）

### 9.4 兼容性要求
- 支持Chrome、Firefox、Safari、Edge（最新版本）
- 响应式设计（支持移动端）

---

## 十、参考资料

### 10.1 官方文档
- React: https://react.dev
- TypeScript: https://www.typescriptlang.org
- Supabase: https://supabase.com/docs
- 科大讯飞: https://www.xfyun.cn/doc
- 高德地图: https://lbs.amap.com

### 10.2 AI模型API
- 阿里云百炼: https://bailian.console.aliyun.com
- OpenAI: https://platform.openai.com/docs
- 通义千问: https://tongyi.aliyun.com

### 10.3 Docker部署
- Docker官方文档: https://docs.docker.com
- 阿里云容器镜像服务: https://cr.console.aliyun.com

---

## 附录：常见问题

### Q1: API Key如何管理最安全？
**A:** 推荐方案：
1. 前端应用提供配置页面，用户在本地输入Key并保存到localStorage
2. 使用后端代理所有API调用（Key存储在后端）
3. 使用环境变量（.env）管理

### Q2: 如何处理API调用限流？
**A:** 
- 实现请求重试机制
- 使用缓存减少API调用
- 合理使用请求队列

### Q3: 如何优化AI生成速度？
**A:**
- 使用流式响应（Streaming）
- 实现响应缓存
- 优化Prompt设计
- 使用SSE（Server-Sent Events）展示生成过程

---

**文档版本：** v1.0  
**最后更新：** 2024年12月  
**维护者：** 开发团队

