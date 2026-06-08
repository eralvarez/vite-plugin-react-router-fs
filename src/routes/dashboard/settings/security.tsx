import { Link, useSearchParams } from 'react-router';

export default function SecuritySettings() {
  const [searchParams] = useSearchParams();
  const authParam = searchParams.get('auth')
    ? `?auth=${searchParams.get('auth')}`
    : '';

  return (
    <div data-testid="page-dashboard-settings-security">
      <h1 className="mb-4 text-3xl font-bold text-green-400">
        Security Settings
      </h1>
      <p className="mb-6 text-slate-300">
        Route:{' '}
        <code className="text-blue-300">
          src/routes/dashboard/settings/security.tsx
        </code>
      </p>
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-white">Two-Factor Authentication</p>
            <p className="text-sm text-slate-400">
              Add an extra layer of security
            </p>
          </div>
          <button className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700">
            Enable
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-white">Change Password</p>
            <p className="text-sm text-slate-400">Last changed 30 days ago</p>
          </div>
          <button className="rounded bg-slate-700 px-3 py-1 text-sm text-white hover:bg-slate-600">
            Change
          </button>
        </div>
      </div>
      <Link
        to={`/dashboard/settings${authParam}`}
        className="mt-4 inline-block text-blue-400 underline"
      >
        Back to Settings
      </Link>
    </div>
  );
}
