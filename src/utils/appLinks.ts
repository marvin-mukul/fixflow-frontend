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
]

export function resolveAppLink(link: string | null | undefined): string | null {
  if (!link) return null
  for (const rule of RULES) {
    const match = link.match(rule.pattern)
    if (match) return rule.to(match)
  }
  // Worker links (`/worker/...`) already match the app routes.
  return link.startsWith('/') ? link : null
}
