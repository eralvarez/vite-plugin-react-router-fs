import { Link } from 'react-router';

export default function HomePage() {
  return (
    <div data-testid="page-home">
      <h1 className="mb-4 text-4xl font-bold text-blue-400">Welcome Home</h1>
      <p className="mb-6 text-slate-300">
        This is the home page, served at{' '}
        <code className="text-blue-300">/</code>.
      </p>
      <div className="flex gap-4">
        <Link
          to="/about"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          About Us
        </Link>
        <Link
          to="/blog"
          className="rounded bg-slate-700 px-4 py-2 text-white hover:bg-slate-600"
        >
          Read Blog
        </Link>
        <Link
          to="/dashboard"
          className="rounded bg-slate-700 px-4 py-2 text-white hover:bg-slate-600"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
