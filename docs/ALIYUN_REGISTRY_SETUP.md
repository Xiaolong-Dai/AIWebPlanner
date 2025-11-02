# 阿里云容器镜像服务配置指南

> 解决 GitHub Actions 推送 Docker 镜像失败的问题

---

## 🚨 当前错误

```
push access denied, repository does not exist or may require authorization
```

**原因**: 阿里云镜像仓库未正确配置或 GitHub Secrets 配置错误

---

## 📋 解决步骤

### 第一步: 登录阿里云容器镜像服务

1. **访问阿里云容器镜像服务控制台**
   ```
   https://cr.console.aliyun.com
   ```

2. **选择个人实例**
   - 点击左侧菜单 "个人实例"
   - 如果是第一次使用，需要先开通服务（免费）

---

### 第二步: 创建命名空间

1. **进入命名空间管理**
   - 左侧菜单 → "命名空间"
   - 点击 "创建命名空间"

2. **填写命名空间信息**
   ```
   命名空间名称: ai-web-planner
   命名空间类型: 公开 (推荐) 或 私有
   ```

3. **确认创建**
   - 点击 "确定"
   - 等待创建完成

---

### 第三步: 创建镜像仓库

#### 方式一: 手动创建（推荐）

1. **进入镜像仓库管理**
   - 左侧菜单 → "镜像仓库"
   - 点击 "创建镜像仓库"

2. **创建前端镜像仓库**
   ```
   命名空间: ai-web-planner
   仓库名称: frontend
   仓库类型: 公开 (推荐) 或 私有
   摘要: AI Web Planner 前端应用
   ```

3. **创建后端镜像仓库**
   ```
   命名空间: ai-web-planner
   仓库名称: backend
   仓库类型: 公开 (推荐) 或 私有
   摘要: AI Web Planner 后端代理服务
   ```

#### 方式二: 自动创建

如果你的阿里云账号开启了"自动创建仓库"功能，可以跳过手动创建步骤。
首次推送时会自动创建仓库。

---

### 第四步: 获取访问凭证

1. **设置 Registry 登录密码**
   - 左侧菜单 → "访问凭证"
   - 点击 "设置固定密码"
   - 输入密码（至少8位，包含大小写字母和数字）
   - 确认密码

2. **记录登录信息**
   ```
   Registry 地址: crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com
   用户名: 你的阿里云账号（通常是邮箱或手机号）
   密码: 刚才设置的固定密码
   ```

---

### 第五步: 配置 GitHub Secrets

1. **访问 GitHub 仓库设置**
   ```
   https://github.com/Xiaolong-Dai/AIWebPlanner/settings/secrets/actions
   ```

2. **添加或更新以下 Secrets**

   点击 "New repository secret" 或 "Update" 按钮：

   **Secret 1: ALIYUN_REGISTRY**
   ```
   Name: ALIYUN_REGISTRY
   Value: crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com
   ```

   **Secret 2: ALIYUN_NAMESPACE**
   ```
   Name: ALIYUN_NAMESPACE
   Value: ai-web-planner
   ```

   **Secret 3: ALIYUN_USERNAME**
   ```
   Name: ALIYUN_USERNAME
   Value: 你的阿里云账号（邮箱或手机号）
   ```
   
   **示例**:
   - 如果是邮箱: `example@gmail.com`
   - 如果是手机号: `13800138000`

   **Secret 4: ALIYUN_PASSWORD**
   ```
   Name: ALIYUN_PASSWORD
   Value: 你在阿里云设置的固定密码
   ```

3. **确认所有 Secrets 已添加**
   
   你应该看到 4 个 Secrets：
   - ✅ ALIYUN_REGISTRY
   - ✅ ALIYUN_NAMESPACE
   - ✅ ALIYUN_USERNAME
   - ✅ ALIYUN_PASSWORD

---

### 第六步: 本地测试登录

在触发 GitHub Actions 之前，先在本地测试登录：

```bash
# 登录阿里云镜像仓库
docker login --username=你的阿里云账号 crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com

# 输入密码（你设置的固定密码）
# 看到 "Login Succeeded" 表示成功
```

