# File-Based Routing — React SPA

A custom Vite plugin that auto-generates a React Router v7 SPA route config from files
in `src/routes/`. Drop a `.tsx` file in the right place and the route exists — no
registration required.

---

## Getting Started

```bash
npm install
npm run dev        # start dev server (auto-generates src/routes.ts)
npm run build      # production build
npm run preview    # preview production build locally
npm run test:e2e   # run Playwright e2e tests
npm run typecheck  # TypeScript type check
```

---

## File Convention

Routes live under `src/routes/`. The plugin scans this directory recursively and
generates `src/routes.ts` on startup and whenever a file changes.

### Route files

| File                                        | URL                           |
| ------------------------------------------- | ----------------------------- |
| `src/routes/index.tsx`                      | `/`                           |
| `src/routes/about.tsx`                      | `/about`                      |
| `src/routes/blog/index.tsx`                 | `/blog`                       |
| `src/routes/blog/[slug].tsx`                | `/blog/:slug`                 |
| `src/routes/dashboard/settings/account.tsx` | `/dashboard/settings/account` |
| `src/routes/admin/users/[id].tsx`           | `/admin/users/:id`            |
| `src/routes/[...slug].tsx`                  | `*` (catch-all)               |

### Special files — never routes

| File         | Purpose                                                                     |
| ------------ | --------------------------------------------------------------------------- |
| `layout.tsx` | Wraps all routes at the same directory level and below                      |
| `guard.tsx`  | Runs before the view; can allow (`<Outlet />`) or redirect (`<Navigate />`) |

---

## Layouts

A `layout.tsx` in a directory wraps every route under that directory.
Layouts nest from outermost to innermost — placing a `layout.tsx` at
`src/routes/layout.tsx` wraps _all_ routes; placing one at
`src/routes/admin/layout.tsx` wraps only admin routes, inside the root layout.

```tsx
// src/routes/layout.tsx
import { Outlet } from 'react-router';

export default function RootLayout() {
  return (
    <div>
      <nav>...</nav>
      <main>
        <Outlet /> {/* child routes render here */}
      </main>
    </div>
  );
}
```

---

## Guards

A `guard.tsx` in a directory runs before the routes at that level are rendered.
It uses React Router's layout route pattern — render `<Outlet />` to allow,
or `<Navigate />` to redirect.

Guards nest: if both `src/routes/guard.tsx` and `src/routes/admin/guard.tsx`
exist, both apply on admin routes (root guard outermost).

```tsx
// src/routes/dashboard/guard.tsx
import { Outlet, Navigate } from 'react-router';

export default function DashboardGuard() {
  const isAuthenticated = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
```

**Wrapping order within a directory:** guard (outer) → layout → route component

---

## Dynamic Routes

Wrap a path segment in square brackets to create a URL parameter:

```
src/routes/blog/[slug].tsx  →  /blog/:slug
src/routes/admin/users/[id].tsx  →  /admin/users/:id
```

Access the param with `useParams()` from `react-router`.

---

## Catch-all Routes

Use the spread syntax inside brackets for a wildcard segment:

```
src/routes/[...slug].tsx  →  *  (matches any unmatched path)
```

Catch-all files are always placed last in the generated routes array.

---

## Generated File

`src/routes.ts` is auto-generated — **do not edit it manually**. It exports a
`RouteObject[]` array compatible with `createBrowserRouter` from React Router v7.
All route components are lazy-loaded for automatic code splitting.

Add it to `.gitignore` if you prefer not to commit it:

```
# .gitignore
src/routes.ts
```

---

## Plugin Options

Configured in `vite.config.ts`:

```ts
fileBasedRouting({
  routesDir: 'src/routes', // directory to scan (relative to project root)
  output: 'src/routes.ts', // file to write (relative to project root)
});
```

---

## Project Structure

```
project-root/
├── plugin/              # Vite plugin source
│   ├── index.ts         # Plugin factory & Vite hooks
│   ├── scanner.ts       # Recursive directory scanner → RouteNode tree
│   ├── generator.ts     # RouteNode tree → src/routes.ts code
│   └── types.ts         # Shared internal types
│
├── src/
│   ├── routes/          # Application route files (user-written)
│   ├── routes.ts        # AUTO-GENERATED — do not edit
│   ├── main.tsx         # Entry: createBrowserRouter + RouterProvider
│   └── app.css          # Global styles (Tailwind)
│
├── e2e/                 # Playwright e2e tests (75 tests)
├── plans/               # Implementation plans
├── index.html           # SPA shell
├── vite.config.ts
└── playwright.config.ts
```

---

## Testing

E2E tests use Playwright against a production build:

```bash
npm run test:e2e
```

The test suite covers:

- **routing.spec.ts** — every route resolves, client-side nav works
- **layouts.spec.ts** — root layout is omnipresent; section layouts scope correctly; nesting
- **guards.spec.ts** — redirect without credentials; allow with credentials; guard independence; guard+layout composition
- **dynamic.spec.ts** — param extraction for `:slug` and `:id`; catch-all behavior

---

## Deployment

The build output is a fully static SPA in `dist/`:

```bash
npm run build
# deploy dist/ to any static CDN (Cloudflare Pages, Vercel, S3, Netlify, etc.)
```

For CDN deployments, configure all paths to serve `index.html` (client-side routing
requires a catch-all rewrite rule).
