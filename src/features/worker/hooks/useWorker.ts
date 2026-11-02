import { useCallback, useEffect, useMemo } from 'react'
import {
  fetchLead,
  fetchLeads,
  fetchWorkerProfile,
  makeSelectLeadList,
  PROFILE_MISSING,
  selectLeadById,
  selectLeadError,
  selectLeadStatus,
  selectWorkerProfile,
  selectWorkerProfileError,
  selectWorkerProfileStatus,
  type LeadFilter,
} from '@/features/worker/store/workerSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

/** Worker profile, loaded once. `missing` means onboarding has not been done. */
export function useWorkerProfile() {
  const dispatch = useAppDispatch()
  const profile = useAppSelector(selectWorkerProfile)
  const status = useAppSelector(selectWorkerProfileStatus)
  const error = useAppSelector(selectWorkerProfileError)

  useEffect(() => {
    if (status === 'idle') void dispatch(fetchWorkerProfile())
  }, [dispatch, status])

  const reload = useCallback(() => dispatch(fetchWorkerProfile()), [dispatch])
  return {
    profile,
    status,
    error,
    loading: !profile && (status === 'idle' || status === 'loading'),
    missing: !profile && status === 'failed' && error?.code === PROFILE_MISSING,
    reload,
  }
}

export function useLeads(filter: LeadFilter) {
  const dispatch = useAppDispatch()
  const select = useMemo(() => makeSelectLeadList(filter), [filter])
  const list = useAppSelector(select)

  useEffect(() => {
    void dispatch(fetchLeads({ filter }))
  }, [dispatch, filter])

  const loadMore = useCallback(() => {
    if (list.nextCursor) void dispatch(fetchLeads({ filter, cursor: list.nextCursor }))
  }, [dispatch, filter, list.nextCursor])

  return {
    items: list.items,
    error: list.error,
    loading: list.status === 'loading' || list.status === 'idle',
    hasMore: list.nextCursor !== null,
    loadMore,
  }
}

export function useLead(requestId: string) {
  const dispatch = useAppDispatch()
  const lead = useAppSelector((state) => selectLeadById(state, requestId))
  const status = useAppSelector((state) => selectLeadStatus(state, requestId))
  const error = useAppSelector((state) => selectLeadError(state, requestId))

  const refresh = useCallback(() => {
    void dispatch(fetchLead(requestId))
  }, [dispatch, requestId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { lead, status, error, refresh }
}
