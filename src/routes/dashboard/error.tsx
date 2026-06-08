import { useRouteError } from 'react-router';

/**
 * Dashboard-scoped error boundary (src/routes/dashboard/error.tsx).
 *
 * Catches errors thrown anywhere inside the /dashboard/* subtree,
 * including errors from the guard, layout, and route components.
 * Does NOT affect routes outside /dashboard.
 */
export default function DashboardErrorBoundary() {
  const error = useRouteError();
  const message =
    error instanceof Error ? error.message : 'Dashboard error occurred.';

  return (
    <div data-testid="dashboard-error-boundary">
      <h2>Dashboard Error</h2>
      <p data-testid="dashboard-error-message">{message}</p>
    </div>
  );
}
