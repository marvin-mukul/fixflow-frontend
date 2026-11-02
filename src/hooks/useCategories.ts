import { useEffect, useState } from 'react'
import { toApiError } from '@/lib/apiError'
import { cachedCategories, loadCategories } from '@/services/categories.api'
import type { ApiError } from '@/types/api'
import type { Category } from '@/types/category'

interface CategoriesState {
  items: Category[]
  loading: boolean
  error: ApiError | null
}

/** Active repair categories (shared by requests and worker onboarding). */
export function useCategories(): CategoriesState {
  const [state, setState] = useState<CategoriesState>(() => {
    const cached = cachedCategories()
    return { items: cached ?? [], loading: cached === null, error: null }
  })

  useEffect(() => {
    if (cachedCategories()) return
    let active = true
    loadCategories()
      .then((items) => active && setState({ items, loading: false, error: null }))
      .catch((err: unknown) => active && setState({ items: [], loading: false, error: toApiError(err) }))
    return () => {
      active = false
    }
  }, [])

  return state
}
