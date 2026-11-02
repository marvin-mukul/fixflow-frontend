import type { RouteObject } from 'react-router'
import { PATHS } from '@/constants/paths'
import { RequireAuth } from '@/routes/guards/RequireAuth'
import { RequireRole } from '@/routes/guards/RequireRole'
import { lazyPage as page } from '@/routes/lazyPage'

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
              { path: PATHS.CUSTOMER_HOME, lazy: page(() => import('@/pages/CustomerDashboardPage')) },
              { path: PATHS.CUSTOMER_PROPERTIES, lazy: page(() => import('@/pages/PropertiesPage')) },
              { path: PATHS.CUSTOMER_PROPERTY_NEW, lazy: page(() => import('@/pages/PropertyNewPage')) },
              {
                path: PATHS.CUSTOMER_PROPERTY_DETAIL,
                lazy: page(() => import('@/pages/PropertyDetailPage')),
              },
              {
                path: PATHS.CUSTOMER_PROPERTY_EDIT,
                lazy: page(() => import('@/pages/PropertyEditPage')),
              },
            ],
          },
        ],
      },
    ],
  },
]
