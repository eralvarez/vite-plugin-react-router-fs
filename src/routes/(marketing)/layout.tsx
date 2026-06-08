import { Outlet } from 'react-router';

/**
 * Layout shared by all routes inside the (marketing) group.
 * The group name never appears in the URL — routes resolve to /pricing,
 * /features, etc. — but they all share this layout shell.
 */
export default function MarketingLayout() {
  return (
    <div data-testid="marketing-layout">
      <nav style={{ padding: '0.5rem 1rem', background: '#f0fdf4' }}>
        <strong>Marketing</strong>
      </nav>
      <Outlet />
    </div>
  );
}
