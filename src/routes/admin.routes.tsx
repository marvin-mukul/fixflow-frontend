import type { RouteObject } from 'react-router'
import { PATHS } from '@/constants/paths'
import { RequireAuth } from '@/routes/guards/RequireAuth'
import { RequireRole } from '@/routes/guards/RequireRole'

export const adminRoutes: RouteObject[] = [
  {
    Component: RequireAuth,
    children: [
      {
        element: <RequireRole roles={['ADMIN', 'SUPERADMIN']} />,
        children: [
          {
            lazy: () => import('@/layouts/AdminLayout').then((m) => ({ Component: m.default })),
            children: [
              {
                path: PATHS.ADMIN_HOME,
                lazy: () =>
                  import('@/pages/AdminDashboardPage').then((m) => ({ Component: m.default })),
              },
            ],
          },
        ],
      },
    ],
  },
]
