import { Link, useSearchParams } from 'react-router';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/dashboard';

  return (
    <div data-testid="page-login">
      <h1 className="mb-4 text-3xl font-bold text-yellow-400">
        Login Required
      </h1>
      <p className="mb-4 text-slate-300">
        The dashboard guard redirected you here because you are not
        authenticated.
      </p>
      <p className="mb-6 text-slate-400 text-sm">
        Redirect target: <code className="text-blue-300">{redirect}</code>
      </p>
      <Link
        to={`${redirect}?auth=true`}
        className="rounded bg-yellow-500 px-4 py-2 text-black font-medium hover:bg-yellow-400"
      >
        Simulate Login (auth=true)
      </Link>
    </div>
  );
}
