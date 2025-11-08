# 🔐 安全指南

## API Key 安全管理

本项目采用多层安全措施保护您的 API 密钥。

---

## 📋 安全措施清单

### ✅ 已实施的安全措施

#### 1. **代码层面**
- ✅ 所有 API Key 通过环境变量或用户配置读取，**无硬编码**
- ✅ 使用 `Input.Password` 组件隐藏密钥输入
- ✅ 调试面板仅在开发环境显示
- ✅ 密钥显示采用掩码（仅显示前4位+后4位）
- ✅ 生产环境禁用所有敏感日志输出

#### 2. **存储层面**
- ✅ API Key 存储在浏览器 `localStorage`（仅本地）
- ✅ 不会上传到任何服务器
- ✅ 支持用户随时清除配置

#### 3. **Git 安全**
- ✅ `.gitignore` 正确配置，排除所有敏感文件
- ✅ `.env` 文件不会被提交
- ✅ `.env.example` 仅包含占位符

#### 4. **传输安全**
- ✅ 使用 HTTPS 加密传输（生产环境）
- ✅ 后端代理隐藏真实 API Key
- ✅ 请求头中的 Authorization 不会被记录

---

## 🛡️ 用户安全建议

### 1. **保护您的 API Key**

❌ **不要做：**
- 不要将 API Key 分享给他人
- 不要在公开场合展示 API Key
- 不要将 API Key 提交到 Git
- 不要在截图中包含完整的 API Key

✅ **应该做：**
- 定期轮换 API Key
- 为不同项目使用不同的 Key
- 设置 API 调用限额
- 监控 API 使用情况

### 2. **浏览器安全**

- 使用最新版本的浏览器
- 定期清理浏览器缓存和 localStorage
- 不要在公共电脑上保存 API Key
- 使用浏览器的隐私模式测试

### 3. **网络安全**

- 避免在不安全的 WiFi 网络下使用
- 确保访问的是正确的域名（防止钓鱼）
- 使用 VPN 增加安全性（可选）

---

## 🔍 安全检查清单

在部署或分享项目前，请检查：

- [ ] `.env` 文件已添加到 `.gitignore`
- [ ] 没有硬编码的 API Key
- [ ] `.env.example` 中没有真实的 Key
- [ ] Git 历史中没有泄露的 Key
- [ ] 生产环境禁用了调试面板
- [ ] 控制台日志不包含敏感信息

---

## 🚨 如果 API Key 泄露了怎么办？

### 立即行动：

1. **撤销泄露的 Key**
   - 登录对应的服务平台
   - 立即删除或禁用泄露的 Key

2. **生成新的 Key**
   - 创建新的 API Key
   - 更新应用配置

3. **检查使用记录**
   - 查看 API 调用日志
   - 检查是否有异常使用
   - 确认是否产生意外费用

4. **清理 Git 历史**（如果提交到 Git）
   ```bash
   # 使用 git-filter-repo 或 BFG Repo-Cleaner
   # 警告：这会重写 Git 历史
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   ```

5. **通知相关方**
   - 如果是团队项目，通知所有成员
   - 如果是公开项目，发布安全公告

---

## 🔐 最佳实践

### 开发环境

```bash
# 1. 复制示例文件
cp .env.example .env

# 2. 编辑 .env 文件，填入真实的 Key
# 注意：不要提交这个文件！

# 3. 验证 .gitignore
git status  # 确保 .env 不在列表中
```

### 生产环境

**方案 1：环境变量（推荐）**
```bash
# Docker
docker run -e VITE_SUPABASE_URL=xxx -e VITE_SUPABASE_ANON_KEY=xxx ...

# Docker Compose
# 在 docker-compose.yml 中使用 environment 或 env_file
```

**方案 2：应用内配置**
- 用户在设置页面手动输入 API Key
- Key 保存在浏览器 localStorage
- 适合个人使用或演示

**方案 3：后端代理（最安全）**
- API Key 仅存储在后端服务器
- 前端通过后端接口调用第三方服务
- 前端完全不接触真实的 API Key

---

## 📚 相关资源

### API 服务安全文档

- [Supabase 安全最佳实践](https://supabase.com/docs/guides/auth/security)
- [阿里云 API 密钥管理](https://help.aliyun.com/document_detail/116401.html)
- [高德地图 Key 安全](https://lbs.amap.com/api/javascript-api/guide/abc/prepare)

### 安全工具

- [git-secrets](https://github.com/awslabs/git-secrets) - 防止提交密钥到 Git
- [truffleHog](https://github.com/trufflesecurity/trufflehog) - 扫描 Git 历史中的密钥
- [GitGuardian](https://www.gitguardian.com/) - 自动检测泄露的密钥

---

## 📞 报告安全问题

如果您发现本项目存在安全漏洞，请通过以下方式报告：

1. **不要**在公开的 Issue 中报告安全问题
2. 发送邮件到项目维护者（如有）
3. 提供详细的漏洞描述和复现步骤
4. 我们会在 48 小时内响应

---

## 📝 更新日志

### 2025-11-08 (第二次更新)
- ✅ 完全移除 `DebugPanel` 调试面板组件
- ✅ 移除所有调试面板相关引用

### 2025-11-08 (第一次更新)
- ✅ 修复 `.env.example` 中的真实 API Key 泄露
- ✅ 增强 `DebugPanel` 安全性（仅开发环境显示）
- ✅ 移除所有打印完整 API Key 的日志
- ✅ 实施密钥掩码显示（前4位+后4位）
- ✅ 添加生产环境日志保护

---

**记住：安全是一个持续的过程，而不是一次性的任务。** 🔒

