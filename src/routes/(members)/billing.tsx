/**
 * /billing — guarded by (members)/guard.tsx, wrapped by (members)/layout.tsx.
 * URL is /billing, not /(members)/billing.
 */
export default function BillingPage() {
  return (
    <main data-testid="page-billing">
      <h1>Billing</h1>
      <p>Member-only billing page.</p>
    </main>
  );
}
