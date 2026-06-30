/**
 * Configuración de rutas de la aplicación.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import ProblemListPage from '../pages/problems/ProblemListPage';
import ProblemDetailPage from '../pages/problems/ProblemDetailPage';
import ContestListPage from '../pages/contests/ContestListPage';
import ContestDetailPage from '../pages/contests/ContestDetailPage';
import SubmissionListPage from '../pages/submissions/SubmissionListPage';
import TeamListPage from '../pages/teams/TeamListPage';
import TrainingListPage from '../pages/trainings/TrainingListPage';
import TrainingDetailPage from '../pages/trainings/TrainingDetailPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import Spinner from '../components/ui/Spinner';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <Spinner size="lg" label="Cargando aplicación..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <Spinner size="lg" label="Validando credenciales de administrador..." />
      </div>
    );
  }

  const userRole = (user as any)?.role || user?.role_name;
  if (!isAuthenticated || (userRole !== 'admin' && userRole !== 'coach')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="problems" element={<AdminRoute><ProblemListPage /></AdminRoute>} />
          <Route path="problems/:id" element={<ProblemDetailPage />} />
          <Route path="contests" element={<ContestListPage />} />
          <Route path="contests/:id" element={<ContestDetailPage />} />
          <Route path="submissions" element={<SubmissionListPage />} />
          <Route path="teams" element={<TeamListPage />} />
          <Route path="trainings" element={<TrainingListPage />} />
          <Route path="trainings/:id" element={<TrainingDetailPage />} />
          
          {/* Admin routes */}
          <Route path="admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
