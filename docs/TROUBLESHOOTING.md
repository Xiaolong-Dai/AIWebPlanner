# 故障排除指南

**最后更新:** 2025-10-29

---

## 问题：登录/注册按钮没有反应

### 问题现象
- 点击登录或注册按钮后没有任何反应
- 没有错误提示
- 按钮没有loading状态

### 快速排查步骤

#### 1. 打开浏览器控制台
按F12打开开发者工具,查看Console标签页是否有错误信息。

**正常情况应该看到:**
```
开始登录... user@example.com
调用 signIn 函数...
创建新的 Supabase 客户端实例
登录成功，用户信息: {...}
```

**常见错误:**
- `Supabase URL 和 Key 未配置` → 需要先配置API密钥
- `Invalid login credentials` → 用户名或密码错误
- `User not found` → 用户不存在,需要先注册

#### 2. 使用调试面板
在登录页面右下角点击"调试面板"按钮,查看配置状态:
- 检查Supabase URL是否已配置
- 检查Supabase Key是否已配置
- 点击"打印配置到控制台"查看详细信息

#### 3. 配置API密钥
如果显示"未配置",请按以下步骤操作:
1. 点击"配置 API Keys"链接或访问 http://localhost:5173/settings
2. 填写Supabase URL和Anon Key
3. 点击"保存配置"
4. 点击"测试 Supabase 连接"确认配置正确
5. 返回登录页面重试

#### 4. 检查LocalStorage
在控制台执行以下命令查看配置是否保存:
```javascript
localStorage.getItem('api-config')
```

如果返回null,说明配置未保存,需要重新配置。

### 解决方案

**方案1: 使用调试面板(最快)**
1. 登录页面 → 点击"调试面板"
2. 查看配置状态
3. 如未配置 → 点击"配置 API Keys"
4. 填写并保存配置
5. 返回登录页面

**方案2: 直接访问设置页面**
1. 访问 http://localhost:5173/settings
2. 填写Supabase URL和Key
3. 保存并测试连接
4. 返回登录页面

---

## 问题：登录提示"Email not confirmed"(邮箱未验证)

### 问题现象
- 注册成功后尝试登录
- 提示"邮箱未验证！请查收验证邮件并点击验证链接后再登录。"

### 原因
Supabase默认要求新用户验证邮箱后才能登录,这是一个安全特性。

### 解决方案

#### 方案1: 验证邮箱(推荐用于生产环境)
1. 检查注册时使用的邮箱
2. 查找来自Supabase的验证邮件(主题通常是"Confirm your signup")
3. 点击邮件中的验证链接
4. 返回登录页面重新登录

**注意:** 如果没收到邮件:
- 检查垃圾邮件文件夹
- 确认邮箱地址正确
- 等待几分钟(邮件可能延迟)

#### 方案2: 手动确认用户(推荐用于开发测试)
在Supabase Dashboard的SQL Editor中执行:

```sql
-- 确认特定用户
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'your-email@example.com';
```

或者使用项目提供的脚本:
```bash
# 在Supabase Dashboard → SQL Editor中
# 执行 docs/confirm_user.sql
```

#### 方案3: 关闭邮箱验证(仅用于开发环境)
1. 登录Supabase Dashboard
2. 进入项目 → **Authentication** → **Providers**
3. 点击 **Email** 提供商
4. 关闭 **"Confirm email"** 选项
5. 保存设置
6. 重新注册新用户(已注册用户仍需手动确认)

#### 方案4: 在Supabase Dashboard中手动确认
1. 进入 **Authentication** → **Users**
2. 找到对应的用户
3. 点击用户进入详情页
4. 查看并手动设置邮箱为已确认状态

### 验证是否成功
执行以下SQL查看用户状态:
```sql
SELECT
  email,
  email_confirmed_at,
  CASE
    WHEN email_confirmed_at IS NOT NULL THEN '已验证'
    ELSE '未验证'
  END as status
FROM auth.users
WHERE email = 'your-email@example.com';
```

---

## 问题：访问应用显示空白页面

### 原因分析

如果您访问 `http://localhost:5173` 或 `http://localhost:5174` 时看到空白页面，可能是以下原因：

1. **Supabase 未配置**：`.env.local` 文件中的 Supabase 配置是占位符
2. **浏览器控制台错误**：JavaScript 执行出错导致页面无法渲染
3. **依赖未安装**：`node_modules` 缺失或版本不匹配

### 解决方案

#### 方案 1：配置 Supabase（推荐）

1. **创建 Supabase 项目**
   - 访问 https://supabase.com
   - 注册并创建新项目
   - 等待项目初始化完成（约 2 分钟）

2. **获取 API 凭证**
   - 进入项目设置 → API
   - 复制 `Project URL` 和 `anon public` key

