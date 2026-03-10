import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AuthPage from './AuthPage';
import { StudentProvider } from '@/contexts/StudentContext';
import AppLayout from '@/layouts/AppLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Dashboard from './Dashboard';
import NotesPage from './NotesPage';
import PlanningPage from './PlanningPage';
import ClassementPage from './ClassementPage';
import RessourcesPage from './RessourcesPage';
import ProfilPage from './ProfilPage';

const HubRoutes = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  if (loading) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center gap-4 text-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Connexion…</p>
      </div>
    );
  }

  if (!user) {
    return path === '/' ? <AuthPage /> : <Navigate to="/" replace />;
  }

  if (path === '/' || path === '') {
    return <Navigate to="/dashboard" replace />;
  }

  const renderPage = () => {
    switch (path) {
      case '/dashboard':
        return <Dashboard />;
      case '/notes':
        return <NotesPage />;
      case '/planning':
        return <PlanningPage />;
      case '/classement':
        return <ClassementPage />;
      case '/ressources':
        return <RessourcesPage />;
      case '/profil':
        return <ProfilPage />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  };

  try {
    return (
      <ErrorBoundary>
        <StudentProvider>
          <AppLayout>
            {renderPage()}
          </AppLayout>
        </StudentProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('HubGate render error:', error);
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="rounded-2xl border border-destructive bg-card p-8 max-w-md text-center">
          <h2 className="text-xl font-bold mb-2 text-destructive">Erreur de rendu</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Erreur inconnue'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
          >
            Recharger
          </button>
        </div>
      </div>
    );
  }
};

export default HubRoutes;
