import type { RouteObject } from 'react-router'
import { Loader } from '@/components/common/Loader'
import { PATHS } from '@/constants/paths'
import RouteErrorBoundary from '@/pages/RouteErrorBoundary'
import { adminRoutes } from '@/routes/admin.routes'
import { authRoutes } from '@/routes/auth.routes'
import { customerRoutes } from '@/routes/customer.routes'
import { publicRoutes } from '@/routes/public.routes'
import { workerRoutes } from '@/routes/worker.routes'

/** Route tree shared by the browser router and tests (memory router). */
export const appRoutes: RouteObject[] = [
  {
    id: 'root',
    errorElement: <RouteErrorBoundary />,
    HydrateFallback: () => <Loader fullScreen />,
    children: [
      ...publicRoutes,
      ...authRoutes,
      ...customerRoutes,
      ...workerRoutes,
      ...adminRoutes,
      {
        path: PATHS.NOT_FOUND,
        lazy: () => import('@/pages/NotFoundPage').then((m) => ({ Component: m.default })),
      },
    ],
  },
]
