import { api } from '@/lib/axios'
import type {
  InvitationAccepted,
  InvitationCreated,
  InvitationPreview,
  Property,
  PropertyDetail,
  PropertyPayload,
} from '@/features/properties/types/property.types'

export const propertiesApi = {
  async list() {
    const { data } = await api.get<{ items: Property[] }>('/properties')
    return data.items
  },
  async get(id: string) {
    const { data } = await api.get<PropertyDetail>(`/properties/${id}`)
    return data
  },
  async create(payload: PropertyPayload) {
    const { data } = await api.post<Property>('/properties', payload)
    return data
  },
  async update(id: string, payload: Partial<PropertyPayload>) {
    const { data } = await api.patch<Property>(`/properties/${id}`, payload)
    return data
  },
  async remove(id: string) {
    await api.delete(`/properties/${id}`, { skipForbiddenRedirect: true })
  },
  async invite(id: string, email: string) {
    const { data } = await api.post<InvitationCreated>(`/properties/${id}/invitations`, { email })
    return data
  },
  async endTenancy(id: string, tenancyId: string) {
    await api.post(`/properties/${id}/tenancies/${tenancyId}/end`)
  },
  async previewInvitation(token: string) {
    const { data } = await api.get<InvitationPreview>(`/invitations/${encodeURIComponent(token)}`)
    return data
  },
  async acceptInvitation(token: string) {
    const { data } = await api.post<InvitationAccepted>(
      `/invitations/${encodeURIComponent(token)}/accept`,
      undefined,
      { skipForbiddenRedirect: true },
    )
    return data
  },
}
