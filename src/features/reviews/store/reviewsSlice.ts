import { createSlice, isAnyOf } from '@reduxjs/toolkit'
import { reviewsApi } from '@/features/reviews/api/reviews.api'
import type {
  PublicReview,
  PublicWorker,
  Review,
  ReviewPayload,
} from '@/features/reviews/types/review.types'
import { toApiError } from '@/lib/apiError'
import { createApiThunk } from '@/lib/createApiThunk'
import type { ApiError, AsyncStatus } from '@/types/api'

interface WorkerReviewList {
  items: PublicReview[]
  nextCursor: string | null
  status: AsyncStatus
  error: ApiError | null
}

export interface ReviewsState {
  status: AsyncStatus
  error: ApiError | null
  /** Full reviews the user wrote in this session, by job id (carries `editable`). */
  mineByJob: Record<string, Review>
  workers: Record<string, PublicWorker>
  workerStatus: Record<string, AsyncStatus>
  workerError: Record<string, ApiError | null>
  workerReviews: Record<string, WorkerReviewList>
}

const initialState: ReviewsState = {
  status: 'idle',
  error: null,
  mineByJob: {},
  workers: {},
  workerStatus: {},
  workerError: {},
  workerReviews: {},
}

export const createReview = createApiThunk(
  'reviews/create',
  ({ jobId, payload }: { jobId: string; payload: ReviewPayload }) => reviewsApi.create(jobId, payload),
)
export const updateReview = createApiThunk(
  'reviews/update',
  ({ id, payload }: { id: string; payload: Partial<ReviewPayload> }) => reviewsApi.update(id, payload),
)
export const fetchPublicWorker = createApiThunk('reviews/fetchWorker', (id: string) => reviewsApi.worker(id))
export const fetchWorkerReviews = createApiThunk(
  'reviews/fetchWorkerReviews',
  async ({ workerId, cursor }: { workerId: string; cursor?: string | null }) => ({
    workerId,
    append: !!cursor,
    page: await reviewsApi.workerReviews(workerId, cursor),
  }),
)

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicWorker.pending, (state, action) => {
        state.workerStatus[action.meta.arg] = 'loading'
        state.workerError[action.meta.arg] = null
      })
      .addCase(fetchPublicWorker.fulfilled, (state, action) => {
        state.workers[action.meta.arg] = action.payload
        state.workerStatus[action.meta.arg] = 'succeeded'
      })
      .addCase(fetchPublicWorker.rejected, (state, action) => {
        state.workerStatus[action.meta.arg] = 'failed'
        state.workerError[action.meta.arg] = action.payload ?? toApiError(action.error)
      })
      .addCase(fetchWorkerReviews.pending, (state, action) => {
        const { workerId } = action.meta.arg
        const existing = state.workerReviews[workerId]
        state.workerReviews[workerId] = {
          items: existing?.items ?? [],
          nextCursor: existing?.nextCursor ?? null,
          status: 'loading',
          error: null,
        }
      })
      .addCase(fetchWorkerReviews.fulfilled, (state, action) => {
        const { workerId, append, page } = action.payload
        const previous = append ? (state.workerReviews[workerId]?.items ?? []) : []
        state.workerReviews[workerId] = {
          items: [...previous, ...page.items],
          nextCursor: page.nextCursor,
          status: 'succeeded',
          error: null,
        }
      })
      .addCase(fetchWorkerReviews.rejected, (state, action) => {
        const list = state.workerReviews[action.meta.arg.workerId]
        if (list) {
          list.status = 'failed'
          list.error = action.payload ?? toApiError(action.error)
        }
      })
      .addCase(createReview.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(createReview.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? toApiError(action.error)
      })
      .addMatcher(isAnyOf(createReview.fulfilled, updateReview.fulfilled), (state, action) => {
        state.mineByJob[action.payload.jobId] = action.payload
        state.status = 'succeeded'
      })
  },
})

export const reviewsReducer = reviewsSlice.reducer

type WithReviews = { reviews: ReviewsState }
export const selectMyReviewForJob = (state: WithReviews, jobId: string) => state.reviews.mineByJob[jobId]
export const selectPublicWorker = (state: WithReviews, id: string) => state.reviews.workers[id]
export const selectPublicWorkerStatus = (state: WithReviews, id: string) => state.reviews.workerStatus[id] ?? 'idle'
export const selectPublicWorkerError = (state: WithReviews, id: string) => state.reviews.workerError[id] ?? null
export const selectWorkerReviews = (state: WithReviews, id: string) => state.reviews.workerReviews[id]
