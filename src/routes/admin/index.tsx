import { Link, useSearchParams } from 'react-router';

export default function AdminIndex() {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role') ? `?role=${searchParams.get('role')}` : '';

  return (
    <div data-testid="page-admin">
      <h1 className="page-heading" style={{ color: '#f87171' }}>Admin Overview</h1>
      <p style={{ color: '#cbd5e1', marginBottom: '1.5rem' }}>
        Route: <code style={{ color: '#93c5fd' }}>src/routes/admin/index.tsx</code>
        <br />
        Protected by <code style={{ color: '#93c5fd' }}>src/routes/admin/guard.tsx</code>.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div className="card card-admin">
          <p className="stat-label">Total Users</p>
          <p className="stat-value">256</p>
        </div>
        <div className="card card-admin">
          <p className="stat-label">Active Sessions</p>
          <p className="stat-value">12</p>
        </div>
      </div>
      <Link to={`/admin/users${roleParam}`} className="btn btn-red" style={{ marginTop: '1.5rem' }}>
        Manage Users
      </Link>
    </div>
  );
}
