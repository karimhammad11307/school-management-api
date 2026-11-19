import React from 'react';
import { useAuth } from './context/AuthContext';
import { useNavigate } from './context/NavigationContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { TeachersPage } from './pages/TeachersPage';
import { ClassesPage } from './pages/ClassesPage';
import { StudentsPage } from './pages/StudentsPage';
import { ImportsPage } from './pages/ImportsPage';
import { Loader2 } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { currentPath } = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs font-medium">Initializing session...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPath) {
      case '/teachers':
        return <TeachersPage />;
      case '/classes':
        return <ClassesPage />;
      case '/students':
        return <StudentsPage />;
      case '/imports':
        return <ImportsPage />;
      default:
        return <TeachersPage />;
    }
  };

  return <DashboardLayout>{renderPage()}</DashboardLayout>;
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;
