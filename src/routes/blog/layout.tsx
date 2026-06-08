import { Outlet, NavLink } from 'react-router';

export default function BlogLayout() {
  return (
    <div data-testid="blog-layout">
      <div className="mb-6 flex items-center gap-4 border-b border-slate-700 pb-4">
        <h2 className="text-xl font-semibold text-purple-400">Blog</h2>
        <NavLink
          to="/blog"
          end
          className={({ isActive }) =>
            isActive
              ? 'text-purple-400 font-medium text-sm'
              : 'text-slate-400 hover:text-slate-200 text-sm'
          }
        >
          All Posts
        </NavLink>
        <NavLink
          to="/blog/getting-started"
          className={({ isActive }) =>
            isActive
              ? 'text-purple-400 font-medium text-sm'
              : 'text-slate-400 hover:text-slate-200 text-sm'
          }
        >
          Getting Started
        </NavLink>
        <NavLink
          to="/blog/advanced-routing"
          className={({ isActive }) =>
            isActive
              ? 'text-purple-400 font-medium text-sm'
              : 'text-slate-400 hover:text-slate-200 text-sm'
          }
        >
          Advanced Routing
        </NavLink>
      </div>
      <Outlet />
    </div>
  );
}
