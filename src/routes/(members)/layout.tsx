import { NavLink, Outlet, useSearchParams } from 'react-router';

/**
 * Layout shared by all routes in the (members) group.
 * The group name is invisible in the URL — routes resolve to /account,
 * /billing, etc. — but all share this layout shell.
 */
export default function MembersLayout() {
  const [searchParams] = useSearchParams();
  const memberParam = searchParams.get('member') ? `?member=${searchParams.get('member')}` : '';

  return (
    <div data-testid="group-members-layout">
      <nav style={{ padding: '0.5rem 1rem', background: '#eff6ff' }}>
        <strong>Members Area</strong>
        <NavLink to={`/account${memberParam}`} style={{ marginLeft: '1rem' }}>
          Account
        </NavLink>
        <NavLink to={`/billing${memberParam}`} style={{ marginLeft: '1rem' }}>
          Billing
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
