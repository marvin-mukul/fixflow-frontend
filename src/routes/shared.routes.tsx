import type { RouteObject } from 'react-router'
import { PATHS } from '@/constants/paths'
import { RequireAuth } from '@/routes/guards/RequireAuth'
import { lazyPage as page } from '@/routes/lazyPage'

/** Screens for any signed-in participant (authorisation is enforced by the API). */
export const sharedRoutes: RouteObject[] = [
  {
    Component: RequireAuth,
    children: [
      {
        lazy: () => import('@/layouts/ParticipantLayout').then((m) => ({ Component: m.default })),
        children: [{ path: PATHS.INVOICE_DETAIL, lazy: page(() => import('@/pages/InvoicePage')) }],
      },
      {
        lazy: () => import('@/layouts/AuthLayout').then((m) => ({ Component: m.default })),
        children: [{ path: PATHS.MOCK_PAY, lazy: page(() => import('@/pages/MockPayPage')) }],
      },
    ],
  },
]
