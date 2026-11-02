import type {
  Lead,
  WorkerCategoriesPayload,
  WorkerProfile,
  WorkerProfilePayload,
} from '@/features/worker/types/worker.types'
import { api } from '@/lib/axios'
import type { CursorPage } from '@/types/api'

export const workerApi = {
  async getProfile() {
    const { data } = await api.get<WorkerProfile>('/worker/profile')
    return data
  },
  async saveProfile(payload: WorkerProfilePayload) {
    const { data } = await api.put<WorkerProfile>('/worker/profile', payload)
    return data
  },
  async saveCategories(payload: WorkerCategoriesPayload) {
    const { data } = await api.put<WorkerProfile>('/worker/categories', payload)
    return data
  },
  async setAvailability(isAvailable: boolean) {
    const { data } = await api.patch<WorkerProfile>('/worker/availability', { isAvailable })
    return data
  },
  async uploadIdDocument(file: File) {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post<WorkerProfile>('/worker/id-document', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
  async leads(open: boolean, cursor?: string | null) {
    const { data } = await api.get<CursorPage<Lead>>('/worker/leads', {
      params: { open: String(open), cursor: cursor ?? undefined, limit: 50 },
    })
    return data
  },
  async lead(requestId: string) {
    const { data } = await api.get<Lead>(`/worker/leads/${requestId}`)
    return data
  },
}
