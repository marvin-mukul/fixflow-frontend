export const PATHS = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CHANGE_PASSWORD: '/change-password',
  FORBIDDEN: '/403',
  SERVER_ERROR: '/500',
  ACCEPT_INVITATION: '/invitations/:token',

  CUSTOMER_HOME: '/app',
  CUSTOMER_PROPERTIES: '/app/properties',
  CUSTOMER_PROPERTY_NEW: '/app/properties/new',
  CUSTOMER_PROPERTY_DETAIL: '/app/properties/:id',
  CUSTOMER_PROPERTY_EDIT: '/app/properties/:id/edit',
  CUSTOMER_REQUESTS: '/app/requests',
  CUSTOMER_REQUEST_NEW: '/app/requests/new',
  CUSTOMER_REQUEST_DETAIL: '/app/requests/:id',
  CUSTOMER_APPROVALS: '/app/approvals',

  WORKER_HOME: '/worker',
  WORKER_ONBOARDING: '/worker/onboarding',
  WORKER_LEADS: '/worker/leads',
  WORKER_LEAD_DETAIL: '/worker/leads/:requestId',
  WORKER_QUOTES: '/worker/quotes',
  WORKER_JOBS: '/worker/jobs',
  WORKER_JOB_DETAIL: '/worker/jobs/:id',
  WORKER_PROFILE: '/worker/profile',

  ADMIN_HOME: '/admin',
  NOT_FOUND: '*',
} as const

export type AppPath = (typeof PATHS)[keyof typeof PATHS]

type ParamNames<P extends string> = P extends `${string}:${infer Param}/${infer Rest}`
  ? Param | ParamNames<`/${Rest}`>
  : P extends `${string}:${infer Param}`
    ? Param
    : never

type PathParams<P extends string> = { [K in ParamNames<P>]: string }

/** Fills `:param` segments of a `PATHS` pattern, e.g. `buildPath(PATHS.CUSTOMER_PROPERTY_DETAIL, { id })`. */
export function buildPath<P extends AppPath>(pattern: P, params: PathParams<P>): string {
  const values = params as Record<string, string>
  return pattern.replace(/:([A-Za-z]+)/g, (_, name: string) => encodeURIComponent(values[name] ?? ''))
}
