# File-Based Routing Vite Plugin — Implementation Plan

## Overview

Build a custom Vite plugin that auto-generates a React Router v7 SPA route config by
scanning a `src/routes/` directory. The plugin generates `src/routes.ts` on every
dev-server start, file change, and production build.

---

## Goals

- Zero-config route registration by file convention
- Layout wrapping via `layout.tsx` (nestable, outward-to-inward)
- Access guard wrapping via `guard.tsx` (nestable, outermost-first)
- Dynamic route segments via `[param].tsx` → `:param`
- Catch-all routes via `[...slug].tsx` → `*`
- Route groups via `(name)/` folders — URL-invisible, independently guarded/laid-out
- SPA-only output (static CDN deployable, no SSR)
- E2E coverage with Playwright for all plugin rules
- Rich example routes to exercise every convention

---

## Non-Goals

- Server-side rendering
- Loaders / actions (React Router data API is out of scope)
- Code-splitting hints beyond default lazy imports
- Multi-page app / MPA mode

---

## Tech Stack

| Concern    | Choice                                                     |
| ---------- | ---------------------------------------------------------- |
| Router     | React Router v7 (library/SPA mode — `createBrowserRouter`) |
| Build tool | Vite v8                                                    |
| Language   | TypeScript 5                                               |
| Styling    | Tailwind CSS v4                                            |
| Testing    | Playwright (e2e)                                           |
| React      | React 19                                                   |

---

## Repository Structure

```
project-root/
├── plugin/                    # Vite plugin source (NOT inside src/)
│   ├── index.ts               # Plugin factory & Vite hooks
│   ├── scanner.ts             # Recursively scans src/routes/
│   ├── generator.ts           # Converts route tree → routes.ts code string
│   └── types.ts               # Shared internal types
│
├── src/
│   ├── routes/                # Application route files (user-written)
│   │   ├── index.tsx          # → /
│   │   ├── layout.tsx         # Root layout (wraps ALL routes)
│   │   ├── about.tsx          # → /about
│   │   ├── blog/
│   │   │   ├── index.tsx      # → /blog
│   │   │   ├── layout.tsx     # Blog layout (wraps /blog/*)
│   │   │   └── [slug].tsx     # → /blog/:slug
│   │   ├── dashboard/
│   │   │   ├── index.tsx      # → /dashboard
│   │   │   ├── layout.tsx     # Dashboard layout
│   │   │   ├── guard.tsx      # Dashboard guard (auth check)
│   │   │   ├── profile.tsx    # → /dashboard/profile
│   │   │   └── settings/
│   │   │       ├── index.tsx  # → /dashboard/settings
│   │   │       ├── account.tsx  # → /dashboard/settings/account
│   │   │       └── security.tsx # → /dashboard/settings/security
│   │   ├── admin/
│   │   │   ├── index.tsx      # → /admin
│   │   │   ├── layout.tsx     # Admin layout
│   │   │   ├── guard.tsx      # Admin guard (role check)
│   │   │   └── users/
│   │   │       ├── index.tsx  # → /admin/users
│   │   │       └── [id].tsx   # → /admin/users/:id
│   │   ├── (marketing)/       # Group: layout only
│   │   │   ├── layout.tsx     # Wraps /pricing and /features
│   │   │   ├── pricing.tsx    # → /pricing
│   │   │   └── features.tsx   # → /features
│   │   ├── (members)/         # Group: guard + layout
│   │   │   ├── guard.tsx      # ?member=true required
│   │   │   ├── layout.tsx     # Wraps /account and /billing
│   │   │   ├── account.tsx    # → /account
│   │   │   └── billing.tsx    # → /billing
│   │   ├── (beta)/            # Group: guard only
│   │   │   ├── guard.tsx      # ?beta=true required
│   │   │   └── beta-features.tsx # → /beta-features
│   │   ├── (shop)/            # Nested group: outer layout
│   │   │   ├── layout.tsx     # Wraps /payment
│   │   │   └── (checkout)/    # Nested group: inner layout
│   │   │       ├── layout.tsx # Also wraps /payment (stacks with shop layout)
│   │   │       └── payment.tsx # → /payment
│   │   └── [...slug].tsx      # → * (catch-all / 404)
│   │
│   ├── routes.ts              # AUTO-GENERATED — do not edit manually
│   ├── main.tsx               # App entry: createBrowserRouter → RouterProvider
│   └── app.css                # Global styles (Tailwind)
│
├── e2e/                       # Playwright tests
│   ├── routing.spec.ts        # Basic route resolution
│   ├── layouts.spec.ts        # Layout nesting
│   ├── guards.spec.ts         # Guard behavior & composition
│   ├── dynamic.spec.ts        # Dynamic & catch-all routes
│   └── groups.spec.ts         # Route group URL resolution, layout scope, guards
│
├── plans/
│   └── file-based-routing.md  # This file
│
├── index.html                 # SPA shell — single <div id="root">
├── vite.config.ts             # Registers Tailwind + local plugin
├── tsconfig.json              # Cleaned up paths (src alias)
├── package.json               # Scripts + dependencies
├── .prettierrc                # Prettier config
├── README.md
├── AGENTS.md
└── context.md
```

