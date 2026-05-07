import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';

// Pages
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import MainLayout from './pages/MainLayout';
import DiscoverPage from './pages/DiscoverPage';
import MessagesPage from './pages/MessagesPage';
import CommunitiesPage from './pages/CommunitiesPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import CommunityDetailPage from './pages/CommunityDetailPage';
import UserDetailPage from './pages/UserDetailPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<DiscoverPage />} />
                  <Route path="messages" element={<MessagesPage />} />
                  <Route path="communities" element={<CommunitiesPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>
                <Route path="/chat/:convId" element={<ChatPage />} />
                <Route path="/community/:id" element={<CommunityDetailPage />} />
                <Route path="/user/:id" element={<UserDetailPage />} />
              </Routes>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
