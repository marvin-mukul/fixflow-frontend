import {
  createEntityAdapter,
  createSelector,
  createSlice,
  isAnyOf,
  type PayloadAction,
} from '@reduxjs/toolkit'
import { requestsApi } from '@/features/requests/api/requests.api'
import type {
  CreateRequestPayload,
  RepairRequest,
  RequestQuery,
  TimelineEntry,
} from '@/features/requests/types/request.types'
import { toApiError } from '@/lib/apiError'
import { createApiThunk } from '@/lib/createApiThunk'
import type { ApiError, AsyncStatus } from '@/types/api'

const adapter = createEntityAdapter<RepairRequest>({
  sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt),
})

export interface RequestListState {
  query: RequestQuery
  ids: string[]
  nextCursor: string | null
  status: AsyncStatus
  error: ApiError | null
}

export interface RequestsState extends ReturnType<typeof adapter.getInitialState> {
  status: AsyncStatus
  error: ApiError | null
  /** Result lists keyed by `listKey(query)`. */
  lists: Record<string, RequestListState>
  detailStatus: Record<string, AsyncStatus>
  detailError: Record<string, ApiError | null>
  timelines: Record<string, TimelineEntry[]>
}

const initialState: RequestsState = adapter.getInitialState({
  status: 'idle',
  error: null,
  lists: {},
  detailStatus: {},
  detailError: {},
  timelines: {},
})

/** Stable key for a list query. */
export function listKey(query: RequestQuery): string {
  return JSON.stringify({
    scope: query.scope ?? 'all',
    status: [...(query.status ?? [])].sort(),
    propertyId: query.propertyId ?? null,
  })
}

/** Whether a request still belongs in a list after it changed. */
function matchesQuery(req: RepairRequest, query: RequestQuery): boolean {
  if (query.scope === 'approvals' && req.status !== 'PENDING_APPROVAL') return false
  if (query.status?.length && !query.status.includes(req.status)) return false
  if (query.propertyId && req.property.id !== query.propertyId) return false
  return true
}

export const fetchRequests = createApiThunk(
  'requests/fetchList',
  async ({ query, cursor }: { query: RequestQuery; cursor?: string | null }) => {
    const page = await requestsApi.list(query, cursor)
    return { key: listKey(query), query, page, append: !!cursor }
  },
)
export const fetchRequest = createApiThunk('requests/fetchOne', (id: string) => requestsApi.get(id))
export const fetchTimeline = createApiThunk('requests/fetchTimeline', async (id: string) => ({
  id,
  items: await requestsApi.timeline(id),
}))
export const createRequest = createApiThunk('requests/create', (payload: CreateRequestPayload) =>
  requestsApi.create(payload),
)
export const uploadRequestMedia = createApiThunk(
  'requests/uploadMedia',
  ({ id, files }: { id: string; files: File[] }) => requestsApi.uploadMedia(id, files),
)
export const approveRequest = createApiThunk(
  'requests/approve',
  ({ id, tenantPays }: { id: string; tenantPays: boolean }) => requestsApi.approve(id, tenantPays),
)
export const rejectRequest = createApiThunk(
  'requests/reject',
  ({ id, reason }: { id: string; reason: string }) => requestsApi.reject(id, reason),
)
export const cancelRequest = createApiThunk(
  'requests/cancel',
  ({ id, reason }: { id: string; reason: string }) => requestsApi.cancel(id, reason),
)
export const reopenRequest = createApiThunk('requests/reopen', (id: string) => requestsApi.reopen(id))

function upsertAndReconcile(state: RequestsState, action: PayloadAction<RepairRequest>) {
  const req = action.payload
  adapter.upsertOne(state, req)
  state.detailStatus[req.id] = 'succeeded'
  for (const list of Object.values(state.lists)) {
    const inList = list.ids.includes(req.id)
    if (inList && !matchesQuery(req, list.query)) {
      list.ids = list.ids.filter((id) => id !== req.id)
    }
  }
}

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    /** Merge a request returned by another feature's API call (e.g. accept quote). */
    requestReceived: upsertAndReconcile,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.pending, (state, action) => {
        const { query } = action.meta.arg
        const key = listKey(query)
        const existing = state.lists[key]
        state.lists[key] = {
          query,
          ids: existing?.ids ?? [],
          nextCursor: existing?.nextCursor ?? null,
          status: 'loading',
          error: null,
        }
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        const { key, query, page, append } = action.payload
        adapter.upsertMany(state, page.items)
        const ids = page.items.map((r) => r.id)
        const previous = append ? (state.lists[key]?.ids ?? []) : []
        state.lists[key] = {
          query,
          ids: [...previous, ...ids.filter((id) => !previous.includes(id))],
          nextCursor: page.nextCursor,
          status: 'succeeded',
          error: null,
        }
        state.status = 'succeeded'
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        const key = listKey(action.meta.arg.query)
        const error = action.payload ?? toApiError(action.error)
        const list = state.lists[key]
        if (list) {
          list.status = 'failed'
          list.error = error
        }
        state.status = 'failed'
        state.error = error
      })
      .addCase(fetchRequest.pending, (state, action) => {
        state.detailStatus[action.meta.arg] = 'loading'
        state.detailError[action.meta.arg] = null
      })
      .addCase(fetchRequest.rejected, (state, action) => {
        state.detailStatus[action.meta.arg] = 'failed'
        state.detailError[action.meta.arg] = action.payload ?? toApiError(action.error)
      })
      .addCase(fetchTimeline.fulfilled, (state, action) => {
        state.timelines[action.payload.id] = action.payload.items
      })
      .addMatcher(
        isAnyOf(
          fetchRequest.fulfilled,
          createRequest.fulfilled,
          uploadRequestMedia.fulfilled,
          approveRequest.fulfilled,
          rejectRequest.fulfilled,
          cancelRequest.fulfilled,
          reopenRequest.fulfilled,
        ),
        upsertAndReconcile,
      )
  },
})

export const { requestReceived } = requestsSlice.actions
export const requestsReducer = requestsSlice.reducer

type WithRequests = { requests: RequestsState }
const selectSlice = (state: WithRequests) => state.requests
const selectors = adapter.getSelectors(selectSlice)

export const selectRequestById = selectors.selectById
export const selectRequestEntities = selectors.selectEntities

const EMPTY_LIST: RequestListState = {
  query: {},
  ids: [],
  nextCursor: null,
  status: 'idle',
  error: null,
}

/** Memoised selector factory for one list (use with `useMemo`). */
export function makeSelectRequestList(key: string) {
  return createSelector(
    [(state: WithRequests) => state.requests.lists[key], selectRequestEntities],
    (list, entities) => {
      const current = list ?? EMPTY_LIST
      return {
        ...current,
        items: current.ids
          .map((id) => entities[id])
          .filter((r): r is RepairRequest => r !== undefined),
      }
    },
  )
}

export const selectRequestDetailStatus = (state: WithRequests, id: string) =>
  state.requests.detailStatus[id] ?? 'idle'
export const selectRequestDetailError = (state: WithRequests, id: string) =>
  state.requests.detailError[id] ?? null
export const selectTimeline = (state: WithRequests, id: string) => state.requests.timelines[id]
