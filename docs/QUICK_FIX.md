# 快速修复指南

## 🚀 登录问题快速解决

### 问题: "Email not confirmed" (邮箱未验证)

**最快解决方法 (30秒):**

1. 打开Supabase Dashboard: https://supabase.com/dashboard
2. 选择你的项目
3. 点击左侧 **SQL Editor**
4. 粘贴以下SQL并执行:

```sql
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'admin@163.com';
```

5. 返回登录页面,重新登录

**完成!** ✅

---

## 📧 如果你想使用真实的邮箱验证

### 步骤1: 配置邮件服务

Supabase默认使用内置的邮件服务,但有发送限制。

**选项A: 使用Supabase内置邮件(有限制)**
- 每小时最多3封邮件
- 适合开发测试

**选项B: 配置自定义SMTP(推荐生产环境)**
1. 进入 **Project Settings** → **Auth**
2. 找到 **SMTP Settings**
3. 配置你的SMTP服务器(如Gmail, SendGrid等)

### 步骤2: 检查邮件模板

1. 进入 **Authentication** → **Email Templates**
2. 查看 **Confirm signup** 模板
3. 确认邮件内容和链接正确

---

## 🔧 关闭邮箱验证(仅开发环境)

如果你只是在本地开发测试,可以完全关闭邮箱验证:

1. 进入 **Authentication** → **Providers**
2. 点击 **Email** 提供商
3. 找到 **Confirm email** 选项
4. 关闭它
5. 保存

**注意:** 关闭后,新注册的用户可以直接登录,无需验证邮箱。

---

## 📝 常用SQL命令

### 查看所有用户
```sql
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '已验证'
    ELSE '未验证'
  END as status
FROM auth.users
ORDER BY created_at DESC;
```

### 确认所有用户(谨慎使用)
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;
```

### 删除测试用户
```sql
DELETE FROM auth.users 
WHERE email = 'test@example.com';
```

### 重置用户密码(生成重置链接)
```sql
-- 在Supabase Dashboard中使用"Send Password Reset"功能
-- 或者在代码中调用:
-- supabase.auth.resetPasswordForEmail('user@example.com')
```

---

## 🎯 完整的首次使用流程

### 1. 配置Supabase
- 访问 http://localhost:5173/settings
- 填写Supabase URL和Anon Key
- 保存配置

### 2. 初始化数据库
- 在Supabase Dashboard → SQL Editor
- 执行 `docs/database_setup.sql`

### 3. 关闭邮箱验证(可选)
- Authentication → Providers → Email
- 关闭 "Confirm email"

### 4. 注册账号
- 访问 http://localhost:5173/login
- 切换到"注册"标签
- 填写邮箱和密码
- 点击注册

### 5. 确认用户(如果开启了邮箱验证)
- 方法A: 查收验证邮件
- 方法B: 执行SQL手动确认

### 6. 登录
- 使用注册的邮箱和密码登录
- 成功后会跳转到Dashboard

---

## 🐛 调试技巧

### 查看当前配置
在浏览器控制台执行:
```javascript
localStorage.getItem('api-config')
```

### 清除所有数据重新开始
```javascript
localStorage.clear();
location.reload();
```

### 测试Supabase连接
在设置页面点击"测试 Supabase 连接"按钮

### 查看详细日志
打开浏览器控制台(F12),所有操作都会有详细日志输出

---

## 📞 需要帮助?

如果以上方法都无法解决问题:

1. 查看 `docs/TROUBLESHOOTING.md` 获取更详细的排查步骤
2. 检查浏览器控制台的错误信息
3. 使用登录页面的"调试面板"查看配置状态
4. 在GitHub提交Issue并附上错误信息

---

**最后更新:** 2025-10-29

