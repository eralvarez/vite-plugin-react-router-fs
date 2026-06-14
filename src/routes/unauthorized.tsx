import { Link, useSearchParams } from 'react-router';

export default function UnauthorizedPage() {
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from') ?? '/admin';

  return (
    <div data-testid="page-unauthorized">
      <h1 className="page-heading" style={{ color: '#fb923c' }}>Access Denied</h1>
      <p style={{ color: '#cbd5e1', marginBottom: '1rem' }}>
        The admin guard redirected you here because you do not have the required role.
      </p>
      <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        Attempted path: <code style={{ color: '#93c5fd' }}>{from}</code>
      </p>
      <Link to={`${from}?role=admin`} className="btn btn-orange">
        Simulate Admin Role (role=admin)
      </Link>
    </div>
  );
}
