import { Outlet, NavLink } from 'react-router';

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header data-testid="root-layout-header" className="border-b border-slate-700 bg-slate-800">
        <nav className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
          <span className="text-lg font-bold text-blue-400">MyApp</span>
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'text-blue-400 font-medium' : 'text-slate-300 hover:text-white')}
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => (isActive ? 'text-blue-400 font-medium' : 'text-slate-300 hover:text-white')}
          >
            About
          </NavLink>
          <NavLink
            to="/blog"
            className={({ isActive }) => (isActive ? 'text-blue-400 font-medium' : 'text-slate-300 hover:text-white')}
          >
            Blog
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? 'text-blue-400 font-medium' : 'text-slate-300 hover:text-white')}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) => (isActive ? 'text-blue-400 font-medium' : 'text-slate-300 hover:text-white')}
          >
            Admin
          </NavLink>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
