import { Link } from 'react-router';
import { useSearchParams } from 'react-router';

export default function SettingsIndex() {
  const [searchParams] = useSearchParams();
  const authParam = searchParams.get('auth')
    ? `?auth=${searchParams.get('auth')}`
    : '';

  return (
    <div data-testid="page-dashboard-settings">
      <h1 className="mb-4 text-3xl font-bold text-green-400">Settings</h1>
      <p className="mb-6 text-slate-300">
        Route:{' '}
        <code className="text-blue-300">
          src/routes/dashboard/settings/index.tsx
        </code>
      </p>
      <div className="space-y-3">
        <Link
          to={`/dashboard/settings/account${authParam}`}
          className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-4 hover:border-slate-500"
        >
          <div>
            <p className="font-medium text-white">Account</p>
            <p className="text-sm text-slate-400">
              Manage your account details
            </p>
          </div>
          <span className="text-slate-400">→</span>
        </Link>
        <Link
          to={`/dashboard/settings/security${authParam}`}
          className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-4 hover:border-slate-500"
        >
          <div>
            <p className="font-medium text-white">Security</p>
            <p className="text-sm text-slate-400">
              Password and two-factor auth
            </p>
          </div>
          <span className="text-slate-400">→</span>
        </Link>
      </div>
    </div>
  );
}
