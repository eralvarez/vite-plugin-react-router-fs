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

## Repository Structure (after migration)

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
│   └── dynamic.spec.ts        # Dynamic & catch-all routes
│
├── plans/
│   └── file-based-routing.md  # This file
│
├── index.html                 # SPA shell — single <div id="root">
├── vite.config.ts             # Registers Tailwind + local plugin
├── tsconfig.json              # Cleaned up paths (src alias)
├── package.json               # Scripts + dependencies
├── README.md
├── agents.md
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

- Files in nested directories extend their parent path.
  `src/routes/admin/users/[id].tsx` → `/admin/users/:id`
- `layout.tsx` and `guard.tsx` are **never** registered as navigable routes.
- There is no underscore-prefix ignore convention (all `.tsx` files are routes except the two special names above).

---

## Plugin Architecture (`plugin/`)

### `types.ts`

```ts
export interface RouteNode {
  segment: string; // URL path segment (empty string for index / root)
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
4. Return a `RouteNode[]` tree

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
5. All imports are lazy (`lazy: async () => ({ Component: ... })`) for automatic code splitting

### `index.ts` — Vite plugin hooks

| Hook              | Action                                                           |
| ----------------- | ---------------------------------------------------------------- |
| `configResolved`  | Store resolved `root` path                                       |
| `buildStart`      | Scan + generate `src/routes.ts`                                  |
| `watchChange(id)` | If `id` is inside `src/routes/`, re-scan + re-generate           |
| `handleHotUpdate` | Invalidate modules that import `src/routes.ts` so HMR propagates |

---

## Generated `src/routes.ts` — Structure Example

Given the example routes above, the generated file looks like:

```ts
// AUTO-GENERATED — do not edit manually
import type { RouteObject } from 'react-router';

