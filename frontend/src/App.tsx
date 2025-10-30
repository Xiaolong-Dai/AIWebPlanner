import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useAuthStore } from './store/authStore';
import { onAuthStateChange } from './services/auth';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import WelcomeGuide from './components/WelcomeGuide';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyPlans from './pages/MyPlans';
import Budget from './pages/Budget';
import Settings from './pages/Settings';
import PlanCreate from './pages/PlanCreate';
import PlanDetail from './pages/PlanDetail';
import PlanEdit from './pages/PlanEdit';
import { ROUTES } from './constants';
import './App.css';

function App() {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    // 监听认证状态变化
    try {
      const subscription = onAuthStateChange((user) => {
        setUser(user);
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.warn('Supabase 未配置，请在设置页面配置 API Key:', error);
      // 不阻止应用启动，用户可以访问设置页面进行配置
    }
  }, [setUser]);

  return (
    <ErrorBoundary>
      <ConfigProvider locale={zhCN}>
        <BrowserRouter>
          <WelcomeGuide />
          <Routes>
          {/* 公开路由 */}
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.SETTINGS} element={<Settings />} />

          {/* 受保护的路由 */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
            <Route path={ROUTES.MY_PLANS} element={<MyPlans />} />
            <Route path={ROUTES.BUDGET} element={<Budget />} />
            <Route path={ROUTES.PLAN_CREATE} element={<PlanCreate />} />
            <Route path={ROUTES.PLAN_DETAIL} element={<PlanDetail />} />
            <Route path={ROUTES.PLAN_EDIT} element={<PlanEdit />} />
          </Route>

          {/* 默认重定向 */}
          <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
        </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;
