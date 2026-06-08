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

- `segment` — URL segment (`:param`, `*`, `''` for index/root/group nodes, or plain name)
- `filePath` — relative path to the component file (null for dir-only nodes)
- `isIndex`, `isDynamic`, `isCatchAll` — classification flags
- `layout` — path to `layout.tsx` at this directory level (or null)
- `guard` — path to `guard.tsx` at this directory level (or null)
- `children` — child `RouteNode[]`

**Group nodes** (folders named `(name)`) have `segment: ''`, `filePath: null`,
`isIndex: false` — the same shape as the root node. The generator treats them
identically: it dissolves the node into its guard/layout-wrapped children with no
enclosing `{ path }` shell.

### Scanner Helpers

| Helper                                   | Purpose                                                          |
| ---------------------------------------- | ---------------------------------------------------------------- |
| `isGroupDir(name)`                       | Returns true for `(name)` folders                                |
| `collectEffectiveNodes(nodes)`           | Flattens group nodes for duplicate-segment detection             |
| `checkDuplicateSegments(nodes, context)` | `console.warn` when two siblings resolve to the same URL segment |

### Generated File Format

`src/routes.ts` exports a `RouteObject[]` (React Router). All components are
lazy-loaded. Guards and layouts are pathless layout routes that render `<Outlet />`.
The guard wraps the layout, which wraps the route children:

```
guard (pathless) → layout (pathless) → route children
```

Group folders produce no URL segment. Their guard/layout (if any) appear as pathless
wrappers directly inside the parent's `children` array:

```
// (members)/ with guard + layout:
{
  lazy: MembersGuard,
  children: [{
    lazy: MembersLayout,
    children: [ /* /account, /billing */ ]
  }]
}
```

No JSX in the generated file — pure TypeScript using dynamic `import()`.

---

## Application (`src/routes/`)

Route files demonstrating every convention:

### Named-directory routes (17 files)

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

### Route group routes (8 files across 4 groups)

| Path             | File                            | Notes                                |
| ---------------- | ------------------------------- | ------------------------------------ |
| `/pricing`       | `(marketing)/pricing.tsx`       | Layout only, no guard                |
| `/features`      | `(marketing)/features.tsx`      | Same layout as /pricing              |
| `/account`       | `(members)/account.tsx`         | Guard (`?member=true`) + layout      |
| `/billing`       | `(members)/billing.tsx`         | Guard + layout                       |
| `/beta-features` | `(beta)/beta-features.tsx`      | Guard only (`?beta=true`), no layout |
| `/payment`       | `(shop)/(checkout)/payment.tsx` | Nested groups, both layouts stack    |

### Guard Testability

Guards use URL search params for testability (no real auth backend needed):

- `?auth=true` → dashboard guard passes
- `?role=admin` → admin guard passes
- `?member=true` → members group guard passes
- `?beta=true` → beta group guard passes

---

## Test Suite (`e2e/`)

108 Playwright tests across 5 files. Runs against a production preview build.

```bash
npm run test:e2e
```

| File              | What It Tests                                                                         |
| ----------------- | ------------------------------------------------------------------------------------- |
| `routing.spec.ts` | Route resolution, client-side nav                                                     |
| `layouts.spec.ts` | Layout scope, nesting, isolation                                                      |
| `guards.spec.ts`  | Redirect without creds, allow with creds, guard independence, composition             |
| `dynamic.spec.ts` | Param extraction, catch-all                                                           |
| `groups.spec.ts`  | Group URL resolution, layout scope, guard block/allow, guard isolation, nested groups |

### Test IDs Used

Components use `data-testid` attributes for reliable element selection:

- `root-layout-header` — root nav bar
- `blog-layout` — blog section sub-nav
- `dashboard-layout` — dashboard sub-nav
- `admin-layout` — admin panel sub-nav
- `marketing-layout` — (marketing) group layout
- `group-members-layout` — (members) group layout
- `group-shop-layout` — (shop) group layout
- `group-checkout-layout` — (checkout) nested group layout
- `page-home`, `page-about`, `page-blog-index`, `page-blog-post` — page roots
- `page-dashboard`, `page-dashboard-profile`, `page-dashboard-settings-*` — dashboard pages
- `page-admin`, `page-admin-users`, `page-admin-user-detail` — admin pages
- `page-login`, `page-unauthorized`, `page-not-found` — redirect targets and 404
- `page-pricing`, `page-features` — (marketing) group pages
- `page-account`, `page-billing` — (members) group pages
- `page-beta-features` — (beta) group page
- `page-payment` — (shop)/(checkout) nested group page
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

### Add a route group

Create a folder named `(name)` (parentheses required). Place route files and
optionally `layout.tsx` / `guard.tsx` inside it. The folder name is never part of
any URL.

```
src/routes/(marketing)/
  layout.tsx     ← wraps only routes inside this group
  pricing.tsx    → /pricing
  features.tsx   → /features
```

Groups are useful for giving a set of co-located routes a shared layout or guard
without affecting the URL structure, and for splitting routes at the same URL level
into independently guarded sections.

### Change the routes directory

Update the `routesDir` option in `vite.config.ts`:

```ts
fileBasedRouting({ routesDir: 'src/pages', output: 'src/routes.ts' });
```

---

## Scripts

```bash
npm run dev        # dev server on port 3000
npm run build      # production build → dist/
npm start          # serve dist/ with 'serve' package on port 3000 (SPA fallback enabled)
npm run preview    # Vite preview server
npm run format     # Prettier --write .
npm run typecheck  # tsc --noEmit
npm run test:e2e   # Playwright e2e suite (builds first)
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
- **Group nodes reuse `segment: ''`** — group folders produce a node with an empty
  segment (same shape as the root node). The generator already dissolves such nodes
  into their guard/layout-wrapped children, so no generator changes were needed.
- **Duplicate-segment warning** — when two siblings (after group flattening) resolve
  to the same URL segment, the scanner emits a `console.warn` at build/dev-start time
  and continues; React Router will match the first declaration.
