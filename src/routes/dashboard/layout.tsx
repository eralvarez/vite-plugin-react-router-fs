import { Outlet, NavLink } from 'react-router';
import { useSearchParams } from 'react-router';

export default function DashboardLayout() {
  const [searchParams] = useSearchParams();
  const authParam = searchParams.get('auth')
    ? `?auth=${searchParams.get('auth')}`
    : '';

  return (
    <div data-testid="dashboard-layout">
      <div className="mb-6 flex items-center gap-4 rounded-lg border border-slate-700 bg-slate-800 p-4">
        <span className="font-semibold text-green-400">Dashboard</span>
        <NavLink
          to={`/dashboard${authParam}`}
          end
          className={({ isActive }) =>
            isActive
              ? 'text-green-400 font-medium text-sm'
              : 'text-slate-400 hover:text-slate-200 text-sm'
          }
        >
          Overview
        </NavLink>
        <NavLink
          to={`/dashboard/profile${authParam}`}
          className={({ isActive }) =>
            isActive
              ? 'text-green-400 font-medium text-sm'
              : 'text-slate-400 hover:text-slate-200 text-sm'
          }
        >
          Profile
        </NavLink>
        <NavLink
          to={`/dashboard/settings${authParam}`}
          className={({ isActive }) =>
            isActive
              ? 'text-green-400 font-medium text-sm'
              : 'text-slate-400 hover:text-slate-200 text-sm'
          }
        >
          Settings
        </NavLink>
      </div>
      <Outlet />
    </div>
  );
}
