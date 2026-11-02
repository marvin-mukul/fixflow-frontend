import { useCallback, useEffect } from 'react'
import type { WorkerVerificationStatus } from '@/constants/status'
import {
  fetchAdminCategories,
  fetchAdminStats,
  fetchAdminWorkers,
  fetchAdmins,
  fetchDisputes,
  fetchPayments,
  fetchSettings,
  selectAdminCategories,
  selectAdminStats,
  selectAdminWorkers,
  selectAdmins,
  selectDisputes,
  selectPayments,
  selectSettings,
} from '@/features/admin/store/adminSlice'
import type { DisputeStatus, PaymentStatus } from '@/features/admin/types/admin.types'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

export function useAdminWorkers(status: WorkerVerificationStatus) {
  const dispatch = useAppDispatch()
  const list = useAppSelector(selectAdminWorkers)
  const reload = useCallback(() => void dispatch(fetchAdminWorkers(status)), [dispatch, status])
  useEffect(reload, [reload])
  return { ...list, loading: list.status === 'loading', reload }
}

export function useDisputes(status: DisputeStatus) {
  const dispatch = useAppDispatch()
  const list = useAppSelector(selectDisputes)
  const reload = useCallback(() => void dispatch(fetchDisputes(status)), [dispatch, status])
  useEffect(reload, [reload])
  return { ...list, loading: list.status === 'loading', reload }
}

export function usePayments(status: PaymentStatus | 'ALL') {
  const dispatch = useAppDispatch()
  const list = useAppSelector(selectPayments)
  const reload = useCallback(() => void dispatch(fetchPayments(status)), [dispatch, status])
  useEffect(reload, [reload])
  return { ...list, loading: list.status === 'loading', reload }
}

export function useAdminCategories() {
  const dispatch = useAppDispatch()
  const list = useAppSelector(selectAdminCategories)
  const reload = useCallback(() => void dispatch(fetchAdminCategories()), [dispatch])
  useEffect(reload, [reload])
  return { ...list, loading: list.status === 'loading', reload }
}

export function useAdmins() {
  const dispatch = useAppDispatch()
  const list = useAppSelector(selectAdmins)
  const reload = useCallback(() => void dispatch(fetchAdmins()), [dispatch])
  useEffect(reload, [reload])
  return { ...list, loading: list.status === 'loading', reload }
}

/** Stats are refetched every time the dashboard mounts. */
export function useAdminStats() {
  const dispatch = useAppDispatch()
  const stats = useAppSelector(selectAdminStats)
  useEffect(() => {
    void dispatch(fetchAdminStats())
  }, [dispatch])
  return { ...stats, loading: stats.status === 'loading', reload: () => void dispatch(fetchAdminStats()) }
}

export function useSettings() {
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectSettings)
  useEffect(() => {
    void dispatch(fetchSettings())
  }, [dispatch])
  return { ...settings, loading: settings.status === 'loading', reload: () => void dispatch(fetchSettings()) }
}
