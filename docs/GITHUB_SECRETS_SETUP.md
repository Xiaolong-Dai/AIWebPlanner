# GitHub Secrets 配置指南

## 📋 概述

为了让 GitHub Actions 能够构建包含环境变量的 Docker 镜像，需要在 GitHub 仓库中配置 Secrets。

---

## 🔐 需要配置的 Secrets

### 1. 阿里云容器镜像服务配置

| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `ALIYUN_REGISTRY` | 阿里云镜像仓库地址 | `crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com` |
| `ALIYUN_NAMESPACE` | 阿里云命名空间 | `ai-web-planner` |
| `ALIYUN_USERNAME` | 阿里云账号用户名 | 你的阿里云账号 |
| `ALIYUN_PASSWORD` | 阿里云镜像服务密码 | 你的镜像服务密码 |

### 2. 应用环境变量配置

| Secret 名称 | 说明 | 当前值（示例） |
|------------|------|---------------|
| `VITE_SUPABASE_URL` | Supabase 数据库 URL | `https://blghnzrjwbmkkopvxfyo.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_AMAP_KEY` | 高德地图 API Key | `4760097a9ac4d94d0295fff44f39b8dd` |
| `VITE_AMAP_SECRET` | 高德地图 API Secret（可选） | 留空或填写实际值 |
| `VITE_ALIYUN_LLM_API_KEY` | 阿里云百炼 API Key | `sk-3a6fcd7c0b04482d8bc3596725520d18` |
| `VITE_ALIYUN_LLM_ENDPOINT` | 阿里云百炼 API 端点 | `https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation` |
| `VITE_XFEI_APP_ID` | 科大讯飞 APP ID | `81268405` |
| `VITE_XFEI_API_KEY` | 科大讯飞 API Key | `89c8b4049d35aa7cf759d0120a860648` |
| `VITE_XFEI_API_SECRET` | 科大讯飞 API Secret | `YjU4OTBlOWEyOTkyZTgzMGY2ZjE3ZDg3` |

---

## 📝 配置步骤

### 步骤 1: 打开 GitHub 仓库设置

1. 访问你的 GitHub 仓库：https://github.com/Xiaolong-Dai/AIWebPlanner
2. 点击顶部菜单栏的 **Settings**（设置）
3. 在左侧菜单中找到 **Secrets and variables** → **Actions**

### 步骤 2: 添加 Secrets

点击 **New repository secret** 按钮，逐个添加以下 Secrets：

#### 阿里云配置（4个）

1. **Name**: `ALIYUN_REGISTRY`  
   **Value**: `crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com`

2. **Name**: `ALIYUN_NAMESPACE`  
   **Value**: `ai-web-planner`

3. **Name**: `ALIYUN_USERNAME`  
   **Value**: `你的阿里云账号用户名`

4. **Name**: `ALIYUN_PASSWORD`  
   **Value**: `你的阿里云镜像服务密码`

#### 应用环境变量（9个）

5. **Name**: `VITE_SUPABASE_URL`  
   **Value**: `https://blghnzrjwbmkkopvxfyo.supabase.co`

