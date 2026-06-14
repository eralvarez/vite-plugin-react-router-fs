# vite-plugin-react-router-fs

A Vite plugin that generates a React Router v7 SPA route config from your file system.
Drop a `.tsx` file in `src/routes/` and the route exists — no manual registration required.

> **Important:** this plugin targets React Router's [data mode](https://reactrouter.com/start/modes#data)
> (`createBrowserRouter` + `RouterProvider`). It is not compatible with framework mode (Remix-style).

---

## Quick Start

### 1. Create a new Vite + React project

```bash
npx create-vite@latest my-app -- --template react-ts
cd my-app
npm install
```

### 2. Install React Router

```bash
npm i react-router
```

### 3. Install this plugin

```bash
npm i -D vite-plugin-react-router-fs
```

### 4. Register the plugin in `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileBasedRouting } from 'vite-plugin-react-router-fs';

export default defineConfig({
  plugins: [
    react(),
    fileBasedRouting({
      routesDir: 'src/routes', // directory to scan
      output: 'src/routes.ts', // generated file (auto-updated)
    }),
  ],
});
```

### 5. Wire up the router in `src/main.tsx`

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import routes from './routes';

const router = createBrowserRouter(routes);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
```

### 6. Create your first routes

```bash
mkdir src/routes
```

```tsx
// src/routes/index.tsx  →  /
export default function Home() {
  return <h1>Home</h1>;
}

// src/routes/about.tsx  →  /about
export default function About() {
  return <h1>About</h1>;
}
```

Start the dev server — `src/routes.ts` is auto-generated and stays in sync as you add files:

```bash
npm run dev
```

> `src/routes.ts` is auto-generated. Add it to `.gitignore` if you prefer not to commit it.

---

## File Convention

Routes live under `src/routes/`. The plugin scans this directory recursively and
generates `src/routes.ts` on startup and on every file change.

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

### Reserved filenames — never treated as routes

| File         | Purpose                                                                       |
| ------------ | ----------------------------------------------------------------------------- |
| `layout.tsx` | Wraps all routes at the same directory level and below                        |
| `guard.tsx`  | Runs before the view; render `<Outlet />` to allow or `<Navigate />` to block |

---

## Layouts

A `layout.tsx` in a directory wraps every route under that directory. Layouts nest
from outermost to innermost — `src/routes/layout.tsx` wraps everything; `src/routes/admin/layout.tsx`
wraps only admin routes, nested inside the root layout.

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

A `guard.tsx` in a directory runs before any route at that level renders.
Render `<Outlet />` to allow access, or `<Navigate />` to redirect.

Guards nest: both `src/routes/guard.tsx` and `src/routes/admin/guard.tsx` apply to
admin routes (root guard outermost).

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

A folder named `(name)` is a route group. The name is stripped from all URLs, but the
folder can carry its own `layout.tsx` and `guard.tsx` that scope only to routes inside it.

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
  about.tsx        → /about
```

- The group name never appears in any URL.
- Multiple groups at the same level are independent — each has its own guard/layout scope.
- Groups nest: `(shop)/(checkout)/payment.tsx` → `/payment`, with both layouts stacking.
- Duplicate URL segments across groups emit a `console.warn` at build time.

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

Wrap a segment in square brackets to create a URL parameter:

```
src/routes/blog/[slug].tsx       →  /blog/:slug
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

## Plugin Options

```ts
fileBasedRouting({
  routesDir: 'src/routes', // directory to scan (relative to project root)
  output: 'src/routes.ts', // file to write (relative to project root)
});
```

---

## Generated File

`src/routes.ts` is auto-generated — do not edit it manually. It exports a `RouteObject[]`
compatible with `createBrowserRouter`. All components are lazy-loaded for automatic code splitting.

```
# .gitignore
src/routes.ts
```

---

## AI Coding Agent Skill

This repo ships a **`file-based-routing` skill** for AI coding agents (OpenCode, etc.).
Once installed, the agent understands this plugin's conventions and can create views,
layouts, guards, and route groups correctly without extra explanation.

The skill covers:

- Creating static, dynamic, and catch-all routes
- Adding layouts (`layout.tsx`) and guards (`guard.tsx`)
- Creating and nesting route groups (`(name)/`)
- TypeScript best practices (`useParams<{…}>()`, imports from `'react-router'`, etc.)
- Guard testability patterns using URL search params

**Install via:**

```bash
npx skills add eralvarez/vite-plugin-react-router-fs
```

After installation, the agent will load the skill automatically whenever you ask it to
add a route, create a layout, add a guard, or work with route groups in this project.

---

## Plugin Development

This repo contains both the plugin source (`plugin/`) and a full example application
(`src/`) that exercises every routing convention.

### Dev

```bash
npm install
npm run dev        # example app on port 3000, watches src/routes/ for changes
npm run test:e2e   # build + Playwright e2e suite (108 tests)
```

The example app covers every supported convention: layouts, guards, groups, dynamic
segments, catch-all. Use it to verify plugin changes interactively.

### Build

Compiles the plugin to `dist/` (ESM, CJS, and TypeScript declarations):

```bash
npm run build:plugin
```

```
dist/
  index.js       # ESM
  index.cjs      # CommonJS
  index.d.ts     # TypeScript declarations (ESM)
  index.d.cts    # TypeScript declarations (CJS)
```

### Publish

`prepublishOnly` runs `build:plugin` automatically:

```bash
npm version patch   # or minor / major
npm publish
```

Only `dist/` is included in the published package. The example app, e2e tests, and
plugin source are not published.

### Example App Scripts

```bash
npm run dev        # dev server on port 3000
npm run build      # production build → dist-app/
npm start          # serve dist-app/ on port 3000
npm run preview    # Vite preview server
npm run format     # Prettier --write .
npm run typecheck  # tsc --noEmit
npm run test:e2e   # Playwright e2e tests
```

### Project Structure

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

### E2E Test Coverage

| File              | What it tests                                                     |
| ----------------- | ----------------------------------------------------------------- |
| `routing.spec.ts` | Route resolution, client-side nav                                 |
| `layouts.spec.ts` | Layout scope, nesting, isolation                                  |
| `guards.spec.ts`  | Redirect/allow, guard independence, guard+layout composition      |
| `dynamic.spec.ts` | Param extraction for `:slug` and `:id`, catch-all behavior        |
| `groups.spec.ts`  | Group URL resolution, layout scope, guard block/allow, nesting    |
