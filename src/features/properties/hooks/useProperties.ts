import { useCallback, useEffect } from 'react'
import {
  fetchProperties,
  fetchProperty,
  selectAllProperties,
  selectPropertiesError,
  selectPropertiesStatus,
  selectPropertyDetail,
} from '@/features/properties/store/propertiesSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

/** Property list; fetched on first use (and again when `refresh` is called). */
export function useProperties() {
  const dispatch = useAppDispatch()
  const items = useAppSelector(selectAllProperties)
  const status = useAppSelector(selectPropertiesStatus)
  const error = useAppSelector(selectPropertiesError)

  useEffect(() => {
    if (status === 'idle') void dispatch(fetchProperties())
  }, [dispatch, status])

  const refresh = useCallback(() => dispatch(fetchProperties()), [dispatch])
  return { items, status, error, loading: status === 'loading' || status === 'idle', refresh }
}

/** Minimal `{ id, label, relation }` options, e.g. for the raise-request property select. */
export function usePropertyOptions() {
  const { items, loading, error } = useProperties()
  return {
    options: items.map((p) => ({ id: p.id, label: `${p.label} · ${p.city}`, relation: p.relation })),
    loading,
    error,
  }
}

export function usePropertyDetail(id: string) {
  const dispatch = useAppDispatch()
  const property = useAppSelector((state) => selectPropertyDetail(state, id))
  const status = useAppSelector((state) => state.properties.detailStatus)
  const error = useAppSelector((state) => state.properties.detailError)

  useEffect(() => {
    void dispatch(fetchProperty(id))
  }, [dispatch, id])

  const refresh = useCallback(() => dispatch(fetchProperty(id)), [dispatch, id])
  return { property, status, error, loading: !property && status !== 'failed', refresh }
}
