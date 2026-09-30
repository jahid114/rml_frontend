import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/use-auth';

export default function RequireAuth() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) return <Navigate to="/admin/login" replace />;

  return <Outlet />;
}
