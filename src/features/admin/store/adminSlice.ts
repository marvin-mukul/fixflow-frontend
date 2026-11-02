import { createSlice } from '@reduxjs/toolkit'
import type { WorkerVerificationStatus } from '@/constants/status'
import { adminApi } from '@/features/admin/api/admin.api'
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
  ResolveDisputePayload,
  UpdateCategoryPayload,
  WorkerAction,
} from '@/features/admin/types/admin.types'
import { toApiError } from '@/lib/apiError'
import { createApiThunk } from '@/lib/createApiThunk'
import { invalidateCategories } from '@/services/categories.api'
import type { ApiError, AsyncStatus } from '@/types/api'

/** A filtered list: `filter` is the filter the items were (or are being) loaded for. */
interface ListState<T, F> {
  filter: F | null
  items: T[]
  status: AsyncStatus
  error: ApiError | null
}

interface ValueState<T> {
  value: T | null
  status: AsyncStatus
  error: ApiError | null
}

export interface AdminState {
  workers: ListState<AdminWorker, WorkerVerificationStatus>
  disputes: ListState<AdminDispute, DisputeStatus>
  /** `'ALL'` = no status filter. */
  payments: ListState<AdminPayment, PaymentStatus | 'ALL'>
  categories: ListState<AdminCategory, 'ALL'>
  admins: ListState<AdminUser, 'ALL'>
  stats: ValueState<AdminStats>
  settings: ValueState<PlatformSettings>
}

const emptyList = { filter: null, items: [], status: 'idle', error: null } as const
const emptyValue = { value: null, status: 'idle', error: null } as const

const initialState: AdminState = {
  workers: { ...emptyList, items: [] },
  disputes: { ...emptyList, items: [] },
  payments: { ...emptyList, items: [] },
  categories: { ...emptyList, items: [] },
  admins: { ...emptyList, items: [] },
  stats: { ...emptyValue },
  settings: { ...emptyValue },
}

export const fetchAdminWorkers = createApiThunk('admin/fetchWorkers', (status: WorkerVerificationStatus) =>
  adminApi.workers(status),
)
export const actOnWorker = createApiThunk(
  'admin/actOnWorker',
  ({ id, action, reason }: { id: string; action: WorkerAction; reason?: string }) =>
    adminApi.workerAction(id, action, reason),
)
export const fetchDisputes = createApiThunk('admin/fetchDisputes', (status: DisputeStatus) =>
  adminApi.disputes(status),
)
export const resolveDispute = createApiThunk(
  'admin/resolveDispute',
  ({ id, payload }: { id: string; payload: ResolveDisputePayload }) => adminApi.resolveDispute(id, payload),
)
export const fetchPayments = createApiThunk('admin/fetchPayments', (status: PaymentStatus | 'ALL') =>
  adminApi.payments(status === 'ALL' ? null : status),
)
export const refundPayment = createApiThunk(
  'admin/refundPayment',
  ({ id, payload }: { id: string; payload: RefundPayload }) => adminApi.refund(id, payload),
)
export const fetchAdminCategories = createApiThunk('admin/fetchCategories', () => adminApi.categories())
export const createCategory = createApiThunk('admin/createCategory', async (payload: CreateCategoryPayload) => {
  const created = await adminApi.createCategory(payload)
  invalidateCategories()
  return created
})
export const updateCategory = createApiThunk(
  'admin/updateCategory',
  async ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) => {
    const updated = await adminApi.updateCategory(id, payload)
    invalidateCategories()
    return updated
  },
)
export const fetchAdminStats = createApiThunk('admin/fetchStats', () => adminApi.stats())
export const fetchSettings = createApiThunk('admin/fetchSettings', () => adminApi.settings())
export const saveSettings = createApiThunk('admin/saveSettings', (payload: Partial<PlatformSettings>) =>
  adminApi.updateSettings(payload),
)
export const fetchAdmins = createApiThunk('admin/fetchAdmins', () => adminApi.admins())
export const createAdmin = createApiThunk('admin/createAdmin', (payload: CreateAdminPayload) =>
  adminApi.createAdmin(payload),
)
export const removeAdmin = createApiThunk('admin/removeAdmin', (id: string) => adminApi.removeAdmin(id))

function listPending<T, F>(target: ListState<T, F>, filter: F) {
  if (target.filter !== filter) target.items = []
  target.filter = filter
  target.status = 'loading'
  target.error = null
}

/** Ignores responses for a filter that is no longer selected. */
function listFulfilled<T, F>(target: ListState<T, F>, filter: F, items: T[]) {
  if (target.filter !== filter) return
  target.items = items
  target.status = 'succeeded'
}

function listRejected<T, F>(target: ListState<T, F>, filter: F, error: ApiError) {
  if (target.filter !== filter) return
  target.status = 'failed'
  target.error = error
}

function valuePending<T>(target: ValueState<T>) {
  target.status = 'loading'
  target.error = null
}

