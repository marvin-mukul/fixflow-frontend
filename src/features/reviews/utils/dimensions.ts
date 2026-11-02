import type { RatingDimension } from '@/features/reviews/types/review.types'

export const ON_SITE_DIMENSIONS: RatingDimension[] = ['quality', 'punctuality', 'behaviour']

export const DIMENSION_LABELS: Record<RatingDimension, { label: string; hint: string }> = {
  quality: { label: 'Quality of work', hint: 'Was the repair done well?' },
  punctuality: { label: 'Punctuality', hint: 'Did they arrive on time?' },
  behaviour: { label: 'Behaviour', hint: 'Were they polite and tidy?' },
  value: { label: 'Value for money', hint: 'Was the price fair for the work?' },
}

export const REVIEW_EDIT_WINDOW_MS = 24 * 60 * 60 * 1000

/**
 * Mirrors the API rule: on-site dimensions for the raiser/tenant, value for the
 * payer/owner, overall for everyone. A worker rates the customer (overall + comment).
 */
export function allowedDimensions(relations: readonly string[]): RatingDimension[] {
  if (isWorkerReviewer(relations)) return []
  const out = new Set<RatingDimension>()
  if (relations.includes('RAISER') || relations.includes('TENANT')) ON_SITE_DIMENSIONS.forEach((d) => out.add(d))
  if (relations.includes('PAYER') || relations.includes('OWNER')) out.add('value')
  return ON_SITE_DIMENSIONS.concat('value').filter((d) => out.has(d))
}

export function isWorkerReviewer(relations: readonly string[]): boolean {
  return relations.includes('WORKER')
}