6. **Name**: `VITE_SUPABASE_ANON_KEY`  
   **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsZ2huenJqd2Jta2tvcHZ4ZnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzU3MDIsImV4cCI6MjA3NzA1MTcwMn0.vI-IhKARaafxfwtfayXRh1HLhUUFHMHkmlcKRY9gm8U`

7. **Name**: `VITE_AMAP_KEY`  
   **Value**: `4760097a9ac4d94d0295fff44f39b8dd`

8. **Name**: `VITE_AMAP_SECRET`  
   **Value**: `（留空或填写实际值）`

9. **Name**: `VITE_ALIYUN_LLM_API_KEY`  
   **Value**: `sk-3a6fcd7c0b04482d8bc3596725520d18`

10. **Name**: `VITE_ALIYUN_LLM_ENDPOINT`  
    **Value**: `https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation`

11. **Name**: `VITE_XFEI_APP_ID`  
    **Value**: `81268405`

12. **Name**: `VITE_XFEI_API_KEY`  
    **Value**: `89c8b4049d35aa7cf759d0120a860648`

13. **Name**: `VITE_XFEI_API_SECRET`  
    **Value**: `YjU4OTBlOWEyOTkyZTgzMGY2ZjE3ZDg3`

### 步骤 3: 验证配置

配置完成后，你应该看到 13 个 Secrets：

```
✅ ALIYUN_REGISTRY
✅ ALIYUN_NAMESPACE
✅ ALIYUN_USERNAME
✅ ALIYUN_PASSWORD
✅ VITE_SUPABASE_URL
✅ VITE_SUPABASE_ANON_KEY
✅ VITE_AMAP_KEY
✅ VITE_AMAP_SECRET
✅ VITE_ALIYUN_LLM_API_KEY
✅ VITE_ALIYUN_LLM_ENDPOINT
✅ VITE_XFEI_APP_ID
✅ VITE_XFEI_API_KEY
✅ VITE_XFEI_API_SECRET
```

---

## 🚀 触发构建

配置完成后，有两种方式触发 Docker 镜像构建：

### 方式 1: 自动触发（推荐）

推送代码到 `main` 分支时自动触发：

```bash
git add .
git commit -m "feat: 更新功能"
git push origin main
```

### 方式 2: 手动触发

1. 访问 GitHub 仓库的 **Actions** 页面
2. 选择 **Build and Push Docker Images** workflow
3. 点击 **Run workflow** 按钮
4. 选择分支（默认 `main`）
5. 输入标签（可选，默认 `latest`）
6. 点击 **Run workflow**

---

## 🔍 查看构建日志

1. 访问 GitHub 仓库的 **Actions** 页面
2. 点击最新的 workflow 运行记录
3. 查看各个步骤的日志：
   - ✅ Checkout code
   - ✅ Set up Docker Buildx
   - ✅ Login to Aliyun Container Registry
   - ✅ Build and push frontend image
   - ✅ Build and push backend image

如果构建失败，查看错误日志并修复问题。

---

## 🧪 测试部署

构建成功后，拉取并运行镜像：

```bash
# 拉取最新镜像
docker pull crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/frontend:latest
docker pull crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/backend:latest

# 运行容器
docker run -d --name test-frontend -p 3000:80 \
  crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/frontend:latest

# 测试
curl http://localhost:3000
```

---

## ⚠️ 安全注意事项

1. **不要将 Secrets 提交到代码仓库**
   - `.env` 文件已在 `.gitignore` 中
   - 确保不要意外提交敏感信息

2. **定期更新密钥**
   - API Keys 有过期时间
   - 定期检查并更新 GitHub Secrets

3. **最小权限原则**
   - 只授予必要的权限
   - 使用只读密钥（如果可能）

4. **监控使用情况**
   - 定期检查 API 调用量
   - 防止密钥泄露导致的滥用

---

## 🆘 常见问题

### Q1: 构建失败，提示 "secret not found"

**A**: 检查 Secret 名称是否完全匹配（区分大小写）

### Q2: 镜像构建成功，但运行时功能不正常

**A**: 
1. 检查 Secrets 的值是否正确
2. 查看容器日志：`docker logs <container_name>`
3. 进入容器检查环境变量是否注入：
   ```bash
   docker exec <container_name> sh -c "grep -o 'VITE_AMAP_KEY' /usr/share/nginx/html/assets/*.js"
   ```

### Q3: 如何更新 Secrets？

**A**: 
1. 进入 GitHub 仓库的 **Settings** → **Secrets and variables** → **Actions**
2. 点击要更新的 Secret
3. 点击 **Update secret**
4. 输入新值并保存
5. 重新触发 workflow 构建

---

## 📚 相关文档

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [GitHub Secrets 文档](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [阿里云容器镜像服务](https://cr.console.aliyun.com)

---

**配置完成后，请告诉我，我会帮你验证配置是否正确！** 🚀

