# 如何生成 PDF 提交文档

## 📋 提交要求

根据作业要求，需要提交一个 PDF 文件，包含：
1. GitHub 仓库地址
2. README 文档（Docker 镜像部署指南）
3. API 密钥说明（如果使用非助教提供的 Key）

## 🎯 已准备好的文件

### 1. SUBMISSION_README.md
- 完整的项目提交文档（Markdown 格式）
- 包含所有必需内容
- 位置：项目根目录

### 2. generate_pdf.html
- 精美的 HTML 格式文档
- 可直接打印保存为 PDF
- 已在浏览器中打开

## 📝 生成 PDF 的步骤

### 方法一：使用浏览器打印（推荐）

**步骤：**

1. **打开 HTML 文件**
   - 文件已在浏览器中打开
   - 或者双击 `generate_pdf.html` 文件

2. **点击页面右上角的"打印/保存为 PDF"按钮**
   - 或者按快捷键：`Ctrl + P` (Windows) 或 `Cmd + P` (Mac)

3. **在打印对话框中：**
   - **目标/打印机**: 选择"另存为 PDF"或"Microsoft Print to PDF"
   - **页面**: 全部
   - **布局**: 纵向
   - **边距**: 默认
   - **背景图形**: 勾选（保留颜色和样式）

4. **保存 PDF**
   - 文件名：`AI_Web_Planner_项目提交文档_戴晓龙.pdf`
   - 保存位置：选择合适的位置

5. **完成！**

### 方法二：使用在线工具

如果浏览器打印效果不理想，可以使用在线 Markdown 转 PDF 工具：

1. **打开 SUBMISSION_README.md**
2. **复制全部内容**
3. **访问在线工具**：
   - https://www.markdowntopdf.com/
   - https://md2pdf.netlify.app/
4. **粘贴内容并下载 PDF**

## ✅ 检查清单

在提交前，请确认 PDF 文件包含以下内容：

- [ ] 封面页（项目名称、GitHub 地址、作者、日期）
- [ ] 项目简介和核心功能
- [ ] 技术栈说明
- [ ] Docker 镜像信息（阿里云镜像仓库地址）
- [ ] 完整的部署指南（Docker Compose 和手动部署）
- [ ] 验证部署的步骤
- [ ] 功能测试步骤
- [ ] API 密钥说明（已内置在镜像中）
- [ ] GitHub 提交记录说明
- [ ] 项目架构图
- [ ] 总结

## 📦 提交内容

### 必须提交：
1. **PDF 文件**（刚生成的）
   - 包含 GitHub 仓库地址
   - 包含完整的 README 文档

### GitHub 仓库已包含：
1. **完整的源代码**
   - 前端代码（frontend/）
   - 后端代码（backend/）
   - 配置文件

2. **Docker 镜像**
   - 已推送到阿里云镜像仓库
   - 前端：`crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/frontend:latest`
   - 后端：`crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/backend:latest`

3. **详细的文档**
   - docs/DOCKER_DEPLOYMENT.md
   - docs/GITHUB_SECRETS_SETUP.md
   - docs/USER_MANUAL.md
   - 等等

4. **完整的 Git 提交记录**
   - 查看：https://github.com/Xiaolong-Dai/AIWebPlanner/commits/main

## 🔑 关于 API 密钥

**重要说明：**

本项目使用的所有 API 密钥已通过 GitHub Actions 在构建 Docker 镜像时注入，包括：

1. **阿里云百炼 API Key**（AI 大语言模型）
   - 有效期：至少 3 个月
   - 已内置在镜像中

2. **高德地图 API Key**
   - 长期有效
   - 已内置在镜像中

3. **科大讯飞 API Key**
   - 长期有效
   - 已内置在镜像中

4. **Supabase API Key**
   - 长期有效
   - 已内置在镜像中

**因此，助教可以直接拉取 Docker 镜像运行，无需额外配置任何 API 密钥。**

## 🚀 助教如何运行

助教只需要执行以下命令即可运行应用：

```bash
# 方式一：使用 Docker Compose（推荐）
mkdir ai-web-planner-deploy
cd ai-web-planner-deploy

# 创建 docker-compose.yml 文件（内容见 PDF 文档）

docker-compose pull
docker-compose up -d

# 访问 http://localhost:3000
```

或者：

```bash
# 方式二：手动部署
docker network create ai-planner-network

docker run -d \
  --name ai-web-planner-backend \
  --network ai-planner-network \
  --network-alias backend \
  -p 3001:3001 \
  crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/backend:latest

sleep 10

docker run -d \
  --name ai-web-planner-frontend \
  --network ai-planner-network \
  -p 3000:80 \
  crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/frontend:latest

# 访问 http://localhost:3000
```

## 📊 GitHub 仓库信息

- **仓库地址**: https://github.com/Xiaolong-Dai/AIWebPlanner
- **提交记录**: https://github.com/Xiaolong-Dai/AIWebPlanner/commits/main
- **文档目录**: https://github.com/Xiaolong-Dai/AIWebPlanner/tree/main/docs

## ✨ 完成！

现在你已经准备好提交作业了：

1. ✅ PDF 文件已生成
2. ✅ GitHub 仓库已完善
3. ✅ Docker 镜像已推送到阿里云
4. ✅ 文档已完整
5. ✅ Git 提交记录完整

**祝你作业顺利！** 🎉

