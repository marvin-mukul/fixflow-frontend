# Frontend progress

| Step | Status | Date | Deviations / notes |
| --- | --- | --- | --- |
| 0b | done | 2026-11-01 | Baseline: Tailwind v4, shadcn base-nova, React Router 8 data mode, `@/` alias, PATHS. Pages use theme tokens + shadcn `buttonVariants`. |
| 3 | done | 2026-11-02 | Auth (Redux slice + thunks, axios single-flight refresh), role shells from shadcn `sidebar-07`, auth pages from `login-03`, guards, error pages; Vitest+RTL+MSW (15 tests). Deviations: guest-only guard (`GuestOnly`) does the post-login redirect (to `from` or role home); `routes/appRoutes.tsx` holds the route tree so tests can use a memory router (router.tsx still only imported by main.tsx); interceptor toasts only network/5xx, other 4xx are shown by forms; refresh failure clears the session locally (`sessionCleared`) rather than calling `/auth/logout`; shadcn `use-mobile.ts` exempted from `react-hooks/set-state-in-effect`; jsdom origin set to the API origin in vitest to avoid CORS preflights. |
| 4 | next | | |