---

## File Convention Reference

| File name       | Behaviour                                    |
| --------------- | -------------------------------------------- |
| `index.tsx`     | Index route for the enclosing directory path |
| `<name>.tsx`    | Route at `/<name>` relative to directory     |
| `[param].tsx`   | Dynamic segment → `/:param`                  |
| `[...slug].tsx` | Catch-all / wildcard → `/*`                  |
| `layout.tsx`    | Layout wrapper — **not** a route itself      |
| `guard.tsx`     | Guard wrapper — **not** a route itself       |
| `(name)/`       | Route group — folder name stripped from URL  |

- Files in nested directories extend their parent path.
  `src/routes/admin/users/[id].tsx` → `/admin/users/:id`
- `layout.tsx` and `guard.tsx` are **never** registered as navigable routes.
- Group folders `(name)` are transparent in the URL. Their contents appear at the
  parent URL level. A group folder may contain `layout.tsx`, `guard.tsx`, route
  files, subdirectories, or nested group folders. Groups can nest arbitrarily deep.
- There is no underscore-prefix ignore convention (all `.tsx` files are routes except the two special names above).

---

## Plugin Architecture (`plugin/`)

### `types.ts`

```ts
export interface RouteNode {
  segment: string; // URL path segment (empty string for index, root, or group nodes)
  filePath: string | null; // relative path to route file (null for dir-only nodes)
  isIndex: boolean;
  isDynamic: boolean;
  isCatchAll: boolean;
  layout: string | null; // relative path to layout.tsx if present
  guard: string | null; // relative path to guard.tsx if present
  children: RouteNode[];
}
```

### `scanner.ts` — responsibilities

1. Accept `routesDir: string` (absolute path to `src/routes/`)
2. Read the directory tree recursively
3. For each directory, identify:
   - `layout.tsx` / `layout.ts` → set `layout` on the node
   - `guard.tsx` / `guard.ts` → set `guard` on the node
   - `index.tsx` / `index.ts` → creates an index `RouteNode`
   - `[...slug].tsx` → creates a catch-all `RouteNode`
   - `[param].tsx` → creates a dynamic `RouteNode`
   - Everything else → regular route `RouteNode`
4. For subdirectories named `(name)`, build them as group nodes:
   - `segment: ''` (no URL contribution)
   - `isDynamic: false`, `isCatchAll: false`
   - Own `layout` / `guard` if present
   - Group nodes are nested inside the parent's `children` and handled by the
     generator identically to the root node (dissolved into their children)
5. After building each directory's children array, call `checkDuplicateSegments` to
   warn when two routes at the same level resolve to the same URL segment
6. Return a `RouteNode[]` tree

**Scanner helpers:**

| Helper                                   | Purpose                                           |
| ---------------------------------------- | ------------------------------------------------- |
| `isGroupDir(name)`                       | Returns true for `(name)` folders                 |
| `collectEffectiveNodes(nodes)`           | Flattens group nodes for duplicate-segment checks |
| `checkDuplicateSegments(nodes, context)` | Emits `console.warn` on URL collisions            |

### `generator.ts` — responsibilities

1. Accept a `RouteNode[]` tree and the `routesDir` path
2. Walk the tree recursively, building a string of TypeScript code
3. Output format (no JSX, pure TypeScript using `RouteObject`):

```ts
// AUTO-GENERATED — do not edit manually
// Re-generated by the file-based-routing Vite plugin

import type { RouteObject } from 'react-router';

const routes: RouteObject[] = [
  /* ... generated tree ... */
];

export default routes;
```

4. Guard → layout wrapping order (outer → inner):
   ```
   guard route (pathless) → layout route (pathless) → actual route children
   ```
5. Nodes with `segment === '' && filePath === null && !isIndex` (root node and group
   nodes) are dissolved: the generator returns their guard/layout-wrapped children
   directly, with no enclosing `{ path }` shell.
6. All imports are lazy (`lazy: async () => ({ Component: ... })`) for automatic code splitting

### `index.ts` — Vite plugin hooks

| Hook              | Action                                                           |
| ----------------- | ---------------------------------------------------------------- |
| `configResolved`  | Store resolved `root` path                                       |
| `buildStart`      | Scan + generate `src/routes.ts`                                  |
| `watchChange(id)` | If `id` is inside `src/routes/`, re-scan + re-generate           |
| `handleHotUpdate` | Invalidate modules that import `src/routes.ts` so HMR propagates |

---

## Generated `src/routes.ts` — Structure Example

Given the example routes, the generated file structure for a group looks like:

```ts
// (members)/ group with guard + layout — produces no { path } wrapper
{
  // guard (pathless)
  lazy: async () => ({
    Component: (await import('./routes/(members)/guard')).default,
  }),
  children: [
    {
      // layout (pathless)
      lazy: async () => ({
        Component: (await import('./routes/(members)/layout')).default,
      }),
      children: [
        {
          path: 'account',
          lazy: async () => ({
            Component: (await import('./routes/(members)/account')).default,
          }),
        },
        {
          path: 'billing',
          lazy: async () => ({
            Component: (await import('./routes/(members)/billing')).default,
          }),
        },
      ],
    },
  ],
},
```

