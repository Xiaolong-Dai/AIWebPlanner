# ⚡ 快速提交步骤 - 30分钟完成

> 本文档提供最快速的提交流程，帮助你在 30 分钟内完成所有准备工作

---

## 📋 准备清单

在开始之前，确保你有:
- [ ] GitHub 账号
- [ ] 阿里云账号
- [ ] 项目代码已在本地

---

## 🚀 第一步: 配置阿里云镜像仓库 (10分钟)

### 1. 开通容器镜像服务

```
1. 访问: https://cr.console.aliyun.com
2. 点击 "开通服务"
3. 选择 "个人实例" (免费)
4. 设置 Registry 登录密码 (记住!)
```

### 2. 创建命名空间

```
1. 点击左侧 "命名空间"
2. 点击 "创建命名空间"
3. 命名空间名称: ai-web-planner
4. 点击 "确定"
```

### 3. 创建镜像仓库

**前端仓库**:
```
1. 点击 "镜像仓库" → "创建镜像仓库"
2. 命名空间: ai-web-planner
3. 仓库名称: frontend
4. 仓库类型: 公开
5. 代码源: 本地仓库
6. 点击 "创建"
```

**后端仓库**:
```
重复上述步骤，仓库名称改为: backend
```

### 4. 记录信息

**当前配置**:
```
Registry 地址: crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com
命名空间: ai-web-planner
前端镜像: crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/frontend:latest
后端镜像: crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/backend:latest
```

---

## ⚙️ 第二步: 配置 GitHub Actions (5分钟)

### 1. 添加 GitHub Secrets

```
1. 打开 GitHub 仓库
2. Settings → Secrets and variables → Actions
3. 点击 "New repository secret"
```

**添加以下 4 个 Secrets**:

| Name | Value |
|------|-------|
| `ALIYUN_REGISTRY` | `crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com` |
| `ALIYUN_NAMESPACE` | `ai-web-planner` |
| `ALIYUN_USERNAME` | 你的阿里云账号 |
| `ALIYUN_PASSWORD` | Registry 登录密码 |

### 2. 提交 GitHub Actions 配置

```bash
# 确保 .github/workflows/docker-build.yml 文件存在
git add .github/workflows/docker-build.yml
git commit -m "ci: 添加 GitHub Actions 自动构建配置"
git push origin main
```

---

## 🐳 第三步: 构建 Docker 镜像 (10分钟)

### 方式一: GitHub Actions 自动构建 (推荐)

```
1. 访问 GitHub 仓库
2. 点击 "Actions" 标签
3. 等待自动构建完成 (约 5-10 分钟)
4. 查看构建日志确认成功
```

### 方式二: 本地手动构建 (备用)

```bash
# 登录阿里云
docker login --username=你的阿里云账号 crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com

# 构建并推送前端
cd frontend
docker build -t crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/frontend:latest .
docker push crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/frontend:latest
cd ..

# 构建并推送后端
cd backend
docker build -t crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/backend:latest .
docker push crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/backend:latest
cd ..
```

---

## 📄 第四步: 生成提交 PDF (5分钟)

### 1. 编辑提交文档

```bash
# 打开文档
code docs/SUBMISSION_DOCUMENT.md

# 或使用其他编辑器
notepad docs/SUBMISSION_DOCUMENT.md
```

**需要确认的内容**:
- [x] 学生姓名: 戴枭龙
- [x] 学号: 522025720004
- [x] 镜像地址已更新
- [x] API Key 已填写

### 2. 转换为 PDF

**方式一: 在线转换 (最简单)**

```
1. 访问: https://www.markdowntopdf.com
2. 上传 docs/SUBMISSION_DOCUMENT.md
3. 点击 "Convert"
4. 下载 PDF
```

**方式二: VS Code 插件**

```
1. 安装 "Markdown PDF" 插件
2. 打开 docs/SUBMISSION_DOCUMENT.md
3. Ctrl+Shift+P → "Markdown PDF: Export (pdf)"
4. 等待生成完成
```

### 3. 重命名 PDF

```
重命名为: AI-Web-Planner-提交文档-[你的姓名]-[学号].pdf
```

---

## ✅ 第五步: 验证 (5分钟)

### 1. 验证 Docker 镜像

```bash
# 拉取镜像
docker pull crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/frontend:latest
docker pull crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/backend:latest

# 运行测试
docker-compose -f docker-compose.aliyun.yml up -d

# 访问 http://localhost:3000
# 确认应用正常运行

# 停止
docker-compose -f docker-compose.aliyun.yml down
```

### 2. 验证 GitHub 仓库

```
1. 访问 GitHub 仓库
2. 确认代码已推送
3. 确认有详细的提交记录
4. 确认 README.md 完整
```

### 3. 验证 PDF 文档

```
1. 打开 PDF 文件
2. 确认包含 GitHub 仓库地址
3. 确认包含 Docker 镜像地址
4. 确认包含运行说明
5. 确认格式正确
```

---

## 📦 提交清单

在提交前，最后检查:

- [ ] ✅ GitHub 仓库地址正确
- [ ] ✅ Docker 镜像可以拉取
- [ ] ✅ Docker 镜像可以运行
- [ ] ✅ PDF 包含所有必需信息
- [ ] ✅ PDF 格式正确
- [ ] ✅ 文件命名规范
- [ ] ✅ API Key 有效 (如提供)

---

## 🎯 提交

按照课程要求提交 PDF 文件。

---

## ❓ 常见问题快速解答

### Q: GitHub Actions 构建失败?

```bash
# 检查 Secrets 配置
# 查看 Actions 日志
# 使用本地手动构建
```

### Q: Docker 镜像拉取失败?

```bash
# 确认镜像仓库是公开的
# 检查镜像地址是否正确
# 在阿里云控制台查看镜像是否存在
```

### Q: PDF 转换失败?

```
# 尝试其他转换工具
# 检查 Markdown 格式
# 使用 Word 转 PDF
```

---

## 📊 时间分配

| 步骤 | 预计时间 |
|------|----------|
| 配置阿里云 | 10 分钟 |
| 配置 GitHub Actions | 5 分钟 |
| 构建 Docker 镜像 | 10 分钟 |
| 生成 PDF | 5 分钟 |
| 验证 | 5 分钟 |
| **总计** | **35 分钟** |

---

## 🔗 相关文档

- [详细提交指南](SUBMISSION_GUIDE.md)
- [完整部署指南](COMPLETE_DEPLOYMENT_GUIDE.md)
- [部署检查清单](DEPLOYMENT_CHECKLIST_2025.md)

---

**祝你提交顺利！** 🎉

---

## 📝 提交后

提交完成后，你可以:

1. **部署到生产环境**
   - 使用 Vercel 部署
   - 或使用自己的服务器

2. **继续优化**
   - 添加更多功能
   - 优化性能
   - 改进 UI/UX

3. **分享项目**
   - 在 GitHub 上分享
   - 写技术博客
   - 制作演示视频

---

**完成时间**: _______________  
**提交人**: _______________  
**检查人**: _______________

