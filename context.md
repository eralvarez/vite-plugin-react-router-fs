# Project Context

## Summary

This project is a **React Router v7 SPA** with a custom **Vite plugin for file-based routing**.
The plugin scans `src/routes/` and auto-generates `src/routes.ts` — a `RouteObject[]` config
passed directly to `createBrowserRouter`. No SSR. Output is a static SPA deployable to any CDN.

---

## Key Facts

| Item            | Value                                           |
| --------------- | ----------------------------------------------- |
| Framework       | React 19 + React Router v7 (SPA / library mode) |
| Build tool      | Vite v8                                         |
| Styling         | Tailwind CSS v4                                 |
| Testing         | Playwright (75 e2e tests)                       |
| Language        | TypeScript 5                                    |
| Entry point     | `index.html` → `src/main.tsx`                   |
| Routes source   | `src/routes/`                                   |
| Routes output   | `src/routes.ts` (auto-generated)                |
| Plugin location | `plugin/` (not inside `src/`)                   |

---

## Plugin Behaviour

The plugin (`plugin/index.ts`) runs during `buildStart` and watches `src/routes/**`.
On any change it:

1. Calls `scan(routesDir, srcDir)` → builds a `RouteNode` tree
2. Calls `generate(root)` → writes `src/routes.ts`
3. Triggers a full HMR reload in dev mode

The generated file contains no JSX. All components are lazy-imported.

---

## File Conventions

| File            | Effect                                                              |
| --------------- | ------------------------------------------------------------------- |
| `index.tsx`     | Index route for parent directory path                               |
| `name.tsx`      | Route at `/name`                                                    |
| `[param].tsx`   | Dynamic segment → `:param`                                          |
| `[...slug].tsx` | Catch-all wildcard → `*`                                            |
| `layout.tsx`    | Layout wrapper (not a route) — renders `<Outlet />`                 |
| `guard.tsx`     | Access guard (not a route) — renders `<Outlet />` or `<Navigate />` |

---

## Nesting Rules

- **Layouts** nest outward to inward: `routes/layout.tsx` wraps everything;
  `routes/admin/layout.tsx` wraps only admin routes (inside root layout).
- **Guards** nest outward to inward: root guard fires first, then section guard.
- **Within a directory**: guard wraps layout wraps actual routes.
- **Sorting**: index first, static routes alphabetically, dynamic routes, catch-all last.

---

## Testing

```bash
npm run test:e2e     # runs build + preview then Playwright
```

- All tests run against the **production preview** (`vite preview` on port 4173)
- Guards are tested via URL search params: `?auth=true` and `?role=admin`
- Every route has a `data-testid` on its root element for reliable Playwright selection

---

## Scripts

```bash
npm run dev        # dev server (plugin runs + watches src/routes/)
npm run build      # production build (plugin runs once)
npm run preview    # serve dist/ locally
npm run typecheck  # tsc --noEmit
npm run test:e2e   # Playwright e2e suite
```

---

## What Does NOT Exist Here

- No SSR / server-side rendering
- No loaders or actions (React Router data API)
- No authentication backend (guards use URL params as test stand-ins)
- No npm package publish configuration (plugin is local to this repo)
