import type { RouteObject } from 'react-router'
import { PATHS } from '@/constants/paths'
import { RequireAuth } from '@/routes/guards/RequireAuth'
import { RequireRole } from '@/routes/guards/RequireRole'
import { lazyPage } from '@/routes/lazyPage'

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
              { path: PATHS.ADMIN_HOME, lazy: lazyPage(() => import('@/pages/AdminDashboardPage')) },
              { path: PATHS.ADMIN_WORKERS, lazy: lazyPage(() => import('@/pages/AdminWorkersPage')) },
              { path: PATHS.ADMIN_DISPUTES, lazy: lazyPage(() => import('@/pages/AdminDisputesPage')) },
              { path: PATHS.ADMIN_PAYMENTS, lazy: lazyPage(() => import('@/pages/AdminPaymentsPage')) },
              { path: PATHS.ADMIN_CATEGORIES, lazy: lazyPage(() => import('@/pages/AdminCategoriesPage')) },
              { path: PATHS.ADMIN_SETTINGS, lazy: lazyPage(() => import('@/pages/AdminSettingsPage')) },
              {
                element: <RequireRole roles={['SUPERADMIN']} />,
                children: [
                  { path: PATHS.ADMIN_ADMINS, lazy: lazyPage(() => import('@/pages/AdminAdminsPage')) },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]
