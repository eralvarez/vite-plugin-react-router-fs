import { Link, useSearchParams } from 'react-router';

export default function AdminIndex() {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role') ? `?role=${searchParams.get('role')}` : '';

  return (
    <div data-testid="page-admin">
      <h1 className="mb-4 text-3xl font-bold text-red-400">Admin Overview</h1>
      <p className="mb-6 text-slate-300">
        Route: <code className="text-blue-300">src/routes/admin/index.tsx</code>
        <br />
        Protected by <code className="text-blue-300">src/routes/admin/guard.tsx</code>.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-red-800 bg-red-950/30 p-4">
          <p className="text-sm text-slate-400">Total Users</p>
          <p className="text-2xl font-bold text-white">256</p>
        </div>
        <div className="rounded-lg border border-red-800 bg-red-950/30 p-4">
          <p className="text-sm text-slate-400">Active Sessions</p>
          <p className="text-2xl font-bold text-white">12</p>
        </div>
      </div>
      <Link
        to={`/admin/users${roleParam}`}
        className="mt-6 inline-block rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        Manage Users
      </Link>
    </div>
  );
}
