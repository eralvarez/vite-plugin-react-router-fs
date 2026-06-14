import { Link, useSearchParams } from 'react-router';

export default function SecuritySettings() {
  const [searchParams] = useSearchParams();
  const authParam = searchParams.get('auth') ? `?auth=${searchParams.get('auth')}` : '';

  return (
    <div data-testid="page-dashboard-settings-security">
      <h1 className="page-heading" style={{ color: '#4ade80' }}>Security Settings</h1>
      <p style={{ color: '#cbd5e1', marginBottom: '1.5rem' }}>
        Route: <code style={{ color: '#93c5fd' }}>src/routes/dashboard/settings/security.tsx</code>
      </p>
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <p style={{ fontWeight: 500, color: '#fff' }}>Two-Factor Authentication</p>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Add an extra layer of security</p>
          </div>
          <button className="btn btn-green btn-sm">Enable</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontWeight: 500, color: '#fff' }}>Change Password</p>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Last changed 30 days ago</p>
          </div>
          <button className="btn btn-ghost btn-sm">Change</button>
        </div>
      </div>
      <Link to={`/dashboard/settings${authParam}`} style={{ display: 'inline-block', marginTop: '1rem' }}>
        Back to Settings
      </Link>
    </div>
  );
}
