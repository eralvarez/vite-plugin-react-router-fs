import { Link, useSearchParams } from 'react-router';

export default function ProfilePage() {
  const [searchParams] = useSearchParams();
  const authParam = searchParams.get('auth') ? `?auth=${searchParams.get('auth')}` : '';

  return (
    <div data-testid="page-dashboard-profile">
      <h1 className="page-heading" style={{ color: '#4ade80' }}>Profile</h1>
      <p style={{ color: '#cbd5e1', marginBottom: '1rem' }}>
        Route: <code style={{ color: '#93c5fd' }}>src/routes/dashboard/profile.tsx</code>
      </p>
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div className="avatar">U</div>
          <div>
            <p style={{ fontWeight: 600, color: '#fff' }}>Demo User</p>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>demo@example.com</p>
          </div>
        </div>
        <p style={{ color: '#cbd5e1' }}>Member since January 2026</p>
      </div>
      <Link to={`/dashboard${authParam}`}>Back to Dashboard</Link>
    </div>
  );
}
