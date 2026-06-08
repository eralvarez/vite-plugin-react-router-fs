/**
 * /beta-features — guarded by (beta)/guard.tsx, no layout.
 * Demonstrates a guard-only group (no layout.tsx in the group).
 */
export default function BetaFeaturesPage() {
  return (
    <main data-testid="page-beta-features">
      <h1>Beta Features</h1>
      <p>You have beta access.</p>
    </main>
  );
}
