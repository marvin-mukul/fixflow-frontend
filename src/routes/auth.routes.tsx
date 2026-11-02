import type { RouteObject } from 'react-router'
import { PATHS } from '@/constants/paths'
import { GuestOnly } from '@/routes/guards/GuestOnly'
import { RequireAuth } from '@/routes/guards/RequireAuth'

const authLayout = () => import('@/layouts/AuthLayout').then((m) => ({ Component: m.default }))

export const authRoutes: RouteObject[] = [
  {
    Component: GuestOnly,
    children: [
      {
        lazy: authLayout,
        children: [
          {
            path: PATHS.LOGIN,
            lazy: () => import('@/pages/LoginPage').then((m) => ({ Component: m.default })),
          },
          {
            path: PATHS.REGISTER,
            lazy: () => import('@/pages/RegisterPage').then((m) => ({ Component: m.default })),
          },
        ],
      },
    ],
  },
  {
    Component: RequireAuth,
    children: [
      {
        lazy: authLayout,
        children: [
          {
            path: PATHS.CHANGE_PASSWORD,
            lazy: () =>
              import('@/pages/ChangePasswordPage').then((m) => ({ Component: m.default })),
          },
        ],
      },
    ],
  },
]
