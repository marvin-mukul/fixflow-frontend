import { buildPath, PATHS } from '@/constants/paths'

type LinkRule = { pattern: RegExp; to: (match: RegExpMatchArray) => string }

/**
 * Notification links come from the API as backend-style paths
 * (`/requests/:id`, `/worker/leads/:id`, …). Translate them to app routes.
 */
const RULES: LinkRule[] = [
  { pattern: /^\/requests\/([^/?#]+)/, to: (m) => buildPath(PATHS.CUSTOMER_REQUEST_DETAIL, { id: m[1] ?? '' }) },
  { pattern: /^\/requests\/?$/, to: () => PATHS.CUSTOMER_REQUESTS },
  { pattern: /^\/approvals\/?$/, to: () => PATHS.CUSTOMER_APPROVALS },
  { pattern: /^\/worker\/jobs\/([^/?#]+)/, to: (m) => buildPath(PATHS.WORKER_JOB_DETAIL, { id: m[1] ?? '' }) },
  { pattern: /^\/worker\/jobs\/?$/, to: () => PATHS.WORKER_JOBS },
  { pattern: /^\/worker\/leads\/([^/?#]+)/, to: (m) => buildPath(PATHS.WORKER_LEAD_DETAIL, { requestId: m[1] ?? '' }) },
  { pattern: /^\/worker\/profile\/?$/, to: () => PATHS.WORKER_PROFILE },
  { pattern: /^\/worker\/earnings\/?$/, to: () => PATHS.WORKER_EARNINGS },
  { pattern: /^\/invoices\/([^/?#]+)/, to: (m) => buildPath(PATHS.INVOICE_DETAIL, { id: m[1] ?? '' }) },
]

export function resolveAppLink(link: string | null | undefined): string | null {
  if (!link) return null
  for (const rule of RULES) {
    const match = link.match(rule.pattern)
    if (match) return rule.to(match)
  }
  // Any other app-style path (`/worker/...`) is used as-is.
  return link.startsWith('/') ? link : null
}
