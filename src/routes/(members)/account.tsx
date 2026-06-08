/**
 * /account — guarded by (members)/guard.tsx, wrapped by (members)/layout.tsx.
 * URL is /account, not /(members)/account.
 */
export default function AccountPage() {
  return (
    <main data-testid="page-account">
      <h1>My Account</h1>
      <p>Member-only account page.</p>
    </main>
  );
}
