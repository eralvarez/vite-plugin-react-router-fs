import { Outlet, NavLink } from 'react-router';

export default function BlogLayout() {
  return (
    <div data-testid="blog-layout">
      <div className="subnav-blog">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#c084fc' }}>Blog</h2>
        <NavLink
          to="/blog"
          end
          className={({ isActive }) => (isActive ? 'nav-link active-purple' : 'nav-link')}
        >
          All Posts
        </NavLink>
        <NavLink
          to="/blog/getting-started"
          className={({ isActive }) => (isActive ? 'nav-link active-purple' : 'nav-link')}
        >
          Getting Started
        </NavLink>
        <NavLink
          to="/blog/advanced-routing"
          className={({ isActive }) => (isActive ? 'nav-link active-purple' : 'nav-link')}
        >
          Advanced Routing
        </NavLink>
      </div>
      <Outlet />
    </div>
  );
}
