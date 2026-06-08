import { Navigate, Outlet, useSearchParams } from 'react-router';

/**
 * Members Guard
 *
 * Requires ?member=true to access any route in the (members) group.
 * Redirects to /login otherwise.
 */
export default function MembersGuard() {
  const [searchParams] = useSearchParams();

  const isMember =
    searchParams.get('member') === 'true' ||
    (typeof window !== 'undefined' && localStorage.getItem('member') === 'true');

  if (!isMember) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`} replace />;
  }

  return <Outlet />;
}
