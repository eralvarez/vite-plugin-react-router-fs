import { Outlet } from 'react-router';

/**
 * Outer layout for the (shop) group.
 * Wraps all routes under (shop), including nested groups like (checkout).
 */
export default function ShopLayout() {
  return (
    <div data-testid="group-shop-layout">
      <nav style={{ padding: '0.5rem 1rem', background: '#fefce8' }}>
        <strong>Shop</strong>
      </nav>
      <Outlet />
    </div>
  );
}