const routes: RouteObject[] = [
  {
    // Root layout wrapper (src/routes/layout.tsx)
    lazy: async () => ({
      Component: (await import('./routes/layout')).default,
    }),
    children: [
      // /
      {
        index: true,
        lazy: async () => ({
          Component: (await import('./routes/index')).default,
        }),
      },
      // /about
      {
        path: 'about',
        lazy: async () => ({
          Component: (await import('./routes/about')).default,
        }),
      },

      // /blog — has its own layout, no guard
      {
        path: 'blog',
        children: [
          {
            lazy: async () => ({
              Component: (await import('./routes/blog/layout')).default,
            }),
            children: [
              {
                index: true,
                lazy: async () => ({
                  Component: (await import('./routes/blog/index')).default,
                }),
              },
              {
                path: ':slug',
                lazy: async () => ({
                  Component: (await import('./routes/blog/[slug]')).default,
                }),
              },
            ],
          },
        ],
      },

      // /dashboard — has guard + layout
      {
        path: 'dashboard',
        children: [
          {
            // guard (pathless)
            lazy: async () => ({
              Component: (await import('./routes/dashboard/guard')).default,
            }),
            children: [
              {
                // layout (pathless)
                lazy: async () => ({
                  Component: (await import('./routes/dashboard/layout'))
                    .default,
                }),
                children: [
                  {
                    index: true,
                    lazy: async () => ({
                      Component: (await import('./routes/dashboard/index'))
                        .default,
                    }),
                  },
                  {
                    path: 'profile',
                    lazy: async () => ({
                      Component: (await import('./routes/dashboard/profile'))
                        .default,
                    }),
                  },
                  {
                    path: 'settings',
                    children: [
                      {
                        index: true,
                        lazy: async () => ({
                          Component: (
                            await import('./routes/dashboard/settings/index')
                          ).default,
                        }),
                      },
                      {
                        path: 'account',
                        lazy: async () => ({
                          Component: (
                            await import('./routes/dashboard/settings/account')
                          ).default,
                        }),
                      },
                      {
                        path: 'security',
                        lazy: async () => ({
                          Component: (
                            await import('./routes/dashboard/settings/security')
                          ).default,
                        }),
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },

      // /admin — guard + layout; users/ is a nested path namespace
      {
        path: 'admin',
        children: [
          {
            // guard (pathless)
            lazy: async () => ({
              Component: (await import('./routes/admin/guard')).default,
            }),
            children: [
              {
                // layout (pathless)
                lazy: async () => ({
                  Component: (await import('./routes/admin/layout')).default,
                }),
                children: [
                  {
                    index: true,
                    lazy: async () => ({
                      Component: (await import('./routes/admin/index')).default,
                    }),
                  },
                  {
                    path: 'users',
                    children: [
                      {
                        index: true,
                        lazy: async () => ({
                          Component: (
                            await import('./routes/admin/users/index')
                          ).default,
                        }),
                      },
                      {
                        path: ':id',
                        lazy: async () => ({
                          Component: (await import('./routes/admin/users/[id]'))
                            .default,
                        }),
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },

      // Catch-all /*
      {
        path: '*',
        lazy: async () => ({
          Component: (await import('./routes/[...slug]')).default,
        }),
      },
    ],
  },
];

export default routes;
```

**Key observations:**

- No JSX in the generated file → pure `.ts`, no babel/SWC JSX transform needed
- All components are lazy-loaded for code splitting
- Ancestor guard/layout wrapping is achieved naturally via React Router's route nesting
  (root layout wraps all children; admin guard wraps only admin children; etc.)
- A directory with both guard + layout always nests guard → layout → children
- A directory with only layout wraps layout → children
- A directory with only guard wraps guard → children
- A directory with neither is a plain path namespace `{ path, children }`

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
  plugins: [
    react(),
    tailwindcss(),
    fileBasedRouting({ routesDir: 'src/routes', output: 'src/routes.ts' }),
  ],
});
```

---

## Package Changes

**Remove (SSR/framework mode only):**

- `@react-router/node`
- `@react-router/serve`
- `@react-router/dev`
- `react-router.config.ts`

**Add:**

- `@vitejs/plugin-react` (basic React Vite plugin)
- `@playwright/test` (e2e tests)

**Keep:**

- `react`, `react-dom`, `react-router`
- `tailwindcss`, `@tailwindcss/vite`
- `typescript`, `vite`

**`package.json` scripts:**

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test:e2e": "playwright test",
  "typecheck": "tsc --noEmit"
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

- Navigating to `/dashboard` without auth → redirected (e.g., to `/login` or shows redirect message)
- Navigating to `/dashboard` with auth flag set → guard allows through, renders dashboard
- Navigating to `/admin` without admin role → redirected
- Navigating to `/admin` with admin role → renders admin page
- Both root guard (if present) and admin guard apply on admin routes

### `e2e/dynamic.spec.ts` — Dynamic and catch-all routes

- `/blog/my-post` renders blog post with slug `my-post`
- `/blog/another-post` renders with slug `another-post`
- `/admin/users` renders user list
- `/admin/users/42` renders user with id `42`
- `/admin/users/999` renders with id `999`
- `/totally/unknown/path` hits catch-all route

---

## Implementation Steps (ordered)

1. **Dependency cleanup** — Remove SSR packages, add `@vitejs/plugin-react` and `@playwright/test`
2. **Project skeleton** — Create `index.html`, `src/main.tsx`, `src/app.css`; remove `app/`; update `tsconfig.json`; update `vite.config.ts`
3. **Plugin: `types.ts`** — Define `RouteNode` and related types
4. **Plugin: `scanner.ts`** — Implement recursive directory scan and tree building
5. **Plugin: `generator.ts`** — Implement code string generator from route tree
6. **Plugin: `index.ts`** — Wire scanner + generator into Vite plugin hooks (buildStart, watchChange, handleHotUpdate)
7. **Example routes** — Create all route files under `src/routes/` with meaningful UI content for testability
8. **Wire up** — Import generated `src/routes.ts` in `main.tsx`, verify dev server works
9. **Playwright setup** — `playwright.config.ts`, install browsers
10. **Write e2e tests** — `e2e/routing.spec.ts`, `e2e/layouts.spec.ts`, `e2e/guards.spec.ts`, `e2e/dynamic.spec.ts`
11. **Run tests and fix issues**
12. **Documentation** — Update `README.md`, create `agents.md`, create `context.md`

---

## Guard State for Testing

Since guards rely on runtime state (auth, roles), example guards in this project
will use a simple **URL search-param or localStorage flag** for testability:

- `?auth=true` → authenticated (dashboard guard passes)
- `?role=admin` → admin role (admin guard passes)
- Playwright tests set these params before navigating

This avoids needing a real auth backend while still exercising the guard logic.

---

## Future Considerations (out of scope for now)

- Named/parallel routes (React Router `<Outlet name="...">`)
- Route-level meta/head management
- Preloading hints for lazy chunks
- NPM package extraction
- Integration with React Query or SWR for data loading
