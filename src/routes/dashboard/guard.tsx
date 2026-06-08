import { Outlet, Navigate, useSearchParams } from 'react-router';

/**
 * Dashboard Guard
 *
 * For testability, authentication is simulated via the `?auth=true` search param
 * or a `auth` key in localStorage.
 * In a real app, replace this with your actual auth check (e.g. a context/hook).
 */
export default function DashboardGuard() {
  console.log('[DashboardGuard] Checking authentication');
  const [searchParams] = useSearchParams();

  const isAuthenticated =
    searchParams.get('auth') === 'true' || (typeof window !== 'undefined' && localStorage.getItem('auth') === 'true');

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`} replace />;
  }

  return <Outlet />;
}
