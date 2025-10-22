import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import GradientBackground from './GradientBackground';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <GradientBackground><div className="flex items-center justify-center h-screen text-white">Loading...</div></GradientBackground>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
