import { useLocation } from 'react-router';
import { Link } from 'react-router';

export default function NotFound() {
  const location = useLocation();
  return (
    <div data-testid="page-not-found">
      <h1 className="mb-4 text-4xl font-bold text-red-400">404 — Not Found</h1>
      <p className="mb-4 text-slate-300">
        No route matched <code className="text-red-300">{location.pathname}</code>.
      </p>
      <p className="mb-6 text-slate-400">
        This is the catch-all route: <code className="text-blue-300">src/routes/[...slug].tsx</code>
      </p>
      <Link to="/" className="text-blue-400 underline">
        Go Home
      </Link>
    </div>
  );
}
