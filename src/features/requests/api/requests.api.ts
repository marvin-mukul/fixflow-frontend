import { api } from '@/lib/axios'
import type {
  CreateRequestPayload,
  RepairRequest,
  RequestQuery,
  TimelineEntry,
} from '@/features/requests/types/request.types'
import type { CursorPage } from '@/types/api'

export const requestsApi = {
  async list(query: RequestQuery, cursor?: string | null, limit = 20) {
    const { data } = await api.get<CursorPage<RepairRequest>>('/requests', {
      params: { ...query, cursor: cursor ?? undefined, limit },
      // `status=A&status=B` (no brackets) so the API parses an array.
      paramsSerializer: { indexes: null },
    })
    return data
  },
  async get(id: string) {
    const { data } = await api.get<RepairRequest>(`/requests/${id}`)
    return data
  },
  async create(payload: CreateRequestPayload) {
    const { data } = await api.post<RepairRequest>('/requests', payload)
    return data
  },
  async uploadMedia(id: string, files: File[]) {
    const form = new FormData()
    for (const file of files) form.append('files', file)
    const { data } = await api.post<RepairRequest>(`/requests/${id}/media`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
  async approve(id: string, tenantPays: boolean) {
    const { data } = await api.post<RepairRequest>(`/requests/${id}/approve`, { tenantPays })
    return data
  },
  async reject(id: string, reason: string) {
    const { data } = await api.post<RepairRequest>(`/requests/${id}/reject`, { reason })
    return data
  },
  async cancel(id: string, reason: string) {
    const { data } = await api.post<RepairRequest>(`/requests/${id}/cancel`, { reason })
    return data
  },
  async reopen(id: string) {
    const { data } = await api.post<RepairRequest>(`/requests/${id}/reopen`)
    return data
  },
  async timeline(id: string) {
    const { data } = await api.get<{ items: TimelineEntry[] }>(`/requests/${id}/timeline`)
    return data.items
  },
}
