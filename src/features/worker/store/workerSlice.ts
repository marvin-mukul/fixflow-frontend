import { createEntityAdapter, createSelector, createSlice, isAnyOf } from '@reduxjs/toolkit'
import { workerApi } from '@/features/worker/api/worker.api'
import type {
  Lead,
  WorkerCategoriesPayload,
  WorkerProfile,
  WorkerProfilePayload,
} from '@/features/worker/types/worker.types'
import { toApiError } from '@/lib/apiError'
import { createApiThunk } from '@/lib/createApiThunk'
import type { ApiError, AsyncStatus } from '@/types/api'

const leadsAdapter = createEntityAdapter<Lead, string>({ selectId: (lead) => lead.requestId })

type LeadFilter = 'open' | 'all'

interface LeadListState {
  ids: string[]
  nextCursor: string | null
  status: AsyncStatus
  error: ApiError | null
}

export interface WorkerState extends ReturnType<typeof leadsAdapter.getInitialState> {
  profile: WorkerProfile | null
  /** Status of loading the profile (`failed` + WORKER_PROFILE_MISSING → onboarding). */
  status: AsyncStatus
  error: ApiError | null
  leadLists: Record<LeadFilter, LeadListState>
  leadStatus: Record<string, AsyncStatus>
  leadError: Record<string, ApiError | null>
}

const emptyList: LeadListState = { ids: [], nextCursor: null, status: 'idle', error: null }

const initialState: WorkerState = leadsAdapter.getInitialState({
  profile: null,
  status: 'idle',
  error: null,
  leadLists: { open: emptyList, all: emptyList },
  leadStatus: {},
  leadError: {},
})

export const PROFILE_MISSING = 'WORKER_PROFILE_MISSING'

export const fetchWorkerProfile = createApiThunk('worker/fetchProfile', () => workerApi.getProfile())
export const saveWorkerProfile = createApiThunk('worker/saveProfile', (payload: WorkerProfilePayload) =>
  workerApi.saveProfile(payload),
)
export const saveWorkerCategories = createApiThunk(
  'worker/saveCategories',
  (payload: WorkerCategoriesPayload) => workerApi.saveCategories(payload),
)
export const setWorkerAvailability = createApiThunk('worker/setAvailability', (isAvailable: boolean) =>
  workerApi.setAvailability(isAvailable),
)
export const uploadIdDocument = createApiThunk('worker/uploadIdDocument', (file: File) =>
  workerApi.uploadIdDocument(file),
)
export const fetchLeads = createApiThunk(
  'worker/fetchLeads',
  async ({ filter, cursor }: { filter: LeadFilter; cursor?: string | null }) => ({
    filter,
    append: !!cursor,
    page: await workerApi.leads(filter === 'open', cursor),
  }),
)
export const fetchLead = createApiThunk('worker/fetchLead', (requestId: string) => workerApi.lead(requestId))

const workerSlice = createSlice({
  name: 'worker',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkerProfile.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchWorkerProfile.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? toApiError(action.error)
      })
      .addCase(fetchLeads.pending, (state, action) => {
        const list = state.leadLists[action.meta.arg.filter]
        list.status = 'loading'
        list.error = null
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        const { filter, append, page } = action.payload
        leadsAdapter.upsertMany(state, page.items)
        const ids = page.items.map((l) => l.requestId)
        const list = state.leadLists[filter]
        list.ids = append ? [...list.ids, ...ids.filter((id) => !list.ids.includes(id))] : ids
        list.nextCursor = page.nextCursor
        list.status = 'succeeded'
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        const list = state.leadLists[action.meta.arg.filter]
        list.status = 'failed'
        list.error = action.payload ?? toApiError(action.error)
      })
      .addCase(fetchLead.pending, (state, action) => {
        state.leadStatus[action.meta.arg] = 'loading'
        state.leadError[action.meta.arg] = null
      })
      .addCase(fetchLead.fulfilled, (state, action) => {
        state.leadStatus[action.payload.requestId] = 'succeeded'
        leadsAdapter.upsertOne(state, action.payload)
      })
      .addCase(fetchLead.rejected, (state, action) => {
        state.leadStatus[action.meta.arg] = 'failed'
        state.leadError[action.meta.arg] = action.payload ?? toApiError(action.error)
      })
      .addMatcher(
        isAnyOf(
          fetchWorkerProfile.fulfilled,
          saveWorkerProfile.fulfilled,
          saveWorkerCategories.fulfilled,
          setWorkerAvailability.fulfilled,
          uploadIdDocument.fulfilled,
        ),
        (state, action) => {
          state.profile = action.payload
          state.status = 'succeeded'
          state.error = null
        },
      )
  },
})

export const workerReducer = workerSlice.reducer

type WithWorker = { worker: WorkerState }
const leadSelectors = leadsAdapter.getSelectors((state: WithWorker) => state.worker)

export const selectWorkerProfile = (state: WithWorker) => state.worker.profile
export const selectWorkerProfileStatus = (state: WithWorker) => state.worker.status
export const selectWorkerProfileError = (state: WithWorker) => state.worker.error
export const selectLeadById = leadSelectors.selectById
export const selectLeadStatus = (state: WithWorker, id: string) => state.worker.leadStatus[id] ?? 'idle'
export const selectLeadError = (state: WithWorker, id: string) => state.worker.leadError[id] ?? null

export function makeSelectLeadList(filter: LeadFilter) {
  return createSelector(
    [(state: WithWorker) => state.worker.leadLists[filter], leadSelectors.selectEntities],
    (list, entities) => ({
      ...list,
      items: list.ids.map((id) => entities[id]).filter((l): l is Lead => l !== undefined),
    }),
  )
}
export type { LeadFilter }
