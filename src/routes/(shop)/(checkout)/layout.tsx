import { Outlet } from 'react-router';

/**
 * Inner layout for the (checkout) group, nested inside (shop).
 * Both (shop)/layout and (checkout)/layout are rendered together.
 * URL for routes here has neither group name — e.g. /payment not /(shop)/(checkout)/payment.
 */
export default function CheckoutLayout() {
  return (
    <div data-testid="group-checkout-layout">
      <p style={{ padding: '0.25rem 1rem', background: '#fff7ed' }}>Checkout flow</p>
      <Outlet />
    </div>
  );
}
