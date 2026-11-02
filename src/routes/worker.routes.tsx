import type { RouteObject } from 'react-router'
import { PATHS } from '@/constants/paths'
import { RequireAuth } from '@/routes/guards/RequireAuth'
import { RequireRole } from '@/routes/guards/RequireRole'
import { RequireWorkerProfile } from '@/routes/guards/RequireWorkerProfile'
import { lazyPage as page } from '@/routes/lazyPage'

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
                path: PATHS.WORKER_ONBOARDING,
                lazy: page(() => import('@/pages/WorkerOnboardingPage')),
              },
              {
                Component: RequireWorkerProfile,
                children: [
                  { path: PATHS.WORKER_HOME, lazy: page(() => import('@/pages/WorkerDashboardPage')) },
                  { path: PATHS.WORKER_LEADS, lazy: page(() => import('@/pages/LeadsPage')) },
                  { path: PATHS.WORKER_LEAD_DETAIL, lazy: page(() => import('@/pages/LeadDetailPage')) },
                  { path: PATHS.WORKER_QUOTES, lazy: page(() => import('@/pages/MyQuotesPage')) },
                  { path: PATHS.WORKER_JOBS, lazy: page(() => import('@/pages/WorkerJobsPage')) },
                  { path: PATHS.WORKER_JOB_DETAIL, lazy: page(() => import('@/pages/WorkerJobDetailPage')) },
                  { path: PATHS.WORKER_EARNINGS, lazy: page(() => import('@/pages/WorkerEarningsPage')) },
                  { path: PATHS.WORKER_PROFILE, lazy: page(() => import('@/pages/WorkerProfilePage')) },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]
