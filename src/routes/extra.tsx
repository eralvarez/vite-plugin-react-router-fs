import { Link } from 'react-router';

export default function ExtraPage() {
  return (
    <div data-testid="page-extra">
      <h1 className="mb-4 text-3xl font-bold text-blue-400">Extra</h1>
      <p className="mb-4 text-slate-300">
        This page lives at <code className="text-blue-300">/extra</code>. It is a simple flat route file —{' '}
        <code className="text-blue-300">src/routes/extra.tsx</code>.
      </p>
      <p className="mb-6 text-slate-400">
        The root <code>layout.tsx</code> wraps this page, so the navigation bar above is always visible.
      </p>
      <Link to="/" className="text-blue-400 underline">
        Back to Home
      </Link>
    </div>
  );
}
