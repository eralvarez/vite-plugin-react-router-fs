import { Link, useSearchParams } from 'react-router';

const USERS = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'editor' },
  { id: '42', name: 'Charlie Brown', email: 'charlie@example.com', role: 'viewer' },
  { id: '99', name: 'Diana Prince', email: 'diana@example.com', role: 'editor' },
  { id: '999', name: 'Eve Adams', email: 'eve@example.com', role: 'viewer' },
];

export default function AdminUsersIndex() {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role') ? `?role=${searchParams.get('role')}` : '';

  return (
    <div data-testid="page-admin-users">
      <h1 className="page-heading" style={{ color: '#f87171' }}>User Management</h1>
      <p style={{ color: '#cbd5e1', marginBottom: '1.5rem' }}>
        Route: <code style={{ color: '#93c5fd' }}>src/routes/admin/users/index.tsx</code>
      </p>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {USERS.map((user) => (
            <tr key={user.id}>
              <td style={{ color: '#94a3b8' }}>{user.id}</td>
              <td style={{ color: '#fff' }}>{user.name}</td>
              <td style={{ color: '#cbd5e1' }}>{user.email}</td>
              <td>
                <span className="badge">{user.role}</span>
              </td>
              <td>
                <Link to={`/admin/users/${user.id}${roleParam}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
