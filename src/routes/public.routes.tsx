import type { RouteObject } from 'react-router'
import { PATHS } from '@/constants/paths'

export const publicRoutes: RouteObject[] = [
  {
    path: PATHS.HOME,
    lazy: () =>
      import('@/pages/HomePage').then((m) => ({ Component: m.default })),
  },
]