3. **配置环境变量**
   ```bash
   # 编辑 frontend/.env.local
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **重启开发服务器**
   ```bash
   cd frontend
   npm run dev
   ```

5. **访问应用**
   - 打开 http://localhost:5173
   - 您应该能看到登录页面
   - 点击"配置 API Keys"链接进入设置页面

#### 方案 2：通过设置页面配置（无需重启）

1. **访问设置页面**
   - 直接访问 http://localhost:5173/settings

2. **填写 Supabase 配置**
   - 在"Supabase 配置"标签页填入：
     - Project URL
     - Anon Key
   - 点击"保存配置"

3. **返回登录页面**
   - 点击左上角"返回登录"
   - 现在可以正常注册和登录了

#### 方案 3：检查浏览器控制台

1. **打开开发者工具**
   - Chrome/Edge: 按 `F12` 或 `Ctrl+Shift+I`
   - Firefox: 按 `F12`
   - Safari: `Cmd+Option+I`

2. **查看 Console 标签**
   - 查找红色错误信息
   - 常见错误：
     - `Supabase URL 和 Key 未配置` → 需要配置 Supabase
     - `Failed to fetch` → 网络问题或 API 地址错误
     - `Module not found` → 依赖未安装，运行 `npm install`

3. **查看 Network 标签**
   - 检查是否有失败的请求
   - 查看请求的状态码和响应

#### 方案 4：重新安装依赖

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### 方案 5：清除浏览器缓存

1. **硬刷新页面**
   - Windows/Linux: `Ctrl+Shift+R` 或 `Ctrl+F5`
   - Mac: `Cmd+Shift+R`

2. **清除站点数据**
   - Chrome: 开发者工具 → Application → Clear storage
   - Firefox: 开发者工具 → Storage → Clear All

---

## 问题：登录/注册失败

### 错误信息：`Supabase URL 和 Key 未配置`

**解决方案**：
1. 按照上面的"方案 1"或"方案 2"配置 Supabase
2. 确保 URL 和 Key 不包含 `your_` 等占位符

### 错误信息：`Invalid API key`

**解决方案**：
1. 检查 Supabase 项目是否已激活
2. 确认复制的是 `anon public` key，不是 `service_role` key
3. 重新从 Supabase 控制台复制 API Key

### 错误信息：`Email not confirmed`

**解决方案**：
1. 检查注册邮箱的收件箱
2. 点击验证邮件中的链接
3. 如果没收到邮件，检查垃圾邮件文件夹

---

## 问题：页面样式错乱

### 原因

- Ant Design CSS 未正确加载
- CSS 文件路径错误

### 解决方案

1. **检查 main.tsx**
   ```typescript
   import 'antd/dist/reset.css'; // 确保这行存在
   ```

2. **清除 Vite 缓存**
   ```bash
   cd frontend
   rm -rf node_modules/.vite
   npm run dev
   ```

---

## 问题：热更新不工作

### 解决方案

1. **重启开发服务器**
   ```bash
   # 按 Ctrl+C 停止服务器
   npm run dev
   ```

2. **检查文件监听限制（Linux/Mac）**
   ```bash
   # 增加文件监听数量
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

---

## 问题：端口被占用

### 错误信息：`Port 5173 is in use`

**解决方案**：

1. **Vite 会自动使用下一个可用端口**
   - 查看终端输出，找到实际端口号
   - 例如：`Local: http://localhost:5174/`

2. **手动释放端口（Windows）**
   ```powershell
   # 查找占用端口的进程
   netstat -ano | findstr :5173
   
   # 结束进程（替换 PID）
   taskkill /PID <PID> /F
   ```

3. **手动释放端口（Linux/Mac）**
   ```bash
   # 查找占用端口的进程
   lsof -i :5173
   
   # 结束进程
   kill -9 <PID>
   ```

---

## 问题：TypeScript 编译错误

### 解决方案

1. **检查 TypeScript 版本**
   ```bash
   npm list typescript
   # 应该是 ~5.9.3
   ```

2. **重新安装 TypeScript**
   ```bash
   npm install --save-dev typescript@~5.9.3
   ```

3. **清除 TypeScript 缓存**
   ```bash
   rm -rf frontend/node_modules/.cache
   ```

---

## 问题：ESLint 错误

### 解决方案

1. **自动修复**
   ```bash
   npm run lint -- --fix
   ```

2. **忽略特定规则**
   - 在文件顶部添加：
     ```typescript
     /* eslint-disable @typescript-eslint/no-explicit-any */
     ```

---

## 获取帮助

如果以上方案都无法解决您的问题，请：

1. **查看完整错误日志**
   - 终端输出
   - 浏览器控制台
   - Network 标签

2. **检查项目状态**
   ```bash
   cd frontend
   npm run build  # 尝试构建，查看详细错误
   ```

3. **提供以下信息**
   - 操作系统和版本
   - Node.js 版本 (`node -v`)
   - npm 版本 (`npm -v`)
   - 完整的错误信息
   - 浏览器类型和版本

---

## 常见问题快速检查清单

- [ ] 是否运行了 `npm install`？
- [ ] 是否配置了 `.env.local` 文件？
- [ ] Supabase URL 和 Key 是否正确？
- [ ] 开发服务器是否正在运行？
- [ ] 浏览器控制台是否有错误？
- [ ] 是否尝试了硬刷新（Ctrl+Shift+R）？
- [ ] Node.js 版本是否 >= 18？
- [ ] 是否清除了浏览器缓存？

---

**最后更新**: 2024-12-XX  
**维护者**: 开发团队

