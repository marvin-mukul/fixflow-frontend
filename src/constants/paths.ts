export const PATHS = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CHANGE_PASSWORD: '/change-password',
  FORBIDDEN: '/403',
  SERVER_ERROR: '/500',
  CUSTOMER_HOME: '/app',
  WORKER_HOME: '/worker',
  ADMIN_HOME: '/admin',
  NOT_FOUND: '*',
} as const

export type AppPath = (typeof PATHS)[keyof typeof PATHS]