function valueFulfilled<T>(target: ValueState<T>, value: T) {
  target.value = value
  target.status = 'succeeded'
  target.error = null
}

function valueRejected<T>(target: ValueState<T>, error: ApiError) {
  target.status = 'failed'
  target.error = error
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminWorkers.pending, (s, a) => listPending(s.workers, a.meta.arg))
      .addCase(fetchAdminWorkers.fulfilled, (s, a) => listFulfilled(s.workers, a.meta.arg, a.payload))
      .addCase(fetchAdminWorkers.rejected, (s, a) =>
        listRejected(s.workers, a.meta.arg, a.payload ?? toApiError(a.error)),
      )
      .addCase(fetchDisputes.pending, (s, a) => listPending(s.disputes, a.meta.arg))
      .addCase(fetchDisputes.fulfilled, (s, a) => listFulfilled(s.disputes, a.meta.arg, a.payload))
      .addCase(fetchDisputes.rejected, (s, a) =>
        listRejected(s.disputes, a.meta.arg, a.payload ?? toApiError(a.error)),
      )
      .addCase(fetchPayments.pending, (s, a) => listPending(s.payments, a.meta.arg))
      .addCase(fetchPayments.fulfilled, (s, a) => listFulfilled(s.payments, a.meta.arg, a.payload))
      .addCase(fetchPayments.rejected, (s, a) =>
        listRejected(s.payments, a.meta.arg, a.payload ?? toApiError(a.error)),
      )
      .addCase(fetchAdminCategories.pending, (s) => listPending(s.categories, 'ALL'))
      .addCase(fetchAdminCategories.fulfilled, (s, a) => listFulfilled(s.categories, 'ALL', a.payload))
      .addCase(fetchAdminCategories.rejected, (s, a) =>
        listRejected(s.categories, 'ALL', a.payload ?? toApiError(a.error)),
      )
      .addCase(fetchAdmins.pending, (s) => listPending(s.admins, 'ALL'))
      .addCase(fetchAdmins.fulfilled, (s, a) => listFulfilled(s.admins, 'ALL', a.payload))
      .addCase(fetchAdmins.rejected, (s, a) => listRejected(s.admins, 'ALL', a.payload ?? toApiError(a.error)))
      .addCase(fetchAdminStats.pending, (s) => valuePending(s.stats))
      .addCase(fetchAdminStats.fulfilled, (s, a) => valueFulfilled(s.stats, a.payload))
      .addCase(fetchAdminStats.rejected, (s, a) => valueRejected(s.stats, a.payload ?? toApiError(a.error)))
      .addCase(fetchSettings.pending, (s) => valuePending(s.settings))
      .addCase(fetchSettings.fulfilled, (s, a) => valueFulfilled(s.settings, a.payload))
      .addCase(fetchSettings.rejected, (s, a) => valueRejected(s.settings, a.payload ?? toApiError(a.error)))
      .addCase(saveSettings.fulfilled, (s, a) => valueFulfilled(s.settings, a.payload))

    builder
      .addCase(actOnWorker.fulfilled, (state, action) => {
        const { workers } = state
        const worker = action.payload
        workers.items =
          worker.verificationStatus === workers.filter
            ? workers.items.map((w) => (w.id === worker.id ? worker : w))
            : workers.items.filter((w) => w.id !== worker.id)
      })
      .addCase(resolveDispute.fulfilled, (state, action) => {
        const { disputes } = state
        const dispute = action.payload
        disputes.items =
          dispute.status === disputes.filter
            ? disputes.items.map((d) => (d.id === dispute.id ? dispute : d))
            : disputes.items.filter((d) => d.id !== dispute.id)
      })
      .addCase(refundPayment.fulfilled, (state, action) => {
        const { payments } = state
        const result = action.payload
        payments.items = payments.items
          .map((p) =>
            p.id === result.paymentId ? { ...p, status: result.status, refundedPaise: result.refundedPaise } : p,
          )
          .filter((p) => payments.filter === 'ALL' || p.status === payments.filter)
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.items.push(action.payload)
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.categories.items = state.categories.items.map((c) =>
          c.id === action.payload.id ? action.payload : c,
        )
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.admins.items.push(action.payload)
      })
      .addCase(removeAdmin.fulfilled, (state, action) => {
        state.admins.items = state.admins.items.filter((a) => a.id !== action.payload)
      })
  },
})

export const adminReducer = adminSlice.reducer

type WithAdmin = { admin: AdminState }
export const selectAdminWorkers = (state: WithAdmin) => state.admin.workers
export const selectDisputes = (state: WithAdmin) => state.admin.disputes
export const selectPayments = (state: WithAdmin) => state.admin.payments
export const selectAdminCategories = (state: WithAdmin) => state.admin.categories
export const selectAdmins = (state: WithAdmin) => state.admin.admins
export const selectAdminStats = (state: WithAdmin) => state.admin.stats
export const selectSettings = (state: WithAdmin) => state.admin.settings
