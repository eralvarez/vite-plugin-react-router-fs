import { Outlet, NavLink, useSearchParams } from 'react-router';

export default function AdminLayout() {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role') ? `?role=${searchParams.get('role')}` : '';

  return (
    <div data-testid="admin-layout">
      <div className="subnav-admin">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span className="badge badge-red">ADMIN</span>
          <span style={{ fontWeight: 600, color: '#f87171' }}>Admin Panel</span>
        </div>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <NavLink
            to={`/admin${roleParam}`}
            end
            className={({ isActive }) => (isActive ? 'nav-link active-red' : 'nav-link')}
          >
            Overview
          </NavLink>
          <NavLink
            to={`/admin/users${roleParam}`}
            className={({ isActive }) => (isActive ? 'nav-link active-red' : 'nav-link')}
          >
            Users
          </NavLink>
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
