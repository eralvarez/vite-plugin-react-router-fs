import { Link } from 'react-router';
import { useSearchParams } from 'react-router';

export default function ProfilePage() {
  const [searchParams] = useSearchParams();
  const authParam = searchParams.get('auth')
    ? `?auth=${searchParams.get('auth')}`
    : '';

  return (
    <div data-testid="page-dashboard-profile">
      <h1 className="mb-4 text-3xl font-bold text-green-400">Profile</h1>
      <p className="mb-4 text-slate-300">
        Route:{' '}
        <code className="text-blue-300">src/routes/dashboard/profile.tsx</code>
      </p>
      <div className="mb-6 rounded-lg border border-slate-700 bg-slate-800 p-6">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-2xl font-bold text-white">
            U
          </div>
          <div>
            <p className="font-semibold text-white">Demo User</p>
            <p className="text-sm text-slate-400">demo@example.com</p>
          </div>
        </div>
        <p className="text-slate-300">Member since January 2026</p>
      </div>
      <Link to={`/dashboard${authParam}`} className="text-blue-400 underline">
        Back to Dashboard
      </Link>
    </div>
  );
}
