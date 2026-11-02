import type { Priority, QuoteStatus, RequestStatus, WorkerVerificationStatus } from '@/constants/status'

export interface WorkerCategory {
  id: string
  slug: string
  name: string
  icon: string
  yearsExperience: number
}

export interface WorkerProfile {
  id: string
  userId: string
  name: string
  bio: string
  baseLat: number
  baseLng: number
  serviceRadiusKm: number
  isAvailable: boolean
  verificationStatus: WorkerVerificationStatus
  hasIdDocument: boolean
  gstin: string | null
  state: string
  categories: WorkerCategory[]
  verifiedAt: string | null
}

export interface WorkerProfilePayload {
  bio?: string
  baseLat: number
  baseLng: number
  serviceRadiusKm?: number
  state: string
  gstin?: string | null
}

export interface WorkerCategoriesPayload {
  categories: { categoryId: string; yearsExperience: number }[]
}

export interface Lead {
  requestId: string
  title: string
  description: string
  priority: Priority
  status: RequestStatus
  category: { id: string; slug: string; name: string; icon: string }
  /** Masked locality; the exact address stays hidden until `unmasked`. */
  locality: { city: string; pincode: string }
  approxDistanceKm: number
  /** Rounded coordinates while masked. */
  location: { lat: number; lng: number }
  preferredSlots: { start: string; end: string }[]
  quoteDeadline: string | null
  media: { id: string; url: string; mimeType: string }[]
  myQuote: {
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
  } | null
  canQuote: boolean
  unmasked: boolean
  address: {
    addressLine1: string
    addressLine2: string | null
    city: string
    state: string
    pincode: string
  } | null
  contact: { name: string; phone: string | null } | null
  jobId: string | null
  matchedAt: string
}
