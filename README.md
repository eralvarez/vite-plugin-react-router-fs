# vite-plugin-react-router-fs

A Vite plugin that auto-generates a React Router v7 SPA route config from files
in `src/routes/`. Drop a `.tsx` file in the right place and the route exists — no
registration required.

This repo contains both the plugin source (`plugin/`) and a full example application
(`src/`) that exercises every routing convention.

---

## Plugin Development

### Dev

Run the example app while editing the plugin. Vite loads the plugin directly from
`plugin/` source — no separate build step required during development.

```bash
npm install
npm run dev        # starts example app on port 3000, watches src/routes/ for changes
```

The example app in `src/routes/` covers every supported convention (layouts, guards,
groups, dynamic segments, catch-all). Use it to verify plugin changes interactively.

Run the full e2e test suite against a production build at any point:

```bash
npm run test:e2e   # builds the example app, starts vite preview, runs Playwright
```

### Build

Compile the plugin to `dist/` for distribution. Outputs ESM, CJS, and TypeScript
declarations.

```bash
npm run build:plugin
```

Output:

```
dist/
  index.js       # ESM
  index.cjs      # CommonJS
  index.d.ts     # TypeScript declarations (ESM)
  index.d.cts    # TypeScript declarations (CJS)
```

### Publish

`prepublishOnly` runs `build:plugin` automatically — just bump the version and publish:

```bash
npm version patch   # or minor / major
npm publish
```

Only the `dist/` folder is included in the published package (configured via the
`files` field in `package.json`). The example app, e2e tests, and plugin source are
not published.

---

## Example App Scripts

```bash
npm run dev        # start dev server on port 3000 (auto-generates src/routes.ts)
npm run build      # production build → dist-app/
npm start          # serve dist-app/ on port 3000 (after build)
npm run preview    # Vite preview server
npm run format     # run Prettier across the whole project
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

## Route Groups

A folder named `(name)` is a **route group**. The parentheses are stripped from
the URL — routes inside the folder resolve as if the folder didn't exist — but the
folder can still carry its own `layout.tsx` and `guard.tsx`.

```
src/routes/
  (marketing)/
    layout.tsx     ← wraps /pricing and /features only
    pricing.tsx    → /pricing
    features.tsx   → /features
  (members)/
    guard.tsx      ← protects /account and /billing
    layout.tsx     ← wraps /account and /billing
    account.tsx    → /account
    billing.tsx    → /billing
  about.tsx        → /about  (no group, no group layout/guard)
```

**Key properties:**

- The group name never appears in any URL.
- Groups can carry `layout.tsx`, `guard.tsx`, both, or neither.
- Multiple groups at the same directory level are independent — each has its own
  guard/layout scope, so the same URL level can have different protection rules.
- Groups nest: `(shop)/(checkout)/payment.tsx` → `/payment`, with both `(shop)` and
  `(checkout)` layouts stacking.
- If two groups produce a route with the same URL segment, the plugin emits a
  `console.warn` at build time and React Router matches the first one.

```tsx
// src/routes/(members)/guard.tsx
import { Outlet, Navigate, useSearchParams } from 'react-router';

export default function MembersGuard() {
  const [searchParams] = useSearchParams();
  const isMember = searchParams.get('member') === 'true';
  return isMember ? <Outlet /> : <Navigate to="/login" replace />;
}
```

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
├── plugin/              # Vite plugin source (published to npm)
│   ├── index.ts         # Plugin factory & Vite hooks
│   ├── scanner.ts       # Recursive directory scanner → RouteNode tree
│   ├── generator.ts     # RouteNode tree → src/routes.ts code
│   └── types.ts         # Shared internal types
│
├── src/                 # Example application (not published)
│   ├── routes/          # Application route files (user-written)
│   ├── routes.ts        # AUTO-GENERATED — do not edit
│   ├── main.tsx         # Entry: createBrowserRouter + RouterProvider
│   └── app.css          # Global styles (Tailwind)
│
├── dist/                # Plugin build output (npm publish target)
├── dist-app/            # Example app build output (e2e tests / npm start)
├── e2e/                 # Playwright e2e tests (108 tests)
├── index.html           # SPA shell
├── tsup.config.ts       # Plugin build config
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
- **groups.spec.ts** — group URL resolution; layout scope isolation; guard block/allow; guard independence across groups; nested groups

---

## Deployment

The build output is a fully static SPA in `dist-app/`:

```bash
npm run build
npm start          # serve locally with 'serve' package on port 3000
# or deploy dist-app/ to any static CDN (Cloudflare Pages, Vercel, S3, Netlify, etc.)
```

For CDN deployments, configure all paths to serve `index.html` (client-side routing
requires a catch-all rewrite rule). The `serve` package handles this automatically
via its `--single` flag, which is already configured in `npm start`.
