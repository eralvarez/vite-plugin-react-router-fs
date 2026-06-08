/**
 * /dashboard/crash — a route that intentionally throws on render.
 * Used to exercise the dashboard error boundary in e2e tests.
 *
 * Add ?auth=true to pass the dashboard guard.
 */
export default function CrashPage() {
  throw new Error('Intentional crash for error boundary testing');
}
