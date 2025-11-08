import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message, Tabs, Alert } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { signIn, signUp } from '../services/auth';
import { useAuthStore } from '../store/authStore';
import { useApiConfigStore } from '../store/apiConfigStore';
import { ROUTES } from '../constants';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const { isConfigured } = useApiConfigStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const handleLogin = async (values: { email: string; password: string }) => {
    console.log('开始登录...', values.email);
    setLoading(true);
    try {
      console.log('调用 signIn 函数...');
      const { user } = await signIn(values.email, values.password);
      console.log('登录成功，用户信息:', user);
      if (user) {
        setUser({
          id: user.id,
          email: user.email || '',
          created_at: user.created_at,
          updated_at: user.updated_at || user.created_at,
        });
        message.success({
          content: `欢迎回来，${user.email}！正在跳转到主页...`,
          duration: 2,
        });
        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          navigate(ROUTES.DASHBOARD);
        }, 500);
      }
    } catch (error: unknown) {
      console.error('登录失败:', error);
      const err = error as Error;

      // 根据不同的错误类型给出详细的提示
      if (err.message.includes('未配置')) {
        message.error({
          content: (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>❌ 配置缺失</div>
              <div>请先在设置页面配置 Supabase API Key</div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                点击下方"配置 API Keys"链接进行配置
              </div>
            </div>
          ),
          duration: 6,
        });
      } else if (err.message.includes('Email not confirmed')) {
        message.warning({
          content: (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>📧 邮箱未验证</div>
              <div>您的账号需要先验证邮箱才能登录</div>
              <div style={{ marginTop: 8, fontSize: 12 }}>
                <div>• 请查收注册邮箱的验证邮件</div>
                <div>• 点击邮件中的验证链接</div>
                <div>• 或联系管理员手动激活账号</div>
              </div>
            </div>
          ),
          duration: 8,
        });
      } else if (err.message.includes('Invalid login credentials')) {
        message.error({
          content: (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>🔒 登录失败</div>
              <div>邮箱或密码错误</div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                <div>• 请检查邮箱地址是否正确</div>
                <div>• 请确认密码大小写</div>
                <div>• 如果忘记密码，请联系管理员重置</div>
              </div>
            </div>
          ),
          duration: 6,
        });
      } else if (err.message.includes('Email rate limit exceeded')) {
        message.warning({
          content: (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>⏱️ 操作过于频繁</div>
              <div>请稍后再试</div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                为了账号安全，请等待几分钟后重试
              </div>
            </div>
          ),
          duration: 5,
        });
      } else {
        message.error({
          content: (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>❌ 登录失败</div>
              <div>{err.message}</div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                如果问题持续存在，请联系技术支持
              </div>
            </div>
          ),
          duration: 6,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: { email: string; password: string }) => {
    console.log('开始注册...', values.email);
    setLoading(true);
    try {
      console.log('调用 signUp 函数...');
      const result = await signUp(values.email, values.password);
      console.log('注册成功', result);

      message.success({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>🎉 注册成功！</div>
            <div>账号已创建：{values.email}</div>
            <div style={{ marginTop: 8, fontSize: 12 }}>
              <div>📧 下一步操作：</div>
              <div>1. 查收邮箱验证邮件</div>
              <div>2. 点击邮件中的验证链接</div>
              <div>3. 返回此页面登录</div>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, opacity: 0.7 }}>
              提示：如未收到邮件，请检查垃圾邮件文件夹
            </div>
          </div>
        ),
        duration: 10,
      });

      // 延迟切换到登录标签，让用户看到成功提示
      setTimeout(() => {
        setActiveTab('login');
      }, 1000);
    } catch (error: unknown) {
      console.error('注册失败:', error);
      const err = error as Error;

      // 根据不同的错误类型给出详细的提示
      if (err.message.includes('未配置')) {
        message.error({
          content: (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>❌ 配置缺失</div>
              <div>请先在设置页面配置 Supabase API Key</div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                点击下方"配置 API Keys"链接进行配置
              </div>
            </div>
          ),
          duration: 6,
        });
      } else if (err.message.includes('User already registered') || err.message.includes('already been registered')) {
        message.warning({
          content: (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>⚠️ 邮箱已被注册</div>
              <div>该邮箱已存在账号</div>
              <div style={{ marginTop: 8, fontSize: 12 }}>
                <div>• 如果是您的账号，请直接登录</div>
                <div>• 如果忘记密码，请联系管理员重置</div>
                <div>• 或者使用其他邮箱注册</div>
              </div>
            </div>
          ),
          duration: 6,
        });
      } else if (err.message.includes('Password should be at least')) {
        message.error({
          content: (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>🔒 密码强度不足</div>
              <div>密码至少需要6个字符</div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                建议使用字母、数字和特殊字符的组合
              </div>
            </div>
          ),
          duration: 5,
        });
      } else if (err.message.includes('Invalid email')) {
        message.error({
          content: (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>📧 邮箱格式错误</div>
              <div>请输入有效的邮箱地址</div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                例如：user@example.com
              </div>
            </div>
          ),
          duration: 5,
        });
      } else if (err.message.includes('Signup rate limit exceeded')) {
        message.warning({
          content: (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>⏱️ 注册过于频繁</div>
              <div>请稍后再试</div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                为了防止滥用，请等待几分钟后重试
              </div>
            </div>
          ),
          duration: 5,
        });
      } else {
        message.error({
          content: (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 8 }}>❌ 注册失败</div>
              <div>{err.message}</div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
                如果问题持续存在，请联系技术支持
              </div>
            </div>
          ),
          duration: 6,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loginForm = (
    <Form name="login" onFinish={handleLogin} autoComplete="off" size="large">
      <Form.Item
        name="email"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="邮箱" />
      </Form.Item>

      <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
        <Input.Password prefix={<LockOutlined />} placeholder="密码" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          登录
        </Button>
      </Form.Item>
    </Form>
  );

  const registerForm = (
    <Form name="register" onFinish={handleRegister} autoComplete="off" size="large">
      <Form.Item
        name="email"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="邮箱" />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          { required: true, message: '请输入密码' },
          { min: 6, message: '密码至少6位' },
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="密码（至少6位）" />
      </Form.Item>

      <Form.Item
        name="confirm"
        dependencies={['password']}
        rules={[
          { required: true, message: '请确认密码' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('两次输入的密码不一致'));
            },
          }),
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          注册
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
          <h1>AI Web Planner</h1>
          <p>智能旅行规划助手</p>
        </div>

        {!isConfigured() && (
          <Alert
            message="首次使用提示"
            description={
              <div>
                请先前往 <Link to={ROUTES.SETTINGS}>设置页面</Link> 配置 Supabase API Key，
                然后返回此页面进行注册或登录。
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Card className="login-card">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            items={[
              {
                key: 'login',
                label: '登录',
                children: loginForm,
              },
              {
                key: 'register',
                label: '注册',
                children: registerForm,
              },
            ]}
          />

          <div className="login-footer">
            <Link to={ROUTES.SETTINGS}>配置 API Keys</Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;

