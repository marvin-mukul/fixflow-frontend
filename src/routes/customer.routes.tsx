import type { RouteObject } from 'react-router'
import { PATHS } from '@/constants/paths'
import { RequireAuth } from '@/routes/guards/RequireAuth'
import { RequireRole } from '@/routes/guards/RequireRole'

export const customerRoutes: RouteObject[] = [
  {
    Component: RequireAuth,
    children: [
      {
        element: <RequireRole roles={['CUSTOMER']} />,
        children: [
          {
            lazy: () => import('@/layouts/CustomerLayout').then((m) => ({ Component: m.default })),
            children: [
              {
                path: PATHS.CUSTOMER_HOME,
                lazy: () =>
                  import('@/pages/CustomerDashboardPage').then((m) => ({ Component: m.default })),
              },
            ],
          },
        ],
      },
    ],
  },
]
