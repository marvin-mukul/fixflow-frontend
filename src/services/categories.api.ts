import { api } from '@/lib/axios'
import type { Category } from '@/types/category'

let cache: Category[] | null = null
let inflight: Promise<Category[]> | null = null

/** Public category list (rarely changes, so cached for the session). */
export function loadCategories(): Promise<Category[]> {
  if (cache) return Promise.resolve(cache)
  if (!inflight) {
    inflight = api
      .get<{ items: Category[] }>('/categories')
      .then(({ data }) => {
        cache = data.items.filter((c) => c.isActive)
        return cache
      })
      .finally(() => {
        inflight = null
      })
  }
  return inflight
}

export function cachedCategories(): Category[] | null {
  return cache
}

/** Drops the cache after an admin changes categories so the next load is fresh. */
export function invalidateCategories(): void {
  cache = null
}
