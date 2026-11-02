import { useCallback, useEffect, useMemo } from 'react'
import {
  fetchJob,
  fetchWorkerJobs,
  makeSelectWorkerJobList,
  selectJobById,
  selectJobDetailError,
  selectJobDetailStatus,
} from '@/features/jobs/store/jobsSlice'
import type { JobFilter } from '@/features/jobs/types/job.types'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

export function useWorkerJobs(filter: JobFilter) {
  const dispatch = useAppDispatch()
  const select = useMemo(() => makeSelectWorkerJobList(filter), [filter])
  const list = useAppSelector(select)

  const reload = useCallback(() => {
    void dispatch(fetchWorkerJobs({ filter }))
  }, [dispatch, filter])

  useEffect(reload, [reload])

  const loadMore = useCallback(() => {
    if (list.nextCursor) void dispatch(fetchWorkerJobs({ filter, cursor: list.nextCursor }))
  }, [dispatch, filter, list.nextCursor])

  return {
    items: list.items,
    error: list.error,
    loading: list.status === 'loading' || list.status === 'idle',
    hasMore: list.nextCursor !== null,
    loadMore,
    reload,
  }
}

export function useJob(id: string) {
  const dispatch = useAppDispatch()
  const job = useAppSelector((state) => selectJobById(state, id))
  const status = useAppSelector((state) => selectJobDetailStatus(state, id))
  const error = useAppSelector((state) => selectJobDetailError(state, id))

  const refresh = useCallback(() => {
    void dispatch(fetchJob(id))
  }, [dispatch, id])

  useEffect(() => {
    if (id) refresh()
  }, [id, refresh])

  return { job, status, error, refresh }
}
