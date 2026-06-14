---
name: file-based-routing
description: Create views, guards, and layouts for this project's file-based routing system. Use when adding a new route, creating a layout, adding a guard, creating a protected section, creating a route group, or asking about the routing conventions in this React Router v7 SPA.
---

# File-Based Routing — Views, Layouts, Guards & Groups

This project uses a custom Vite plugin that scans `src/routes/` and auto-generates
`src/routes.ts`. **You never edit `src/routes.ts` manually.** Drop a `.tsx` file in
the right place and the route exists automatically on the next dev-server start or
file save.

---

## References

For official React Router v7 API documentation (components, hooks, route shapes), see
[references/react-router.md](references/react-router.md).

| Topic | Reference |
| ----- | --------- |
| Routing, layouts, dynamic segments, splats | [react-router.md — routing](references/react-router.md#route-configuration) |
| `Link`, `NavLink`, `Navigate`, `Outlet` | [react-router.md — components](references/react-router.md#components) |
| `useParams`, `useSearchParams`, `useLocation` | [react-router.md — hooks](references/react-router.md#hooks) |

---

## Quick Reference

| File                                 | URL                | Type                                  |
| ------------------------------------ | ------------------ | ------------------------------------- |
| `src/routes/index.tsx`               | `/`                | view                                  |
| `src/routes/contact.tsx`             | `/contact`         | view                                  |
| `src/routes/blog/index.tsx`          | `/blog`            | view                                  |
| `src/routes/blog/[slug].tsx`         | `/blog/:slug`      | view (dynamic)                        |
| `src/routes/admin/users/[id].tsx`    | `/admin/users/:id` | view (dynamic + nested)               |
| `src/routes/[...slug].tsx`           | `*`                | catch-all view                        |
| `src/routes/layout.tsx`              | —                  | root layout (wraps everything)        |
| `src/routes/dashboard/layout.tsx`    | —                  | section layout (wraps `/dashboard/*`) |
| `src/routes/dashboard/guard.tsx`     | —                  | section guard (wraps `/dashboard/*`)  |
| `src/routes/(marketing)/`            | —                  | route group (URL-invisible folder)    |
| `src/routes/(marketing)/pricing.tsx` | `/pricing`         | view inside group                     |

**Special files `layout.tsx` and `guard.tsx` are never registered as routes.**
**Group folders `(name)` never appear in any URL.**

---

## 1 · Creating a View (Route Component)

### Static route

Create `src/routes/<name>.tsx`. Export a single default React component.

```tsx
// src/routes/contact.tsx  →  /contact
import { Link } from 'react-router';

export default function ContactPage() {
  return (
    <div data-testid="page-contact">
      <h1 className="mb-4 text-3xl font-bold text-blue-400">Contact</h1>
      <p className="text-slate-300">Get in touch.</p>
      <Link to="/" className="text-blue-400 underline">
        Home
      </Link>
    </div>
  );
}
```

**Rules:**

- The component name does not affect routing — the file path does.
- Always add `data-testid="page-<name>"` to the root element for Playwright tests.
- Use `Link` / `NavLink` from `react-router` for client-side navigation (not `<a>`).
- Styling uses Tailwind CSS v4. Dark-first palette: `bg-slate-900 text-slate-100`.

### Index route for a directory

`index.tsx` is the index route for the parent directory's URL.

```tsx
// src/routes/products/index.tsx  →  /products
export default function ProductsIndex() {
  return <div data-testid="page-products">...</div>;
}
```

### Dynamic segment

Wrap a filename in square brackets: `[param].tsx`.

```tsx
// src/routes/products/[id].tsx  →  /products/:id
import { useParams } from 'react-router';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>(); // ← always type the params

  return (
    <div data-testid="page-product-detail">
      <h1>
        Product <span data-testid="product-id">#{id}</span>
      </h1>
    </div>
  );
}
```

**TypeScript best practice:** always pass a type argument to `useParams<{ id: string }>()`.
React Router does not infer param types at runtime.

### Catch-all / 404

```tsx
// src/routes/[...slug].tsx  →  *
import { useLocation } from 'react-router';

export default function NotFound() {
  const { pathname } = useLocation();
  return (
    <div data-testid="page-not-found">
      <h1>404 — Not Found</h1>
      <p>
        No route matched <code>{pathname}</code>
      </p>
    </div>
  );
}
```

There should be only one catch-all. It is automatically sorted last by the plugin.

---

## 2 · Creating a Layout

A layout wraps every route at the same directory level and below.
It **must** render `<Outlet />` where children appear — that is how React Router
nests child routes inside it.

```tsx
// src/routes/products/layout.tsx  →  wraps /products and /products/*
import { Outlet, NavLink } from 'react-router';

export default function ProductsLayout() {
  return (
    <div data-testid="products-layout">
      {/* Section sub-navigation */}
      <nav className="mb-6 flex gap-4 border-b border-slate-700 pb-4">
        <NavLink
          to="/products"
          end
          className={({ isActive }) =>
            isActive
              ? 'text-blue-400 font-medium text-sm'
              : 'text-slate-400 text-sm'
          }
        >
          All Products
        </NavLink>
        <NavLink
          to="/products/featured"
          className={({ isActive }) =>
            isActive
              ? 'text-blue-400 font-medium text-sm'
              : 'text-slate-400 text-sm'
          }
        >
          Featured
        </NavLink>
      </nav>

      {/* Child routes render here — do NOT forget this */}
      <Outlet />
    </div>
  );
}
```

**Rules:**

- `<Outlet />` is required — omitting it means child routes render into a void.
- Add `data-testid="<section>-layout"` to the root element for test assertions.
- Use `NavLink` (not `Link`) for navigation items that need an active style.
- Pass `end` to `NavLink` on the index link so it only activates on an exact match.
- Layouts nest: `src/routes/layout.tsx` renders, then `src/routes/products/layout.tsx`
  renders inside it, then the view renders inside that.

---

## 3 · Creating a Guard

A guard wraps the routes at its directory level and runs before any of them render.
It **must** render `<Outlet />` to allow access, or `<Navigate />` to redirect.

### Minimal guard

```tsx
// src/routes/dashboard/guard.tsx
import { Outlet, Navigate } from 'react-router';

export default function DashboardGuard() {
  const isAuthenticated = useAuth(); // your hook / context / store

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
```

### Guard with redirect context (preserve the intended destination)

```tsx
// src/routes/dashboard/guard.tsx
import { Outlet, Navigate } from 'react-router';

export default function DashboardGuard() {
  const isAuthenticated = useAuth();

  if (!isAuthenticated) {
    // Pass the intended path so the login page can redirect back after auth
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}
        replace
      />
    );
  }

  return <Outlet />;
}
```

### Guard with role check

```tsx
// src/routes/admin/guard.tsx
import { Outlet, Navigate } from 'react-router';

export default function AdminGuard() {
  const { role } = useCurrentUser();

  if (role !== 'admin') {
    return (
      <Navigate
        to={`/unauthorized?from=${encodeURIComponent(window.location.pathname)}`}
        replace
      />
    );
  }

  return <Outlet />;
}
```

### Guard testability pattern

This project's guards are tested via **URL search params** so Playwright can exercise
each branch without a backend. Follow this pattern for all new guards:

```tsx
// src/routes/settings/guard.tsx
import { Outlet, Navigate, useSearchParams } from 'react-router';

export default function SettingsGuard() {
  const [searchParams] = useSearchParams();

  // Real auth check takes precedence; search param is the test escape hatch
  const isAllowed =
    useIsAllowed() || // real hook
    searchParams.get('allowed') === 'true' || // test escape hatch
    localStorage.getItem('allowed') === 'true'; // persistent test state

  if (!isAllowed) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
```

Playwright tests then use:

```ts
await page.goto('/settings?allowed=true');
```

**Rules:**

- `<Outlet />` is the only "allow" return — do not render anything else alongside it.
- Always use `replace` on `<Navigate>` inside guards to avoid polluting browser history.
- Guards wrap layouts: if the guard redirects, the layout never renders. This is intentional.
- Multiple guards compose naturally through directory nesting — no manual wiring needed.

---

## 4 · Creating a Route Group

A **route group** is a folder whose name is wrapped in parentheses: `(name)`.
The folder name is completely stripped from the URL — routes inside it appear at the
parent URL level. A group can carry its own `layout.tsx` and/or `guard.tsx` that
apply exclusively to the routes inside it.

**Use groups when you need:**

- A shared layout for a subset of routes _without_ adding a URL segment
- Different guard rules for different routes at the same URL level
- Logical file organization that doesn't affect URLs

### Group with layout only

```
src/routes/
  (marketing)/
    layout.tsx     ← wraps /pricing and /features only
    pricing.tsx    → /pricing
    features.tsx   → /features
  about.tsx        → /about   ← no marketing layout here
```

```tsx
// src/routes/(marketing)/layout.tsx
import { Outlet } from 'react-router';

export default function MarketingLayout() {
  return (
    <div data-testid="marketing-layout">
      <nav>Marketing nav</nav>
      <Outlet />
    </div>
  );
}
```

### Group with guard + layout

```
src/routes/
  (members)/
    guard.tsx      ← blocks /account and /billing without ?member=true
    layout.tsx     ← wraps /account and /billing after guard passes
    account.tsx    → /account
    billing.tsx    → /billing
```

```tsx
// src/routes/(members)/guard.tsx
import { Outlet, Navigate, useSearchParams } from 'react-router';

export default function MembersGuard() {
  const [searchParams] = useSearchParams();
  const isMember =
    searchParams.get('member') === 'true' ||
    localStorage.getItem('member') === 'true';

  return isMember ? (
    <Outlet />
  ) : (
    <Navigate
      to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}
      replace
    />
  );
}
```

### Group with guard only (no layout)

```
src/routes/
  (beta)/
    guard.tsx          ← blocks /beta-features without ?beta=true
    beta-features.tsx  → /beta-features
```

### Nested groups

Groups can be nested. Each level's name is stripped and each level's layout/guard
stacks inward:

```
src/routes/
  (shop)/
    layout.tsx         ← outer layout, wraps /payment
    (checkout)/
      layout.tsx       ← inner layout, also wraps /payment (stacks with shop layout)
      payment.tsx      → /payment
```

The render tree for `/payment` is:

```
RootLayout
  └── ShopLayout            (group-shop-layout)
        └── CheckoutLayout  (group-checkout-layout)
              └── PaymentPage
```

### Multiple groups at the same level (independent guard scopes)

```
src/routes/
  (members)/
    guard.tsx      ← requires ?member=true
    account.tsx    → /account
  (beta)/
    guard.tsx      ← requires ?beta=true
    beta-features.tsx → /beta-features
  about.tsx        → /about  ← no guard
```

`?member=true` grants `/account` but NOT `/beta-features`.
`?beta=true` grants `/beta-features` but NOT `/account`.
Neither param affects `/about`.

**Rules:**

- The folder must be named with parentheses: `(name)` not `name`.
- The folder name cannot be empty: `()` is not valid.
- Dynamic group names like `([param])` are not supported.
- If two groups produce the same URL segment, the plugin emits a `console.warn` and
  React Router matches the first declaration.
- `data-testid` convention for group layouts: `group-<name>-layout`
  (e.g., `group-members-layout`, `group-checkout-layout`).

---

## 5 · Nesting Rules (How They Stack)

Given this directory:

```
src/routes/
  layout.tsx          ← root layout
  admin/
    guard.tsx         ← admin guard
    layout.tsx        ← admin layout
    users/
      [id].tsx        ← /admin/users/:id
```

The render tree for `/admin/users/42` is:

```
RootLayout
  └── AdminGuard                 (redirects if not admin)
        └── AdminLayout          (renders admin sub-nav)
              └── UserDetail     (renders the :id page)
```

Order within a directory: **guard → layout → route children**.

If you add a `guard.tsx` to `src/routes/admin/users/`, it applies _only_ to routes
under `/admin/users/`, nested inside the admin guard and layout.

**Groups add a transparent scope layer:** for `(members)/guard.tsx` + `(members)/layout.tsx`:

```
RootLayout
  └── MembersGuard              (pathless — blocks /account, /billing)
        └── MembersLayout       (pathless — wraps /account, /billing)
              ├── AccountPage   → /account
              └── BillingPage   → /billing
```

The group scope sits inside the root layout but produces no URL segment.

---

## 6 · File & Component Naming Conventions

| Convention               | Example                                                      |
| ------------------------ | ------------------------------------------------------------ |
| File name                | `kebab-case.tsx` or `[param].tsx`                            |
| Component name           | `PascalCase`, descriptive, matches the page                  |
| Guard component          | `<Section>Guard` — e.g. `DashboardGuard`, `MembersGuard`     |
| Layout component         | `<Section>Layout` — e.g. `ProductsLayout`, `MarketingLayout` |
| Group folder name        | `(kebab-case)` — e.g. `(marketing)`, `(shop)`                |
| `data-testid` on views   | `page-<kebab-path>` — e.g. `page-admin-users`                |
| `data-testid` on layouts | `<section>-layout` or `group-<name>-layout` for groups       |

---

## 7 · TypeScript Checklist

- [ ] `useParams<{ paramName: string }>()` — always type the generic
- [ ] `useSearchParams()` — destructure as `const [searchParams] = useSearchParams()`
- [ ] Import everything from `'react-router'` (not `'react-router-dom'`)
- [ ] `export default function ComponentName()` — named function, not anonymous arrow
- [ ] No `React` import needed — JSX transform is configured globally
- [ ] Do not import from `src/routes.ts` — it is auto-generated, treat it as internal

---

## 8 · Adding a New Protected Section (End-to-End Example)

**Goal:** add `/settings` with a guard and a layout containing two sub-pages.

**Step 1 — Create the directory structure:**

```
src/routes/settings/
  guard.tsx
  layout.tsx
  index.tsx
  profile.tsx
```

**Step 2 — `guard.tsx`:**

```tsx
import { Outlet, Navigate, useSearchParams } from 'react-router';

export default function SettingsGuard() {
  const [searchParams] = useSearchParams();
  const canAccess =
    searchParams.get('auth') === 'true' ||
    localStorage.getItem('auth') === 'true';

  return canAccess ? (
    <Outlet />
  ) : (
    <Navigate to="/login?redirect=%2Fsettings" replace />
  );
}
```

**Step 3 — `layout.tsx`:**

```tsx
import { Outlet, NavLink, useSearchParams } from 'react-router';

export default function SettingsLayout() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('auth') ? `?auth=true` : '';

  return (
    <div data-testid="settings-layout">
      <nav className="mb-6 flex gap-4 border-b border-slate-700 pb-4">
        <NavLink
          to={`/settings${q}`}
          end
          className={({ isActive }) =>
            isActive
              ? 'text-blue-400 text-sm font-medium'
              : 'text-slate-400 text-sm'
          }
        >
          General
        </NavLink>
        <NavLink
          to={`/settings/profile${q}`}
          className={({ isActive }) =>
            isActive
              ? 'text-blue-400 text-sm font-medium'
              : 'text-slate-400 text-sm'
          }
        >
          Profile
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
```

**Step 4 — `index.tsx`:**

```tsx
export default function SettingsIndex() {
  return (
    <div data-testid="page-settings">
      <h1 className="text-3xl font-bold text-blue-400">Settings</h1>
    </div>
  );
}
```

**Step 5 — restart dev server (or save any file to trigger watchChange).**

The plugin regenerates `src/routes.ts` automatically. No manual registration.

---

## 9 · Common Mistakes

| Mistake                                      | Fix                                                                             |
| -------------------------------------------- | ------------------------------------------------------------------------------- |
| Editing `src/routes.ts`                      | Never. It is overwritten on every change in `src/routes/`.                      |
| Forgetting `<Outlet />` in a layout          | Children silently render nowhere. Always include it.                            |
| Returning `null` from a guard                | Returns an empty screen instead of a redirect. Use `<Navigate>` instead.        |
| Using `<a href="...">` for navigation        | Causes a full-page reload. Use `<Link>` from `react-router`.                    |
| Using `NavLink` without `end` on index links | The `/dashboard` link stays "active" on `/dashboard/profile`. Add `end`.        |
| Missing `data-testid`                        | Playwright tests can't target the element reliably. Add it to the root element. |
| Dynamic param file named `param.tsx`         | Won't create a dynamic route. Use `[param].tsx` with square brackets.           |
| Catch-all file not at root                   | `[...slug].tsx` inside a subdirectory only catches paths under that prefix.     |
| Group folder missing parentheses             | `marketing/` creates a `/marketing` URL segment. `(marketing)/` does not.       |
| Expecting group name in URL                  | Group folder names are always stripped. `/pricing` not `/(marketing)/pricing`.  |
| Using `()` as a group name                   | Empty group names are invalid. Always use `(name)` with at least one character. |
