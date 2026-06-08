import { Link, useSearchParams } from 'react-router';

export default function AccountSettings() {
  const [searchParams] = useSearchParams();
  const authParam = searchParams.get('auth') ? `?auth=${searchParams.get('auth')}` : '';

  return (
    <div data-testid="page-dashboard-settings-account">
      <h1 className="mb-4 text-3xl font-bold text-green-400">Account Settings</h1>
      <p className="mb-6 text-slate-300">
        Route: <code className="text-blue-300">src/routes/dashboard/settings/account.tsx</code>
      </p>
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
        <label className="mb-4 block">
          <span className="mb-1 block text-sm text-slate-400">Display Name</span>
          <input
            type="text"
            defaultValue="Demo User"
            className="w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-white"
          />
        </label>
        <label className="mb-4 block">
          <span className="mb-1 block text-sm text-slate-400">Email</span>
          <input
            type="email"
            defaultValue="demo@example.com"
            className="w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-white"
          />
        </label>
      </div>
      <Link to={`/dashboard/settings${authParam}`} className="mt-4 inline-block text-blue-400 underline">
        Back to Settings
      </Link>
    </div>
  );
}
