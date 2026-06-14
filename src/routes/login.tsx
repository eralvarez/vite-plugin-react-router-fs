import { Link, useSearchParams } from 'react-router';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/dashboard';

  return (
    <div data-testid="page-login">
      <h1 className="page-heading" style={{ color: '#facc15' }}>Login Required</h1>
      <p style={{ color: '#cbd5e1', marginBottom: '1rem' }}>
        The dashboard guard redirected you here because you are not authenticated.
      </p>
      <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        Redirect target: <code style={{ color: '#93c5fd' }}>{redirect}</code>
      </p>
      <Link to={`${redirect}?auth=true`} className="btn btn-yellow">
        Simulate Login (auth=true)
      </Link>
    </div>
  );
}
