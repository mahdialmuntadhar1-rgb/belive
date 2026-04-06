import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If true, only business_owner role is allowed (redirects others to /) */
  requireBusinessOwner?: boolean;
}

/**
 * Wraps a route so it requires authentication.
 * While auth is loading → shows nothing (prevents flash of protected content).
 * If not authenticated → redirects to /.
 * If requireBusinessOwner and role is not business_owner → redirects to /.
 */
export default function ProtectedRoute({ children, requireBusinessOwner = false }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuthStore();

  // Auth is still initializing — render nothing to prevent flash
  if (loading) {
    return null;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Role check: business_owner required
  if (requireBusinessOwner && profile?.role !== 'business_owner') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
