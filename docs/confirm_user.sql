-- 手动确认用户邮箱
-- 用于开发测试环境，跳过邮箱验证步骤

-- 方法1: 确认特定用户
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'admin@163.com';

-- 方法2: 确认所有未验证的用户(谨慎使用)
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW() 
-- WHERE email_confirmed_at IS NULL;

-- 查看所有用户的验证状态
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

