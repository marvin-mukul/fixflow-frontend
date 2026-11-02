import type { QuoteStatus } from '@/constants/status'

export interface RatingBreakdown {
  count: number
  bayesian: number
  overall: number | null
  quality: number | null
  punctuality: number | null
  behaviour: number | null
  value: number | null
}

export interface Quote {
  id: string
  requestId: string
  status: QuoteStatus
  version: number
  labourPaise: number
  materialsPaise: number
  totalPaise: number
  notes: string | null
  etaHours: number
  proposedSlot: string | null
  validUntil: string
  createdAt: string
  worker: { id: string; name: string; jobsCompleted: number; rating: RatingBreakdown }
  distanceKm: number | null
  rankScore: number | null
}

/** The worker's own quote as embedded in a lead (`Lead.myQuote`). */
export interface OwnQuote {
  id: string
  status: QuoteStatus
  version: number
  labourPaise: number
  materialsPaise: number
  totalPaise: number
  etaHours: number
  proposedSlot: string | null
  validUntil: string
  notes: string | null
}

export interface QuotePayload {
  labourPaise: number
  materialsPaise: number
  etaHours: number
  notes?: string | null
  proposedSlot?: string | null
  validUntil?: string
}

export interface MyQuoteItem {
  id: string
  status: QuoteStatus
  version: number
  totalPaise: number
  labourPaise: number
  materialsPaise: number
  etaHours: number
  validUntil: string
  createdAt: string
  request: { id: string; title: string; status: string; priority: string }
}

export interface AcceptQuoteResult {
  request: { id: string; status: string }
  job: { id: string; subStatus: string; workerProfileId: string; scheduledStart: string | null }
}
