import { Outlet, NavLink } from 'react-router';

export default function RootLayout() {
  return (
    <div className="app-shell">
      <header data-testid="root-layout-header" className="app-header">
        <nav className="app-nav">
          <span className="nav-brand">MyApp</span>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Home
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            About
          </NavLink>
          <NavLink to="/blog" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Blog
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Dashboard
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Admin
          </NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
