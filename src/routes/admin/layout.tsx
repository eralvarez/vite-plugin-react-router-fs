import { Outlet, NavLink, useSearchParams } from 'react-router';

export default function AdminLayout() {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role') ? `?role=${searchParams.get('role')}` : '';

  return (
    <div data-testid="admin-layout">
      <div className="mb-6 rounded-lg border border-red-800 bg-red-950/40 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">ADMIN</span>
          <span className="font-semibold text-red-400">Admin Panel</span>
        </div>
        <nav className="flex gap-4">
          <NavLink
            to={`/admin${roleParam}`}
            end
            className={({ isActive }) =>
              isActive ? 'text-red-400 font-medium text-sm' : 'text-slate-400 hover:text-slate-200 text-sm'
            }
          >
            Overview
          </NavLink>
          <NavLink
            to={`/admin/users${roleParam}`}
            className={({ isActive }) =>
              isActive ? 'text-red-400 font-medium text-sm' : 'text-slate-400 hover:text-slate-200 text-sm'
            }
          >
            Users
          </NavLink>
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
