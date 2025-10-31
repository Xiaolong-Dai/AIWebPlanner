import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
  HomeOutlined,
  CalendarOutlined,
  DollarOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import { signOut } from '../../services/auth';
import { ROUTES } from '../../constants';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      logout();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: ROUTES.DASHBOARD,
      icon: <HomeOutlined />,
      label: '首页',
      onClick: () => navigate(ROUTES.DASHBOARD),
    },
    {
      key: ROUTES.MY_PLANS,
      icon: <CalendarOutlined />,
      label: '我的行程',
      onClick: () => navigate(ROUTES.MY_PLANS),
    },
    {
      key: ROUTES.BUDGET,
      icon: <DollarOutlined />,
      label: '预算管理',
      onClick: () => navigate(ROUTES.BUDGET),
    },
    {
      key: ROUTES.SETTINGS,
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => navigate(ROUTES.SETTINGS),
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => navigate(ROUTES.SETTINGS),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 桌面端侧边栏 */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth="0"
        className="desktop-sider"
        style={{
          display: window.innerWidth <= 768 ? 'none' : 'block'
        }}
      >
        <div className="logo">
          <h2>{collapsed ? 'AI' : 'AI Planner'}</h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Header className="site-layout-header">
          <div className="header-content">
            <h1>AI Web Planner</h1>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="user-info">
                <Avatar icon={<UserOutlined />} />
                <span className="user-email">{user?.email}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ margin: '0' }}>
          <Outlet />
        </Content>

        {/* 移动端底部导航 */}
        {window.innerWidth <= 768 && (
          <div className="mobile-bottom-nav">
            <button
              className={`mobile-nav-item ${location.pathname === ROUTES.DASHBOARD ? 'active' : ''}`}
              onClick={() => navigate(ROUTES.DASHBOARD)}
            >
              <HomeOutlined />
              <span>首页</span>
            </button>
            <button
              className={`mobile-nav-item ${location.pathname === ROUTES.MY_PLANS ? 'active' : ''}`}
              onClick={() => navigate(ROUTES.MY_PLANS)}
            >
              <CalendarOutlined />
              <span>行程</span>
            </button>
            <button
              className={`mobile-nav-item ${location.pathname === ROUTES.BUDGET ? 'active' : ''}`}
              onClick={() => navigate(ROUTES.BUDGET)}
            >
              <DollarOutlined />
              <span>预算</span>
            </button>
            <button
              className={`mobile-nav-item ${location.pathname === ROUTES.SETTINGS ? 'active' : ''}`}
              onClick={() => navigate(ROUTES.SETTINGS)}
            >
              <SettingOutlined />
              <span>设置</span>
            </button>
          </div>
        )}
      </Layout>
    </Layout>
  );
};

export default MainLayout;

