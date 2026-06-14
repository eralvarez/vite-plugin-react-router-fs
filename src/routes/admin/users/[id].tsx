import { useParams, Link, useSearchParams } from 'react-router';

const USERS: Record<string, { name: string; email: string; role: string }> = {
  '1': { name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
  '2': { name: 'Bob Smith', email: 'bob@example.com', role: 'editor' },
  '42': { name: 'Charlie Brown', email: 'charlie@example.com', role: 'viewer' },
  '99': { name: 'Diana Prince', email: 'diana@example.com', role: 'editor' },
  '999': { name: 'Eve Adams', email: 'eve@example.com', role: 'viewer' },
};

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role') ? `?role=${searchParams.get('role')}` : '';
  const user = id ? USERS[id] : undefined;

  return (
    <div data-testid="page-admin-user-detail">
      <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
        Dynamic route: <code style={{ color: '#93c5fd' }}>src/routes/admin/users/[id].tsx</code>
      </p>
      <h1 className="page-heading" style={{ color: '#f87171' }}>
        User <span data-testid="user-id">#{id}</span>
      </h1>
      {user ? (
        <div className="card" style={{ padding: '1.5rem' }}>
          <dl style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <dt style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Name</dt>
              <dd style={{ fontWeight: 500, color: '#fff' }}>{user.name}</dd>
            </div>
            <div>
              <dt style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Email</dt>
              <dd style={{ color: '#cbd5e1' }}>{user.email}</dd>
            </div>
            <div>
              <dt style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Role</dt>
              <dd>
                <span className="badge">{user.role}</span>
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        <p style={{ color: '#94a3b8' }}>
          No user found with ID <code style={{ color: '#fca5a5' }}>{id}</code>.
        </p>
      )}
      <Link to={`/admin/users${roleParam}`} style={{ display: 'inline-block', marginTop: '1rem' }}>
        Back to Users
      </Link>
    </div>
  );
}
