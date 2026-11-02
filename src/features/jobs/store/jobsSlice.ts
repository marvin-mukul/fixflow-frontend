import { createEntityAdapter, createSelector, createSlice, isAnyOf } from '@reduxjs/toolkit'
import { jobsApi } from '@/features/jobs/api/jobs.api'
import type {
  CompleteJobPayload,
  Job,
  JobFilter,
  WorkerJobAction,
} from '@/features/jobs/types/job.types'
import { toApiError } from '@/lib/apiError'
import { createApiThunk } from '@/lib/createApiThunk'
import type { ApiError, AsyncStatus } from '@/types/api'

const adapter = createEntityAdapter<Job>()

interface JobListState {
  ids: string[]
  nextCursor: string | null
  status: AsyncStatus
  error: ApiError | null
}

export interface JobsState extends ReturnType<typeof adapter.getInitialState> {
  status: AsyncStatus
  error: ApiError | null
  lists: Record<JobFilter, JobListState>
  detailStatus: Record<string, AsyncStatus>
  detailError: Record<string, ApiError | null>
}

const emptyList: JobListState = { ids: [], nextCursor: null, status: 'idle', error: null }

const initialState: JobsState = adapter.getInitialState({
  status: 'idle',
  error: null,
  lists: { active: emptyList, all: emptyList },
  detailStatus: {},
  detailError: {},
})

export const fetchWorkerJobs = createApiThunk(
  'jobs/fetchWorkerJobs',
  async ({ filter, cursor }: { filter: JobFilter; cursor?: string | null }) => ({
    filter,
    append: !!cursor,
    page: await jobsApi.workerJobs(filter === 'active', cursor),
  }),
)
export const fetchJob = createApiThunk('jobs/fetchOne', (id: string) => jobsApi.get(id))
export const progressJob = createApiThunk(
  'jobs/progress',
  ({ id, action }: { id: string; action: Exclude<WorkerJobAction, 'complete'> }) =>
    jobsApi.progress(id, action),
)
export const completeJob = createApiThunk(
  'jobs/complete',
  ({ id, payload }: { id: string; payload: CompleteJobPayload }) => jobsApi.complete(id, payload),
)
export const confirmJob = createApiThunk('jobs/confirm', (id: string) => jobsApi.confirm(id))
export const disputeJob = createApiThunk(
  'jobs/dispute',
  ({ id, reason }: { id: string; reason: string }) => jobsApi.dispute(id, reason),
)

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkerJobs.pending, (state, action) => {
        const list = state.lists[action.meta.arg.filter]
        list.status = 'loading'
        list.error = null
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchWorkerJobs.fulfilled, (state, action) => {
        const { filter, append, page } = action.payload
        adapter.upsertMany(state, page.items)
        const ids = page.items.map((j) => j.id)
        const previous = append ? state.lists[filter].ids : []
        state.lists[filter] = {
          ids: [...previous, ...ids.filter((id) => !previous.includes(id))],
          nextCursor: page.nextCursor,
          status: 'succeeded',
          error: null,
        }
        state.status = 'succeeded'
      })
      .addCase(fetchWorkerJobs.rejected, (state, action) => {
        const error = action.payload ?? toApiError(action.error)
        const list = state.lists[action.meta.arg.filter]
        list.status = 'failed'
        list.error = error
        state.status = 'failed'
        state.error = error
      })
      .addCase(fetchJob.pending, (state, action) => {
        state.detailStatus[action.meta.arg] = 'loading'
        state.detailError[action.meta.arg] = null
      })
      .addCase(fetchJob.rejected, (state, action) => {
        state.detailStatus[action.meta.arg] = 'failed'
        state.detailError[action.meta.arg] = action.payload ?? toApiError(action.error)
      })
      .addMatcher(
        isAnyOf(
          fetchJob.fulfilled,
          progressJob.fulfilled,
          completeJob.fulfilled,
          confirmJob.fulfilled,
          disputeJob.fulfilled,
        ),
        (state, action) => {
          adapter.upsertOne(state, action.payload)
          state.detailStatus[action.payload.id] = 'succeeded'
        },
      )
  },
})

export const jobsReducer = jobsSlice.reducer

type WithJobs = { jobs: JobsState }
const selectors = adapter.getSelectors((state: WithJobs) => state.jobs)

export const selectJobById = selectors.selectById
export const selectJobDetailStatus = (state: WithJobs, id: string) => state.jobs.detailStatus[id] ?? 'idle'
export const selectJobDetailError = (state: WithJobs, id: string) => state.jobs.detailError[id] ?? null

export function makeSelectWorkerJobList(filter: JobFilter) {
  return createSelector(
    [(state: WithJobs) => state.jobs.lists[filter], selectors.selectEntities],
    (list, entities) => ({
      ...list,
      items: list.ids.map((id) => entities[id]).filter((j): j is Job => j !== undefined),
    }),
  )
}
