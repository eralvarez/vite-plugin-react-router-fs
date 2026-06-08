# Agent Context

## What This Project Is

A **Vite plugin** that implements file-based routing for React Router v7 SPA applications,
plus an extensive example application that exercises every routing convention.

The project is **not** a framework — it is a self-contained example + plugin that can be
extracted into an npm package. It targets static CDN deployment (no SSR).

---

## Plugin (`plugin/`)

Located at `plugin/index.ts`. Registered in `vite.config.ts` as:

```ts
fileBasedRouting({ routesDir: 'src/routes', output: 'src/routes.ts' });
```

### How It Works

1. **`buildStart`** — scans `src/routes/` and writes `src/routes.ts`
2. **`watchChange`** — rescans and rewrites on any file change inside `src/routes/`
3. **`handleHotUpdate`** — invalidates the generated module for HMR

### Key Files

| File                  | Responsibility                                            |
| --------------------- | --------------------------------------------------------- |
| `plugin/types.ts`     | `RouteNode` and `PluginOptions` interfaces                |
| `plugin/scanner.ts`   | `scan(routesDir, srcDir) → RouteNode` — recursive FS walk |
| `plugin/generator.ts` | `generate(root) → string` — converts tree to TS source    |
| `plugin/index.ts`     | Vite plugin factory wiring scanner + generator to hooks   |

### RouteNode Tree

The scanner returns a tree of `RouteNode` objects. Each node has:

- `segment` — URL segment (`:param`, `*`, `''` for index, or plain name)
- `filePath` — relative path to the component file (null for dir-only nodes)
- `isIndex`, `isDynamic`, `isCatchAll` — classification flags
- `layout` — path to `layout.tsx` at this directory level (or null)
- `guard` — path to `guard.tsx` at this directory level (or null)
- `children` — child `RouteNode[]`

### Generated File Format

`src/routes.ts` exports a `RouteObject[]` (React Router). All components are
lazy-loaded. Guards and layouts are pathless layout routes that render `<Outlet />`.
The guard wraps the layout, which wraps the route children:

```
guard (pathless) → layout (pathless) → route children
```

No JSX in the generated file — pure TypeScript using dynamic `import()`.

---

## Application (`src/routes/`)

17 route files demonstrating every convention:

| Path                           | File                              | Notes                            |
| ------------------------------ | --------------------------------- | -------------------------------- |
| `/`                            | `index.tsx`                       | Home page                        |
| `/about`                       | `about.tsx`                       | Flat route                       |
| `/blog`                        | `blog/index.tsx`                  | Blog index                       |
| `/blog/:slug`                  | `blog/[slug].tsx`                 | Dynamic route                    |
| `/dashboard`                   | `dashboard/index.tsx`             | Guarded by `dashboard/guard.tsx` |
| `/dashboard/profile`           | `dashboard/profile.tsx`           | Guarded + layout                 |
| `/dashboard/settings`          | `dashboard/settings/index.tsx`    | Deeply nested                    |
| `/dashboard/settings/account`  | `dashboard/settings/account.tsx`  | 3-level nesting                  |
| `/dashboard/settings/security` | `dashboard/settings/security.tsx` | 3-level nesting                  |
| `/admin`                       | `admin/index.tsx`                 | Guarded by `admin/guard.tsx`     |
| `/admin/users`                 | `admin/users/index.tsx`           | Nested under guard + layout      |
| `/admin/users/:id`             | `admin/users/[id].tsx`            | Dynamic + guarded                |
| `/login`                       | `login.tsx`                       | Guard redirect target            |
| `/unauthorized`                | `unauthorized.tsx`                | Admin guard redirect target      |
| `*`                            | `[...slug].tsx`                   | Catch-all / 404                  |

### Guard Testability

Guards use URL search params for testability (no real auth backend needed):

- `?auth=true` → dashboard guard passes
- `?role=admin` → admin guard passes

---

## Test Suite (`e2e/`)

75 Playwright tests across 4 files. Runs against a production preview build.

```bash
npm run test:e2e
```

| File              | What It Tests                                                             |
| ----------------- | ------------------------------------------------------------------------- |
| `routing.spec.ts` | Route resolution, client-side nav                                         |
| `layouts.spec.ts` | Layout scope, nesting, isolation                                          |
| `guards.spec.ts`  | Redirect without creds, allow with creds, guard independence, composition |
| `dynamic.spec.ts` | Param extraction, catch-all                                               |

### Test IDs Used

Components use `data-testid` attributes for reliable element selection:

- `root-layout-header` — root nav bar
- `blog-layout` — blog section sub-nav
- `dashboard-layout` — dashboard sub-nav
- `admin-layout` — admin panel sub-nav
- `page-home`, `page-about`, `page-blog-index`, `page-blog-post` — page roots
- `page-dashboard`, `page-dashboard-profile`, `page-dashboard-settings-*` — dashboard pages
- `page-admin`, `page-admin-users`, `page-admin-user-detail` — admin pages
- `page-login`, `page-unauthorized`, `page-not-found` — redirect targets and 404
- `blog-slug` — contains the `:slug` param value
- `user-id` — contains the `:id` param value

---

## Common Tasks

### Add a new route

Create a `.tsx` file in `src/routes/`. The plugin regenerates `src/routes.ts` automatically
on next dev server start or on file save in dev mode.

```
src/routes/contact.tsx  →  /contact
src/routes/products/index.tsx  →  /products
src/routes/products/[id].tsx  →  /products/:id
```

### Add a layout to an existing directory

Add `layout.tsx` to the directory. It must `export default` a React component that
renders `<Outlet />`.

### Add a guard to an existing directory

Add `guard.tsx` to the directory. It must `export default` a React component that
renders either `<Outlet />` (allow) or `<Navigate to="..." />` (block).

### Change the routes directory

Update the `routesDir` option in `vite.config.ts`:

```ts
fileBasedRouting({ routesDir: 'src/pages', output: 'src/routes.ts' });
```

---

## Architecture Decisions

- **No JSX in generated file** — keeps `routes.ts` a plain TypeScript file with no
  additional transform requirements.
- **Outlet-based guards/layouts** — idiomatic React Router v7 layout route pattern;
  avoids prop-drilling children.
- **All lazy imports** — every route component is code-split automatically.
- **Guard wraps layout** — ensures the layout shell never renders for blocked users.
- **Static sorting** — index first, then static, then dynamic, catch-all last.
