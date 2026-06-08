/**
 * /features — second route inside the (marketing) group.
 * Shares the marketing layout without any guard.
 */
export default function FeaturesPage() {
  return (
    <main data-testid="page-features">
      <h1>Features</h1>
      <p>This page is part of the (marketing) route group.</p>
    </main>
  );
}
