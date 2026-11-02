export type RatingDimension = 'quality' | 'punctuality' | 'behaviour' | 'value'

export interface Review {
  id: string
  jobId: string
  revieweeType: 'WORKER' | 'CUSTOMER'
  overall: number
  quality: number | null
  punctuality: number | null
  behaviour: number | null
  value: number | null
  wouldRehire: boolean | null
  finalCostMatchedQuote: boolean | null
  comment: string | null
  editable: boolean
  createdAt: string
  editedAt: string | null
}

export interface ReviewPayload {
  overall: number
  quality?: number
  punctuality?: number
  behaviour?: number
  value?: number
  wouldRehire?: boolean
  finalCostMatchedQuote?: boolean
  comment?: string
}

/** The job's `myReview` summary (the API sends only a few fields). */
export interface MyReviewSummary {
  id: string
  overall: number
  createdAt?: string
}

export interface RatingBreakdown {
  count: number
  bayesian: number
  overall: number | null
  quality: number | null
  punctuality: number | null
  behaviour: number | null
  value: number | null
}

export interface PublicWorker {
  id: string
  name: string
  bio: string
  state: string
  verified: boolean
  categories: { id: string; slug: string; name: string; icon: string; yearsExperience: number }[]
  jobsCompleted: number
  rating: RatingBreakdown
  memberSince: string
}

export interface PublicReview {
  id: string
  reviewerName: string
  category: string
  overall: number
  quality: number | null
  punctuality: number | null
  behaviour: number | null
  value: number | null
  wouldRehire: boolean | null
  comment: string | null
  createdAt: string
}
