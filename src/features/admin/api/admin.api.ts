import type { WorkerVerificationStatus } from '@/constants/status'
import type {
  AdminCategory,
  AdminDispute,
  AdminPayment,
  AdminStats,
  AdminUser,
  AdminWorker,
  CreateAdminPayload,
  CreateCategoryPayload,
  DisputeStatus,
  PaymentStatus,
  PlatformSettings,
  RefundPayload,
  RefundResult,
  ResolveDisputePayload,
  UpdateCategoryPayload,
  WorkerAction,
} from '@/features/admin/types/admin.types'
import { api } from '@/lib/axios'

export const adminApi = {
  async workers(status: WorkerVerificationStatus) {
    const { data } = await api.get<{ items: AdminWorker[] }>('/admin/workers', { params: { status } })
    return data.items
  },
  async workerAction(id: string, action: WorkerAction, reason?: string) {
    const body = action === 'verify' ? undefined : { reason }
    const { data } = await api.post<AdminWorker>(`/admin/workers/${id}/${action}`, body)
    return data
  },
  async disputes(status: DisputeStatus) {
    const { data } = await api.get<{ items: AdminDispute[] }>('/admin/disputes', { params: { status } })
    return data.items
  },
  async resolveDispute(id: string, payload: ResolveDisputePayload) {
    const { data } = await api.post<AdminDispute>(`/admin/disputes/${id}/resolve`, payload)
    return data
  },
  async payments(status: PaymentStatus | null) {
    const { data } = await api.get<{ items: AdminPayment[] }>('/admin/payments', {
      params: { status: status ?? undefined },
    })
    return data.items
  },
  async refund(id: string, payload: RefundPayload) {
    const { data } = await api.post<RefundResult>(`/admin/payments/${id}/refund`, payload)
    return data
  },
  async categories() {
    const { data } = await api.get<{ items: AdminCategory[] }>('/admin/categories')
    return data.items
  },
  async createCategory(payload: CreateCategoryPayload) {
    const { data } = await api.post<AdminCategory>('/admin/categories', payload)
    return data
  },
  async updateCategory(id: string, payload: UpdateCategoryPayload) {
    const { data } = await api.patch<AdminCategory>(`/admin/categories/${id}`, payload)
    return data
  },
  async stats() {
    const { data } = await api.get<AdminStats>('/admin/stats')
    return data
  },
  async settings() {
    const { data } = await api.get<PlatformSettings>('/admin/settings')
    return data
  },
  async updateSettings(payload: Partial<PlatformSettings>) {
    const { data } = await api.put<PlatformSettings>('/admin/settings', payload)
    return data
  },
  async admins() {
    const { data } = await api.get<{ items: AdminUser[] }>('/admin/admins')
    return data.items
  },
  async createAdmin(payload: CreateAdminPayload) {
    const { data } = await api.post<AdminUser>('/admin/admins', payload)
    return data
  },
  async removeAdmin(id: string) {
    await api.delete(`/admin/admins/${id}`)
    return id
  },
}