Note: the group folder name `(members)` never appears in any `path` field.

**Key observations:**

- No JSX in the generated file → pure `.ts`, no babel/SWC JSX transform needed
- All components are lazy-loaded for code splitting
- Ancestor guard/layout wrapping is achieved naturally via React Router's route nesting
- A directory with both guard + layout always nests guard → layout → children
- A directory with only layout wraps layout → children
- A directory with only guard wraps guard → children
- A directory with neither is a plain path namespace `{ path, children }`
- A group folder with neither guard nor layout dissolves entirely (children appear inline)

---

## Guard & Layout Component API

Both `guard.tsx` and `layout.tsx` are standard React Router **layout routes**
(pathless routes that render `<Outlet />`).

**Layout example:**

```tsx
// src/routes/layout.tsx
import { Outlet, NavLink } from 'react-router';

export default function RootLayout() {
  return (
    <div>
      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/about">About</NavLink>
      </nav>
      <main>
        <Outlet /> {/* child routes render here */}
      </main>
    </div>
  );
}
```

**Guard example:**

```tsx
// src/routes/dashboard/guard.tsx
import { Outlet, Navigate } from 'react-router';

export default function DashboardGuard() {
  const isAuthenticated = useAuth(); // user-provided hook
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
```

The guard decides: render `<Outlet />` (allow) or `<Navigate />` (block/redirect).

---

## SPA Entry Point

```
index.html → src/main.tsx → createBrowserRouter(routes) → <RouterProvider>
```

**`src/main.tsx`:**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import routes from './routes';
import './app.css';

const router = createBrowserRouter(routes);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
```

---

## `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileBasedRouting } from './plugin';

export default defineConfig({
  plugins: [react(), tailwindcss(), fileBasedRouting({ routesDir: 'src/routes', output: 'src/routes.ts' })],
});
```

---

## `package.json` scripts

```json
{
  "dev": "vite --port 3000",
  "build": "vite build",
  "preview": "vite preview",
  "start": "serve dist -s -p 3000",
  "format": "prettier --write .",
  "typecheck": "tsc --noEmit",
  "test:e2e": "playwright test"
}
```

---

## E2E Test Plan (Playwright)

### `e2e/routing.spec.ts` — Basic route resolution

- `/` renders the home/index page
- `/about` renders the about page
- `/blog` renders the blog index page
- `/nonexistent-path` renders the catch-all (404) page
- Navigation between routes via `<Link>` works (client-side, no full reload)

### `e2e/layouts.spec.ts` — Layout nesting

- Root layout nav is visible on `/`, `/about`, `/blog`, `/dashboard`, `/admin`
- Blog layout elements visible on `/blog` and `/blog/hello-world`, NOT on `/about`
- Dashboard layout elements visible on `/dashboard/profile`, NOT on `/about`
- Admin layout elements visible on `/admin`, NOT on `/dashboard`
- **Nested layout test:** on `/admin`, both root layout nav AND admin-specific layout elements are present simultaneously

### `e2e/guards.spec.ts` — Guard behavior

- Navigating to `/dashboard` without auth → redirected to `/login`
- Navigating to `/dashboard` with `?auth=true` → guard allows through
- Navigating to `/admin` without admin role → redirected to `/unauthorized`
- Navigating to `/admin` with `?role=admin` → renders admin page
- Guards compose correctly through directory nesting

### `e2e/dynamic.spec.ts` — Dynamic and catch-all routes

- `/blog/my-post` renders blog post with slug `my-post`
- `/admin/users/42` renders user with id `42`
- `/totally/unknown/path` hits catch-all route

### `e2e/groups.spec.ts` — Route groups

- **URL resolution**: group name absent from URL for all group types; nested groups strip both names
- **Layout scope**: group layout visible only on group routes, not on sibling non-group routes
- **Nested layouts**: `(shop)/(checkout)/payment.tsx` renders both shop and checkout layouts
- **Guard block**: unauthenticated access to guarded group routes redirects correctly; layout never renders
- **Guard allow**: correct credential grants access and shows layout
- **Guard isolation**: one group's credential does not unlock another group's protected routes

---

## Guard State for Testing

Since guards rely on runtime state (auth, roles), example guards in this project
will use a simple **URL search-param or localStorage flag** for testability:

- `?auth=true` → authenticated (dashboard guard passes)
- `?role=admin` → admin role (admin guard passes)
- `?member=true` → member (members group guard passes)
- `?beta=true` → beta tester (beta group guard passes)
- Playwright tests set these params before navigating

This avoids needing a real auth backend while still exercising the guard logic.

---

## Future Considerations (out of scope for now)

- Named/parallel routes (React Router `<Outlet name="...">`)
- Route-level meta/head management
- Preloading hints for lazy chunks
- NPM package extraction
- Integration with React Query or SWR for data loading
