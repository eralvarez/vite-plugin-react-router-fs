import { Link, useSearchParams } from 'react-router';

export default function AccountSettings() {
  const [searchParams] = useSearchParams();
  const authParam = searchParams.get('auth') ? `?auth=${searchParams.get('auth')}` : '';

  return (
    <div data-testid="page-dashboard-settings-account">
      <h1 className="page-heading" style={{ color: '#4ade80' }}>Account Settings</h1>
      <p style={{ color: '#cbd5e1', marginBottom: '1.5rem' }}>
        Route: <code style={{ color: '#93c5fd' }}>src/routes/dashboard/settings/account.tsx</code>
      </p>
      <div className="card" style={{ padding: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          <span className="form-label">Display Name</span>
          <input type="text" defaultValue="Demo User" className="form-input" />
        </label>
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          <span className="form-label">Email</span>
          <input type="email" defaultValue="demo@example.com" className="form-input" />
        </label>
      </div>
      <Link to={`/dashboard/settings${authParam}`} style={{ display: 'inline-block', marginTop: '1rem' }}>
        Back to Settings
      </Link>
    </div>
  );
}
