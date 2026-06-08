import { Navigate, Outlet, useSearchParams } from 'react-router';

/**
 * Beta Guard
 *
 * Requires ?beta=true to access any route in the (beta) group.
 * Redirects to /unauthorized otherwise — no layout, guard only.
 */
export default function BetaGuard() {
  const [searchParams] = useSearchParams();

  const isBeta =
    searchParams.get('beta') === 'true' || (typeof window !== 'undefined' && localStorage.getItem('beta') === 'true');

  if (!isBeta) {
    return <Navigate to={`/unauthorized?from=${encodeURIComponent(window.location.pathname)}`} replace />;
  }

  return <Outlet />;
}
