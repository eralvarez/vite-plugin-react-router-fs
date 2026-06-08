import { Link, useSearchParams } from 'react-router';

const USERS = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'editor' },
  {
    id: '42',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    role: 'viewer',
  },
  {
    id: '99',
    name: 'Diana Prince',
    email: 'diana@example.com',
    role: 'editor',
  },
  { id: '999', name: 'Eve Adams', email: 'eve@example.com', role: 'viewer' },
];

export default function AdminUsersIndex() {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role') ? `?role=${searchParams.get('role')}` : '';

  return (
    <div data-testid="page-admin-users">
      <h1 className="mb-4 text-3xl font-bold text-red-400">User Management</h1>
      <p className="mb-6 text-slate-300">
        Route: <code className="text-blue-300">src/routes/admin/users/index.tsx</code>
      </p>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-700 text-sm text-slate-400">
            <th className="pb-2 pr-4">ID</th>
            <th className="pb-2 pr-4">Name</th>
            <th className="pb-2 pr-4">Email</th>
            <th className="pb-2 pr-4">Role</th>
            <th className="pb-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {USERS.map((user) => (
            <tr key={user.id} className="border-b border-slate-800 text-sm">
              <td className="py-3 pr-4 text-slate-400">{user.id}</td>
              <td className="py-3 pr-4 text-white">{user.name}</td>
              <td className="py-3 pr-4 text-slate-300">{user.email}</td>
              <td className="py-3 pr-4">
                <span className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300">{user.role}</span>
              </td>
              <td className="py-3">
                <Link to={`/admin/users/${user.id}${roleParam}`} className="text-blue-400 hover:underline">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
