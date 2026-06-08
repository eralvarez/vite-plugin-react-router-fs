/**
 * /payment — inside (shop)/(checkout), both group names stripped from the URL.
 * Wrapped by both group-shop-layout and group-checkout-layout.
 */
export default function PaymentPage() {
  return (
    <main data-testid="page-payment">
      <h1>Payment</h1>
      <p>Nested group route: (shop)/(checkout)/payment.tsx → /payment</p>
    </main>
  );
}
