# FixFlow frontend

Web app for FixFlow, a home repair marketplace. Owners and tenants raise repair requests, nearby workers quote, the payer accepts a quote, the job is tracked to completion, then paid and reviewed. Admins verify workers, resolve disputes and manage payments, categories and platform settings.

The API lives in the sibling repo `fixflow-backend`.

## Stack

- React 19, TypeScript (strict), Vite
- Tailwind CSS v4 and shadcn/ui (`base-nova` style on Base UI, lucide icons)
- React Router (data mode: `createBrowserRouter` with lazy routes)
- Redux Toolkit slices and thunks with axios (no RTK Query)
- react-hook-form and zod for forms
- Optional Mapbox maps (`react-map-gl`, loaded lazily)
- Vitest, Testing Library and MSW for unit and component tests; Playwright for E2E

## Setup

```bash
nvm use            # Node 26 (see .nvmrc)
npm ci
cp .env.example .env
npm run dev        # http://localhost:5173
```

The backend must be running on `VITE_API_URL` (default `http://localhost:4000/api/v1`). See the backend README for the database and seed. Demo users (password `Demo@123`): `owner@demo.fixflow`, `tenant@demo.fixflow`, `plumber1@demo.fixflow`, `admin@demo.fixflow`.

### Environment (`.env`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:4000/api/v1` | API base URL. On Vercel set it to `/api/v1`: `vercel.json` proxies `/api/*` to the backend so the refresh cookie stays first-party |
| `VITE_PAYMENT_PROVIDER` | `mock` | `mock` redirects to the built-in `/pay/mock/:orderId` test checkout. `cashfree` loads the Cashfree JS SDK on demand. It must match the backend's `PAYMENT_PROVIDER`. |
| `VITE_MAPBOX_TOKEN` | empty | Optional. Without it, location pickers fall back to latitude/longitude inputs and maps show a coordinate card with an "open in map" link. With it, Mapbox GL is loaded as a lazy chunk. |

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | `tsc -b` (app, Node config and E2E projects) |
| `npm run lint` | ESLint |
| `npm test` | Vitest (jsdom and MSW, no backend needed; `VITE_*` values are pinned in `vitest.config.ts`) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run e2e` | Playwright golden-path test against the real backend |

Checks to run before every commit: `npx tsc -b && npx eslint . && npm test`.

## End-to-end tests

`e2e/golden-path.spec.ts` drives one request through the whole flow with three browser contexts (tenant, owner, plumber). The tenant raises a plumbing request with a photo, the owner approves it, the plumber quotes on the masked lead (the test checks that no street address is shown), the owner accepts, the plumber goes en route, arrives, starts and completes with an after photo, the tenant confirms, the owner pays through the mock checkout and lands on the paid invoice, and all three leave reviews.

Prerequisites:

- `../fixflow-backend` checked out with `npm ci` done, and a PostgreSQL + PostGIS database migrated for it (`npx prisma migrate deploy` in the backend).
- Chromium for Playwright: `npx playwright install chromium`. On a fresh Linux machine you may also need its system libraries (`npx playwright install-deps chromium`, which needs sudo).

Run it:

```bash
E2E_DATABASE_URL=postgresql://fixflow:fixflow@localhost:5432/fixflow npm run e2e
```

What happens:

1. `globalSetup` runs the backend's `npm run db:e2e-reset`, which truncates every table in `E2E_DATABASE_URL` and re-seeds it. **Never point it at a database you care about.**
2. Playwright `webServer` starts the backend (`npx tsx src/server.ts` with `PAYMENT_PROVIDER=mock`) and Vite (with `VITE_PAYMENT_PROVIDER=mock` and an empty Mapbox token), waits for `/health` and the app, and stops both afterwards.

| Variable | Default |
| --- | --- |
| `E2E_DATABASE_URL` | `postgresql://fixflow:fixflow@localhost:5432/fixflow` |
| `E2E_DATABASE_URL_TEST` | `${E2E_DATABASE_URL}_test` (the backend requires it at startup) |
| `E2E_API_PORT` / `E2E_WEB_PORT` | `4000` / `5173` |
| `E2E_BACKEND_DIR` | `../fixflow-backend` |

Outside CI, servers already listening on those ports are reused. Stop your dev servers first. A backend running against a different database than `E2E_DATABASE_URL` won't see the re-seeded data, and a dev Vite server that re-optimizes dependencies can reload the page in the middle of the test. On failure, a screenshot and trace are written to `test-results/` (`npx playwright show-trace <trace.zip>`).

## Project structure

```
src/
  routes/       router + <domain>.routes.tsx (lazy page routes, guards)
  pages/        one thin XxxPage.tsx per URL (composition only)
  layouts/      role shells (customer, worker, admin), auth layout
  features/     business domains: auth, properties, requests, quotes, worker,
                jobs, invoices, reviews, notifications, admin
                (each owns components/, store/, api/, hooks/, types/)
  components/   ui/ (shadcn-generated, not hand-edited), common/, layout/
  hooks/ services/ lib/ store/ constants/ config/ utils/ types/
e2e/            Playwright spec, env, global setup, fixtures
```

Main conventions (the full rules are in [`AGENTS.md`](./AGENTS.md)):

- Import with the `@/` alias and never use barrel files.
- Features never import from other features. Pages compose them, using render props where a screen spans domains.
- All URLs live in `constants/paths.ts` (`PATHS`, `buildPath`).
- Use a shadcn component first. Shared building blocks (`DataTable`, `EmptyState`, `ErrorAlert`, `Loader`, `StatusBadge`, …) live in `components/common`.
- Money is integer paise. Forms edit rupees and convert at the edge. Times are stored in UTC and shown in IST.
- Buttons for request and job transitions come only from the API's `availableActions` / `workerActions` / `customerActions`. Authorisation is enforced by the server.

## Payments

The UI only calls the checkout endpoint and follows what comes back:

- `mock` (the default, used in the demo, tests and E2E): you are redirected to `/pay/mock/:orderId` and choose "Pay (success)" or "Fail". The API's return URL then redirects to `/invoices/:id?status=…`, and that page polls until the invoice is marked paid.
- `cashfree`: set `VITE_PAYMENT_PROVIDER=cashfree` here and `PAYMENT_PROVIDER=cashfree` (with sandbox keys) in the backend. The Cashfree SDK is injected only when checkout starts.

Payers can also mark an invoice as paid offline, which the worker then confirms.
