import { Link } from 'react-router';
import { useSearchParams } from 'react-router';

export default function DashboardIndex() {
  const [searchParams] = useSearchParams();
  const authParam = searchParams.get('auth')
    ? `?auth=${searchParams.get('auth')}`
    : '';

  return (
    <div data-testid="page-dashboard">
      <h1 className="mb-4 text-3xl font-bold text-green-400">
        Dashboard Overview
      </h1>
      <p className="mb-6 text-slate-300">
        You are authenticated. Route:{' '}
        <code className="text-blue-300">src/routes/dashboard/index.tsx</code>
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
          <p className="text-sm text-slate-400">Total Posts</p>
          <p className="text-2xl font-bold text-white">42</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
          <p className="text-sm text-slate-400">Views</p>
          <p className="text-2xl font-bold text-white">1,337</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
          <p className="text-sm text-slate-400">Comments</p>
          <p className="text-2xl font-bold text-white">99</p>
        </div>
      </div>
      <div className="mt-6 flex gap-4">
        <Link
          to={`/dashboard/profile${authParam}`}
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          View Profile
        </Link>
        <Link
          to={`/dashboard/settings${authParam}`}
          className="rounded bg-slate-700 px-4 py-2 text-white hover:bg-slate-600"
        >
          Settings
        </Link>
      </div>
    </div>
  );
}
