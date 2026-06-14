import { Outlet, NavLink, useSearchParams } from 'react-router';

export default function DashboardLayout() {
  const [searchParams] = useSearchParams();
  const authParam = searchParams.get('auth') ? `?auth=${searchParams.get('auth')}` : '';

  return (
    <div data-testid="dashboard-layout">
      <div className="subnav">
        <span style={{ fontWeight: 600, color: '#4ade80' }}>Dashboard</span>
        <NavLink
          to={`/dashboard${authParam}`}
          end
          className={({ isActive }) => (isActive ? 'nav-link active-green' : 'nav-link')}
        >
          Overview
        </NavLink>
        <NavLink
          to={`/dashboard/profile${authParam}`}
          className={({ isActive }) => (isActive ? 'nav-link active-green' : 'nav-link')}
        >
          Profile
        </NavLink>
        <NavLink
          to={`/dashboard/settings${authParam}`}
          className={({ isActive }) => (isActive ? 'nav-link active-green' : 'nav-link')}
        >
          Settings
        </NavLink>
      </div>
      <Outlet />
    </div>
  );
}
