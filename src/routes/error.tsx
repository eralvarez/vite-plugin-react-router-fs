import { useRouteError } from 'react-router';

/**
 * Root-level error boundary (src/routes/error.tsx).
 *
 * Catches any unhandled error from the entire application.
 * Rendered by React Router when an error propagates to the top level.
 */
export default function RootErrorBoundary() {
  const error = useRouteError();
  const message =
    error instanceof Error ? error.message : 'An unexpected error occurred.';

  return (
    <div data-testid="root-error-boundary">
      <h1>Something went wrong</h1>
      <p data-testid="root-error-message">{message}</p>
    </div>
  );
}
