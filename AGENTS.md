# FixFlow Frontend – Agent Guide

Follow these conventions for every change. If a rule here conflicts with a habit, the rule wins.

## Stack
- React 19 + TypeScript (strict, `erasableSyntaxOnly`) + Vite
- Tailwind CSS v4 + shadcn/ui (`base-nova` style, lucide icons)
- React Router v7+ in **data mode** (`createBrowserRouter` + `RouterProvider`)
- Redux Toolkit + react-redux for global state, axios for HTTP
- Node 26 LTS (see `.nvmrc`). TypeScript is pinned to `~6.0.x` because `typescript-eslint` does not support TS 7 yet. Do not bump it until it does.

## Commands
- `npm run dev` – dev server
- `npm run build` – `tsc -b && vite build`
- `npm run lint` – ESLint
- Always run `npx tsc -b && npx eslint .` before finishing a task.

## Import alias
Use `@/` (maps to `src/`). Never use `../../` chains across top-level folders.

## Folder structure (`src/`)
| Folder | Purpose |
|---|---|
| `routes/` | Router setup and route definitions only |
| `pages/` | One thin `XxxPage.tsx` per URL |
| `layouts/` | Page shells (`MainLayout`, `AuthLayout`) |
| `features/<name>/` | Business domains (auth, tickets, ...) |
| `components/ui/` | **shadcn-owned.** Generated primitives |
| `components/common/` | Shared app-wide components with no business logic |
| `components/layout/` | Navbar, Sidebar, Footer |
| `hooks/` | Shared custom hooks |
| `store/` | Redux store setup, typed hooks |
| `services/` | Shared API layer |
| `lib/` | Third-party wrappers (axios instance, `cn`) |
| `types/` | Shared types |
| `utils/` | Pure helpers |
| `constants/` | App constants (`paths.ts`) |
| `config/` | Env and app config |

## Features
- A feature = one business domain. It owns its UI, API calls, hooks, slice and types:
  ```
  features/auth/
    components/  api/  hooks/  store/  types/
  ```
  Create only the subfolders the feature needs.
- Anything with business logic, API calls, or its own state goes in a feature, not in `components/`.
- **Import files directly** (`@/features/auth/components/LoginForm`). Do **not** create `index.ts` barrel files; they hurt Vite tree-shaking.
- **Features must not import from other features.** Compose features in `pages/` or `routes/`. If two features need the same code, move it to `components/common`, `lib` or `utils`.
- Dependency direction is one-way: `routes/pages -> features -> components/ui, lib, utils, hooks, types`.
  Shared code never imports from features; features never import from `routes/` or `pages/`.

## Pages
- File name: `XxxPage.tsx`, component `XxxPage`, default export.
- Thin: layout plus feature composition. No fetching, validation or heavy state inside a page.

## Routing
- `routes/router.tsx` creates the router. **Only `main.tsx` imports it.** No other file may import `router`.
- Routes are split by domain into `routes/<domain>.routes.tsx`, each exporting a `RouteObject[]` (e.g. `publicRoutes`, `authRoutes`, `dashboardRoutes`). `router.tsx` just spreads them together.
- Every page route is lazy: `lazy: () => import('@/pages/XxxPage').then((m) => ({ Component: m.default }))`.
- Use nested routes with a layout route (`Component: SomeLayout` + `<Outlet />`) for shared shells, and put guards (auth) on the parent route.
- **All paths live in `constants/paths.ts`.** `Link`, `navigate()` and route definitions use `PATHS.X`, never string literals. This is why components never need to import the router.
- To add a page: create `pages/XxxPage.tsx`, add a `PATHS` entry, add a lazy route in the right `*.routes.tsx`.

## shadcn
- Add components with `npx shadcn@latest add <name>`. They land in `components/ui/`.
- Do not hand-edit or place custom components in `components/ui/`. Wrap or compose them in `components/common/` instead.
- Prefer a shadcn primitive over writing a custom one. Use `cn` from `@/lib/utils` for class merging.

## Styling
- Tailwind utility classes only. No new CSS files; theme tokens live in `src/index.css`.

## Git
- Conventional commits (`feat:`, `fix:`, `chore:`).
- Do not add `Co-Authored-By` lines to commits.
- Push with the `github-work` SSH host (`git@github-work:marvin-mukul/fixflow-frontend.git`), which authenticates as `marvin-mukul`.
