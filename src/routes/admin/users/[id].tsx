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
  const roleParam = searchParams.get('role')
    ? `?role=${searchParams.get('role')}`
    : '';
  const user = id ? USERS[id] : undefined;

  return (
    <div data-testid="page-admin-user-detail">
      <p className="mb-2 text-sm text-slate-400">
        Dynamic route:{' '}
        <code className="text-blue-300">src/routes/admin/users/[id].tsx</code>
      </p>
      <h1 className="mb-4 text-3xl font-bold text-red-400">
        User <span data-testid="user-id">#{id}</span>
      </h1>
      {user ? (
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-slate-400">Name</dt>
              <dd className="font-medium text-white">{user.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-400">Email</dt>
              <dd className="text-slate-300">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-400">Role</dt>
              <dd>
                <span className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                  {user.role}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        <p className="text-slate-400">
          No user found with ID <code className="text-red-300">{id}</code>.
        </p>
      )}
      <Link
        to={`/admin/users${roleParam}`}
        className="mt-4 inline-block text-blue-400 underline"
      >
        Back to Users
      </Link>
    </div>
  );
}
