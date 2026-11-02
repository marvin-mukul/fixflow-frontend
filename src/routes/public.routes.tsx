import type { RouteObject } from 'react-router'
import { PATHS } from '@/constants/paths'

export const publicRoutes: RouteObject[] = [
  {
    path: PATHS.HOME,
    lazy: () => import('@/pages/LandingPage').then((m) => ({ Component: m.default })),
  },
  {
    // Invite links (`APP_URL/invitations/:token`) work for guests and signed-in users.
    lazy: () => import('@/layouts/AuthLayout').then((m) => ({ Component: m.default })),
    children: [
      {
        path: PATHS.ACCEPT_INVITATION,
        lazy: () =>
          import('@/pages/AcceptInvitationPage').then((m) => ({ Component: m.default })),
      },
    ],
  },
  {
    path: PATHS.FORBIDDEN,
    lazy: () => import('@/pages/ForbiddenPage').then((m) => ({ Component: m.default })),
  },
  {
    path: PATHS.SERVER_ERROR,
    lazy: () => import('@/pages/ServerErrorPage').then((m) => ({ Component: m.default })),
  },
]
