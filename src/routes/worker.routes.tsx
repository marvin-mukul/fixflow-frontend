import type { RouteObject } from 'react-router'
import { PATHS } from '@/constants/paths'
import { RequireAuth } from '@/routes/guards/RequireAuth'
import { RequireRole } from '@/routes/guards/RequireRole'

export const workerRoutes: RouteObject[] = [
  {
    Component: RequireAuth,
    children: [
      {
        element: <RequireRole roles={['WORKER']} />,
        children: [
          {
            lazy: () => import('@/layouts/WorkerLayout').then((m) => ({ Component: m.default })),
            children: [
              {
                path: PATHS.WORKER_HOME,
                lazy: () =>
                  import('@/pages/WorkerDashboardPage').then((m) => ({ Component: m.default })),
              },
            ],
          },
        ],
      },
    ],
  },
]
