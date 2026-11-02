import { useCallback, useEffect, useMemo } from 'react'
import {
  fetchRequest,
  fetchRequests,
  fetchTimeline,
  listKey,
  makeSelectRequestList,
  selectRequestById,
  selectRequestDetailError,
  selectRequestDetailStatus,
  selectTimeline,
} from '@/features/requests/store/requestsSlice'
import type { RequestQuery } from '@/features/requests/types/request.types'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

/** A cursor-paginated request list; refetched whenever the query changes. */
export function useRequestList(query: RequestQuery) {
  const dispatch = useAppDispatch()
  const key = listKey(query)
  const selectList = useMemo(() => makeSelectRequestList(key), [key])
  const list = useAppSelector(selectList)

  const reload = useCallback(() => {
    void dispatch(fetchRequests({ query: JSON.parse(key) as RequestQuery }))
  }, [dispatch, key])

  useEffect(reload, [reload])

  const loadMore = useCallback(() => {
    if (list.nextCursor) {
      void dispatch(fetchRequests({ query: list.query, cursor: list.nextCursor }))
    }
  }, [dispatch, list.nextCursor, list.query])

  return {
    items: list.items,
    status: list.status,
    error: list.error,
    loading: list.status === 'loading' || list.status === 'idle',
    hasMore: list.nextCursor !== null,
    loadMore,
    reload,
  }
}

export function useRequestDetail(id: string) {
  const dispatch = useAppDispatch()
  const request = useAppSelector((state) => selectRequestById(state, id))
  const status = useAppSelector((state) => selectRequestDetailStatus(state, id))
  const error = useAppSelector((state) => selectRequestDetailError(state, id))
  const timeline = useAppSelector((state) => selectTimeline(state, id))

  const refresh = useCallback(() => {
    void dispatch(fetchRequest(id))
    void dispatch(fetchTimeline(id))
  }, [dispatch, id])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { request, status, error, timeline, refresh }
}
