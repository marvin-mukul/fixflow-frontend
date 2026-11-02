import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { notificationsApi } from '@/features/notifications/api/notifications.api'
import type { AppNotification } from '@/features/notifications/types/notification.types'
import { toApiError } from '@/lib/apiError'
import { createApiThunk } from '@/lib/createApiThunk'
import type { ApiError, AsyncStatus } from '@/types/api'

const adapter = createEntityAdapter<AppNotification>({
  sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt),
})

export interface NotificationsState extends ReturnType<typeof adapter.getInitialState> {
  unreadCount: number
  nextCursor: string | null
  status: AsyncStatus
  error: ApiError | null
}

const initialState: NotificationsState = adapter.getInitialState({
  unreadCount: 0,
  nextCursor: null,
  status: 'idle',
  error: null,
})

export const fetchNotifications = createApiThunk(
  'notifications/fetch',
  async (cursor: string | null | undefined) => ({
    page: await notificationsApi.list(cursor),
    append: !!cursor,
  }),
)
export const fetchUnreadCount = createApiThunk('notifications/unreadCount', () =>
  notificationsApi.unreadCount(),
)
export const markNotificationRead = createApiThunk('notifications/markRead', async (id: string) => {
  await notificationsApi.markRead(id)
  return id
})
export const markAllNotificationsRead = createApiThunk('notifications/markAllRead', () =>
  notificationsApi.markAllRead(),
)

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const { page, append } = action.payload
        if (append) adapter.upsertMany(state, page.items)
        else adapter.setAll(state, page.items)
        state.nextCursor = page.nextCursor
        state.status = 'succeeded'
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? toApiError(action.error)
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload
      })
      .addCase(markNotificationRead.pending, (state, action) => {
        const item = state.entities[action.meta.arg]
        if (item && !item.readAt) {
          item.readAt = new Date().toISOString()
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        const now = new Date().toISOString()
        for (const item of Object.values(state.entities)) {
          if (item && !item.readAt) item.readAt = now
        }
        state.unreadCount = 0
      })
  },
})

export const notificationsReducer = notificationsSlice.reducer

type WithNotifications = { notifications: NotificationsState }
const selectors = adapter.getSelectors((state: WithNotifications) => state.notifications)
export const selectNotifications = selectors.selectAll
export const selectUnreadCount = (state: WithNotifications) => state.notifications.unreadCount
export const selectNotificationsStatus = (state: WithNotifications) => state.notifications.status
export const selectNotificationsHasMore = (state: WithNotifications) =>
  state.notifications.nextCursor !== null
export const selectNotificationsCursor = (state: WithNotifications) => state.notifications.nextCursor
