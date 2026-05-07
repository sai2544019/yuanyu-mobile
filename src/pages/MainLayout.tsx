import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const TABS = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/messages', label: '消息', icon: '💬' },
  { path: '/communities', label: '社群', icon: '👥' },
  { path: '/profile', label: '我的', icon: '👤' },
];

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Outlet />
      </div>
      <nav className="tabbar">
        {TABS.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <div
              key={tab.path}
              className={`tabbar-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(tab.path)}
              style={{ position: 'relative' }}
            >
              <span className="icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
