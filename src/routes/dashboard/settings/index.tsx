import { Link, useSearchParams } from 'react-router';

export default function SettingsIndex() {
  const [searchParams] = useSearchParams();
  const authParam = searchParams.get('auth') ? `?auth=${searchParams.get('auth')}` : '';

  return (
    <div data-testid="page-dashboard-settings">
      <h1 className="page-heading" style={{ color: '#4ade80' }}>Settings</h1>
      <p style={{ color: '#cbd5e1', marginBottom: '1.5rem' }}>
        Route: <code style={{ color: '#93c5fd' }}>src/routes/dashboard/settings/index.tsx</code>
      </p>
      <div className="settings-list">
        <Link to={`/dashboard/settings/account${authParam}`} className="settings-row">
          <div>
            <p style={{ fontWeight: 500, color: '#fff' }}>Account</p>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Manage your account details</p>
          </div>
          <span style={{ color: '#94a3b8' }}>→</span>
        </Link>
        <Link to={`/dashboard/settings/security${authParam}`} className="settings-row">
          <div>
            <p style={{ fontWeight: 500, color: '#fff' }}>Security</p>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Password and two-factor auth</p>
          </div>
          <span style={{ color: '#94a3b8' }}>→</span>
        </Link>
      </div>
    </div>
  );
}
