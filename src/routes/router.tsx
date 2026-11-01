import { createBrowserRouter } from 'react-router'
import { publicRoutes } from './public.routes'

export const router = createBrowserRouter([
  ...publicRoutes,
  {
    path: '*',
    lazy: () =>
      import('@/pages/NotFoundPage').then((m) => ({ Component: m.default })),
  },
])
