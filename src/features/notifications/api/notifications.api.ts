import type { AppNotification } from '@/features/notifications/types/notification.types'
import { api } from '@/lib/axios'
import type { CursorPage } from '@/types/api'

export const notificationsApi = {
  async list(cursor?: string | null) {
    const { data } = await api.get<CursorPage<AppNotification>>('/notifications', {
      params: { cursor: cursor ?? undefined, limit: 20 },
    })
    return data
  },
  async unreadCount() {
    const { data } = await api.get<{ count: number }>('/notifications/unread-count')
    return data.count
  },
  async markRead(id: string) {
    await api.post(`/notifications/${id}/read`)
  },
  async markAllRead() {
    await api.post('/notifications/read-all')
  },
}
