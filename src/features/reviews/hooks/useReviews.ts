import { useCallback, useEffect } from 'react'
import {
  fetchPublicWorker,
  fetchWorkerReviews,
  selectPublicWorker,
  selectPublicWorkerError,
  selectPublicWorkerStatus,
  selectWorkerReviews,
} from '@/features/reviews/store/reviewsSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

export function usePublicWorker(id: string) {
  const dispatch = useAppDispatch()
  const worker = useAppSelector((state) => selectPublicWorker(state, id))
  const status = useAppSelector((state) => selectPublicWorkerStatus(state, id))
  const error = useAppSelector((state) => selectPublicWorkerError(state, id))

  useEffect(() => {
    if (id) void dispatch(fetchPublicWorker(id))
  }, [dispatch, id])

  return { worker, status, error }
}

export function useWorkerReviews(workerId: string) {
  const dispatch = useAppDispatch()
  const list = useAppSelector((state) => selectWorkerReviews(state, workerId))

  const reload = useCallback(() => {
    if (workerId) void dispatch(fetchWorkerReviews({ workerId }))
  }, [dispatch, workerId])

  useEffect(reload, [reload])

  const nextCursor = list?.nextCursor ?? null
  const loadMore = useCallback(() => {
    if (nextCursor) void dispatch(fetchWorkerReviews({ workerId, cursor: nextCursor }))
  }, [dispatch, workerId, nextCursor])

  return {
    items: list?.items ?? [],
    error: list?.error ?? null,
    loading: !list || list.status === 'loading',
    hasMore: nextCursor !== null,
    loadMore,
    reload,
  }
}
