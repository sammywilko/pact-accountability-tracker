import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { LoginPage } from './components/auth/LoginPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { GoalsPage, NewGoalPage, GoalDetailPage } from './components/goals/GoalsPage';
import { CheckInPage } from './components/check-in/CheckInPage';
import { ProfilePage } from './components/profile/ProfilePage';
import { BottomNav } from './components/ui/BottomNav';
import { LoadingScreen } from './components/ui';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, initialized } = useAuthStore();
  if (!initialized || loading) return <LoadingScreen message="Initializing..." />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, initialized } = useAuthStore();
  if (!initialized || loading) return <LoadingScreen message="Initializing..." />;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-black text-white">{children}<BottomNav /></div>
);

function App() {
  const { initialize, initialized } = useAuthStore();
  useEffect(() => { if (!initialized) initialize(); }, [initialize, initialized]);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
        <Route path="/" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/goals" element={<ProtectedRoute><MainLayout><GoalsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/new-goal" element={<ProtectedRoute><MainLayout><NewGoalPage /></MainLayout></ProtectedRoute>} />
        <Route path="/goal/:id" element={<ProtectedRoute><MainLayout><GoalDetailPage /></MainLayout></ProtectedRoute>} />
        <Route path="/check-in" element={<ProtectedRoute><MainLayout><CheckInPage /></MainLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;