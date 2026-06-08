/**
 * /pricing — lives inside (marketing) group.
 * URL is /pricing, not /(marketing)/pricing.
 */
export default function PricingPage() {
  return (
    <main data-testid="page-pricing">
      <h1>Pricing</h1>
      <p>This page is part of the (marketing) route group.</p>
    </main>
  );
}