**如果登录失败**:
- 检查用户名是否正确（邮箱或手机号）
- 检查密码是否正确（固定密码，不是阿里云登录密码）
- 检查 Registry 地址是否正确

---

### 第七步: 重新触发 GitHub Actions

#### 方式一: 手动触发

1. 访问: https://github.com/Xiaolong-Dai/AIWebPlanner/actions
2. 点击 "Build and Push Docker Images"
3. 点击 "Run workflow"
4. 选择分支: `main`
5. 点击 "Run workflow"

#### 方式二: 推送代码触发

```bash
# 创建一个空提交
git commit --allow-empty -m "trigger: 重新触发 Docker 镜像构建"
git push origin main
```

---

## 🔍 常见问题排查

### 问题 1: "insufficient_scope: authorization failed"

**原因**: 
- GitHub Secrets 中的用户名或密码不正确
- 或者没有设置固定密码

**解决方案**:
1. 在阿里云控制台重新设置固定密码
2. 更新 GitHub Secrets 中的 `ALIYUN_PASSWORD`
3. 确保 `ALIYUN_USERNAME` 是阿里云账号（不是昵称）

---

### 问题 2: "repository does not exist"

**原因**: 
- 命名空间或仓库未创建
- 或者仓库名称不匹配

**解决方案**:
1. 在阿里云控制台手动创建命名空间 `ai-web-planner`
2. 手动创建仓库 `frontend` 和 `backend`
3. 或者开启"自动创建仓库"功能

---

### 问题 3: "denied: requested access to the resource is denied"

**原因**: 
- 用户名或密码错误
- 或者账号没有推送权限

**解决方案**:
1. 确认用户名是阿里云账号（主账号）
2. 如果使用子账号，确保有推送权限
3. 重新设置固定密码

---

## 📝 检查清单

在重新触发构建之前，请确认：

- [ ] 阿里云容器镜像服务已开通
- [ ] 命名空间 `ai-web-planner` 已创建
- [ ] 镜像仓库 `frontend` 已创建（或开启自动创建）
- [ ] 镜像仓库 `backend` 已创建（或开启自动创建）
- [ ] 已设置 Registry 固定密码
- [ ] 本地 `docker login` 测试成功
- [ ] GitHub Secrets 中 4 个配置都已添加
- [ ] `ALIYUN_USERNAME` 是阿里云账号（邮箱或手机号）
- [ ] `ALIYUN_PASSWORD` 是固定密码（不是登录密码）

---

## 🎯 验证步骤

### 1. 本地验证

```bash
# 1. 登录
docker login --username=你的阿里云账号 crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com

# 2. 拉取一个测试镜像
docker pull nginx:alpine

# 3. 打标签
docker tag nginx:alpine crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/test:latest

# 4. 推送测试
docker push crpi-6zoy4d1jjyh0za6c.cn-hangzhou.personal.cr.aliyuncs.com/ai-web-planner/test:latest

# 如果推送成功，说明配置正确
```

### 2. GitHub Actions 验证

触发构建后，查看日志：

```
访问: https://github.com/Xiaolong-Dai/AIWebPlanner/actions
点击最新的 workflow run
查看详细日志
```

**成功的标志**:
```
✅ Login to Aliyun Container Registry
✅ Build and push frontend image
✅ Build and push backend image
```

---

## 📚 相关文档

- [阿里云容器镜像服务文档](https://help.aliyun.com/product/60716.html)
- [Docker 登录文档](https://docs.docker.com/engine/reference/commandline/login/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

## 💡 提示

### 推荐配置

1. **仓库类型**: 选择"公开"
   - 优点: 任何人都可以拉取镜像，方便助教测试
   - 缺点: 镜像内容公开可见

2. **自动创建仓库**: 开启
   - 优点: 首次推送时自动创建仓库
   - 缺点: 无法预先设置仓库属性

### 安全建议

1. **固定密码**: 定期更换
2. **权限控制**: 如果使用子账号，只授予必要权限
3. **镜像扫描**: 开启镜像安全扫描（可选）

---

**完成以上步骤后，重新触发 GitHub Actions 构建即可！** 🚀

