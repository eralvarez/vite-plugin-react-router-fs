import { Link, useSearchParams } from 'react-router';

export default function UnauthorizedPage() {
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from') ?? '/admin';

  return (
    <div data-testid="page-unauthorized">
      <h1 className="mb-4 text-3xl font-bold text-orange-400">Access Denied</h1>
      <p className="mb-4 text-slate-300">
        The admin guard redirected you here because you do not have the required role.
      </p>
      <p className="mb-6 text-slate-400 text-sm">
        Attempted path: <code className="text-blue-300">{from}</code>
      </p>
      <Link
        to={`${from}?role=admin`}
        className="rounded bg-orange-500 px-4 py-2 text-black font-medium hover:bg-orange-400"
      >
        Simulate Admin Role (role=admin)
      </Link>
    </div>
  );
}
