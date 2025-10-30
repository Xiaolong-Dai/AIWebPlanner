# AI Web Planner - 部署清单

## 📋 部署前检查清单

### 1. 代码质量检查

- [x] TypeScript编译无错误
- [x] ESLint检查通过
- [x] 所有组件正常工作
- [x] 无console错误
- [x] 构建成功

### 2. 功能测试

- [ ] 用户注册和登录
- [ ] AI行程生成
- [ ] 地图显示
- [ ] 预算管理
- [ ] 数据保存和加载
- [ ] 所有页面路由正常

### 3. 性能检查

- [ ] 首屏加载时间 < 3秒
- [ ] 页面切换流畅
- [ ] 图表渲染正常
- [ ] 无内存泄漏

### 4. 兼容性测试

- [ ] Chrome浏览器
- [ ] Firefox浏览器
- [ ] Safari浏览器
- [ ] Edge浏览器
- [ ] 移动端响应式

### 5. 安全检查

- [ ] API密钥不在代码中
- [ ] 环境变量配置正确
- [ ] HTTPS配置
- [ ] CORS配置正确

---

## 🚀 部署步骤

### 方案一: Vercel部署(推荐)

#### 1. 准备工作

```bash
# 确保代码已提交到Git
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2. 在Vercel部署

1. 访问 https://vercel.com
2. 导入GitHub仓库
3. 配置项目:
   - Framework Preset: Vite
   - Root Directory: frontend
   - Build Command: `npm run build`
   - Output Directory: `dist`

#### 3. 配置环境变量(可选)

在Vercel项目设置中添加:
```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

#### 4. 部署

点击"Deploy"按钮,等待部署完成。

---

### 方案二: Docker部署

#### 1. 创建Dockerfile

在`frontend`目录创建`Dockerfile`:

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 2. 创建nginx配置

在`frontend`目录创建`nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 启用gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### 3. 构建Docker镜像

```bash
cd frontend
docker build -t ai-web-planner:latest .
```

#### 4. 运行容器

```bash
docker run -d -p 3000:80 --name ai-web-planner ai-web-planner:latest
```

访问: http://localhost:3000

#### 5. 推送到阿里云镜像仓库

```bash
# 登录阿里云镜像仓库
docker login --username=your_username registry.cn-beijing.aliyuncs.com

# 打标签
docker tag ai-web-planner:latest registry.cn-beijing.aliyuncs.com/your-namespace/ai-web-planner:latest

# 推送
docker push registry.cn-beijing.aliyuncs.com/your-namespace/ai-web-planner:latest
```

---

### 方案三: Netlify部署

#### 1. 准备netlify.toml

在项目根目录创建`netlify.toml`:

```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 2. 部署

1. 访问 https://netlify.com
2. 导入GitHub仓库
3. 自动检测配置
4. 点击Deploy

---

## 📝 部署后配置

### 1. Supabase配置

#### 创建数据库表

1. 登录Supabase控制台
2. 进入SQL Editor
3. 执行`docs/database_setup.sql`中的SQL脚本

#### 配置RLS策略

确保Row Level Security已启用:

```sql
-- 启用RLS
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 创建策略(已在database_setup.sql中)
```

### 2. API密钥配置

用户首次访问时需要在设置页面配置:

**必需:**
- Supabase URL
- Supabase Anon Key
- 阿里云通义千问 API Key

**可选:**
- 高德地图 API Key
- 科大讯飞 App ID/API Key

### 3. 域名配置(可选)

#### Vercel
1. 在项目设置中添加自定义域名
2. 配置DNS记录

#### Netlify
1. 在Domain settings中添加域名
2. 配置DNS记录

---

## 🔍 部署验证

### 1. 功能验证

访问部署的URL,测试以下功能:

- [ ] 页面正常加载
- [ ] 可以注册/登录
- [ ] 可以配置API密钥
- [ ] 可以创建旅行计划
- [ ] 可以查看和编辑计划
- [ ] 可以管理预算
- [ ] 地图正常显示

### 2. 性能验证

使用Chrome DevTools:

- [ ] Lighthouse分数 > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] 无JavaScript错误

### 3. 移动端验证

- [ ] 响应式布局正常
- [ ] 触摸操作流畅
- [ ] 字体大小合适

---

## 🐛 常见问题

### Q1: 部署后页面空白

**原因**: 路由配置问题

**解决**:
- Vercel: 自动处理
- Netlify: 确保有`_redirects`或`netlify.toml`
- Nginx: 确保配置了`try_files`

### Q2: API调用失败

**原因**: CORS或API密钥问题

**解决**:
1. 检查Supabase CORS配置
2. 确认API密钥正确
3. 检查浏览器控制台错误

### Q3: 构建失败

**原因**: 依赖或配置问题

**解决**:
```bash
# 清除缓存
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Q4: 环境变量不生效

**原因**: 环境变量配置错误

**解决**:
- 确保变量名以`VITE_`开头
- 重新构建应用
- 检查部署平台的环境变量设置

---

## 📊 监控和维护

### 1. 错误监控

推荐使用:
- Sentry
- LogRocket
- Bugsnag

### 2. 性能监控

- Google Analytics
- Vercel Analytics
- Netlify Analytics

### 3. 定期维护

- [ ] 每周检查错误日志
- [ ] 每月更新依赖
- [ ] 定期备份数据库
- [ ] 监控API使用量

---

## 🎉 部署完成

部署完成后:

1. ✅ 记录部署URL
2. ✅ 测试所有功能
3. ✅ 配置监控
4. ✅ 通知用户

**部署URL**: _________________

**部署日期**: _________________

**部署人员**: _________________

---

## 📞 技术支持

如遇问题:

1. 查看文档: `docs/`目录
2. 检查日志: 浏览器控制台
3. 查看Issues: GitHub Issues
4. 联系开发团队

---

**祝部署顺利!** 🚀

