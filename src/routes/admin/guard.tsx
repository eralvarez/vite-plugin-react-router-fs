import { Outlet, Navigate, useSearchParams } from 'react-router';

/**
 * Admin Guard
 *
 * For testability, admin access is simulated via the `?role=admin` search param
 * or a `role=admin` key in localStorage.
 * In a real app, replace this with your actual role check.
 */
export default function AdminGuard() {
  const [searchParams] = useSearchParams();

  const isAdmin =
    searchParams.get('role') === 'admin' || (typeof window !== 'undefined' && localStorage.getItem('role') === 'admin');

  if (!isAdmin) {
    return <Navigate to={`/unauthorized?from=${encodeURIComponent(window.location.pathname)}`} replace />;
  }

  return <Outlet />;
}
