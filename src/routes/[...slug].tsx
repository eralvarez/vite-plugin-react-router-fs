import { useLocation } from 'react-router';
import { Link } from 'react-router';

export default function NotFound() {
  const location = useLocation();
  return (
    <div data-testid="page-not-found">
      <h1 className="page-heading-xl" style={{ color: '#f87171' }}>404 — Not Found</h1>
      <p style={{ color: '#cbd5e1', marginBottom: '1rem' }}>
        No route matched <code style={{ color: '#fca5a5' }}>{location.pathname}</code>.
      </p>
      <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
        This is the catch-all route: <code style={{ color: '#93c5fd' }}>src/routes/[...slug].tsx</code>
      </p>
      <Link to="/">Go Home</Link>
    </div>
  );
}
