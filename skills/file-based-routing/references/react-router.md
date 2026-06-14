---
title: React Router v7
description: Official React Router documentation for APIs used by this project's file-based routing plugin
---

# React Router v7 — Official Documentation

This project uses **React Router v7** in **library / declarative mode** as a client-side SPA.
The Vite plugin in `plugin/` scans `src/routes/` and generates a `RouteObject[]` consumed by
`createBrowserRouter` — it is **not** React Router's built-in framework mode or `@react-router/fs-routes`.

Use this reference when you need deeper API details beyond what `SKILL.md` covers.

---

## Getting Started (Library Mode)

| Topic | Use when | Documentation |
| ----- | -------- | ------------- |
| Installation | Adding React Router to a Vite SPA | [Library installation](https://reactrouter.com/start/library/installation) |
| Routing | Nested routes, layouts, dynamic segments, splats | [Library routing](https://reactrouter.com/start/library/routing) |
| Navigating | `Link`, `NavLink`, `useNavigate`, redirects | [Library navigating](https://reactrouter.com/start/library/navigating) |
| URL values | Search params, hash, location state | [URL values](https://reactrouter.com/start/library/url-values) |

---

## Route Configuration

The plugin generates the same route shapes documented here:

| Topic | Use when | Documentation |
| ----- | -------- | ------------- |
| `RouteObject` | Understanding the generated `src/routes.ts` tree | [Route object](https://reactrouter.com/start/data/route-object) |
| `createBrowserRouter` | Bootstrapping the app (`src/main.tsx`) | [Custom framework / data mode](https://reactrouter.com/start/data/custom) |
| Lazy routes | How `lazy: () => import(...)` code-splits views | [Custom framework — lazy loading](https://reactrouter.com/start/data/custom#3-lazy-loading) |
| Layout routes | Pathless wrappers (`layout.tsx`, `guard.tsx`) | [Library routing — layout routes](https://reactrouter.com/start/library/routing#layout-routes) |
| Index routes | `index.tsx` files at a directory URL | [Library routing — index routes](https://reactrouter.com/start/library/routing#index-routes) |
| Dynamic segments | `[param].tsx` → `:param` | [Library routing — dynamic segments](https://reactrouter.com/start/library/routing#dynamic-segments) |
| Splats / catch-all | `[...slug].tsx` → `*` | [Library routing — splats](https://reactrouter.com/start/library/routing#splats) |

---

## Components

| API | Use in this project | Documentation |
| --- | ------------------- | ------------- |
| `<Outlet />` | Layouts and guards render child routes | [Outlet](https://reactrouter.com/api/components/Outlet) |
| `<Navigate />` | Guards redirect blocked users | [Navigate](https://reactrouter.com/api/components/Navigate) |
| `<Link />` | In-page links inside views | [Link](https://reactrouter.com/api/components/Link) |
| `<NavLink />` | Section nav with active styles | [NavLink](https://reactrouter.com/api/components/NavLink) |
| `<RouterProvider />` | App root in `src/main.tsx` | [RouterProvider](https://reactrouter.com/api/data-routers/RouterProvider) |

---

## Hooks

| API | Use in this project | Documentation |
| --- | ------------------- | ------------- |
| `useParams` | Reading `[id].tsx` / `[slug].tsx` params | [useParams](https://reactrouter.com/api/hooks/useParams) |
| `useSearchParams` | Guards testable via `?auth=true` etc. | [useSearchParams](https://reactrouter.com/api/hooks/useSearchParams) |
| `useLocation` | Catch-all 404 page shows current pathname | [useLocation](https://reactrouter.com/api/hooks/useLocation) |
| `useNavigate` | Programmatic navigation after auth | [useNavigate](https://reactrouter.com/api/hooks/useNavigate) |
| `useOutletContext` | Passing data from layout to child views | [useOutletContext](https://reactrouter.com/api/hooks/useOutletContext) |

---

## Not Applicable to This Project

These React Router features exist but are **out of scope** for this SPA example:

| Feature | Why |
| ------- | --- |
| [Framework mode](https://reactrouter.com/start/framework/installation) | Full-stack SSR; this repo targets static CDN deployment |
| [@react-router/fs-routes](https://reactrouter.com/how-to/file-route-conventions) | React Router's own file conventions — this project uses a custom Vite plugin instead |
| Loaders & actions | No server; data fetching is client-side only |
| `react-router-dom` package | React Router v7 consolidates exports in `react-router` |

---

## External Links

- [React Router home](https://reactrouter.com/)
- [API reference index](https://reactrouter.com/api)
- [Changelog](https://github.com/remix-run/react-router/blob/main/CHANGELOG.md)
