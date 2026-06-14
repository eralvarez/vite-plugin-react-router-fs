import { Link, useSearchParams } from 'react-router';

export default function DashboardIndex() {
  const [searchParams] = useSearchParams();
  const authParam = searchParams.get('auth') ? `?auth=${searchParams.get('auth')}` : '';

  return (
    <div data-testid="page-dashboard">
      <h1 className="page-heading" style={{ color: '#4ade80' }}>Dashboard Overview</h1>
      <p style={{ color: '#cbd5e1', marginBottom: '1.5rem' }}>
        You are authenticated. Route: <code style={{ color: '#93c5fd' }}>src/routes/dashboard/index.tsx</code>
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="card">
          <p className="stat-label">Total Posts</p>
          <p className="stat-value">42</p>
        </div>
        <div className="card">
          <p className="stat-label">Views</p>
          <p className="stat-value">1,337</p>
        </div>
        <div className="card">
          <p className="stat-label">Comments</p>
          <p className="stat-value">99</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <Link to={`/dashboard/profile${authParam}`} className="btn btn-green">
          View Profile
        </Link>
        <Link to={`/dashboard/settings${authParam}`} className="btn btn-ghost">
          Settings
        </Link>
      </div>
    </div>
  );
}
