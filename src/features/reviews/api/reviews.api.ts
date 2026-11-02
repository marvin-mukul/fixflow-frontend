import type {
  PublicReview,
  PublicWorker,
  Review,
  ReviewPayload,
} from '@/features/reviews/types/review.types'
import { api } from '@/lib/axios'
import type { CursorPage } from '@/types/api'

export const reviewsApi = {
  async create(jobId: string, payload: ReviewPayload) {
    const { data } = await api.post<Review>(`/jobs/${jobId}/reviews`, payload)
    return data
  },
  async update(id: string, payload: Partial<ReviewPayload>) {
    const { data } = await api.patch<Review>(`/reviews/${id}`, payload)
    return data
  },
  async worker(id: string) {
    const { data } = await api.get<PublicWorker>(`/workers/${id}`)
    return data
  },
  async workerReviews(id: string, cursor?: string | null, limit = 10) {
    const { data } = await api.get<CursorPage<PublicReview>>(`/workers/${id}/reviews`, {
      params: { cursor: cursor ?? undefined, limit },
    })
    return data
  },
}
