import type { WorkerVerificationStatus } from '@/constants/status'

export interface AdminWorkerCategory {
  id: string
  slug: string
  name: string
  icon: string
  yearsExperience: number
}

/** `GET /admin/workers` item: the worker profile plus contact and document link. */
export interface AdminWorker {
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
  categories: AdminWorkerCategory[]
  verifiedAt: string | null
  email: string
  phone: string | null
  createdAt: string
  /** API path that needs the Bearer header (image or PDF). */
  idDocumentUrl: string | null
}

export type WorkerAction = 'verify' | 'reject' | 'suspend'

export const DISPUTE_STATUSES = ['OPEN', 'RESOLVED'] as const
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number]

export interface AdminDispute {
  id: string
  status: DisputeStatus
  reason: string
  resolution: string | null
  raisedBy: { id: string; name: string }
  jobId: string
  requestId: string
  requestTitle: string
  requestStatus: string
  workerName: string
  amountPaise: number | null
  createdAt: string
  resolvedAt: string | null
}

export type DisputeOutcome = 'COMPLETE' | 'CANCEL'

export interface ResolveDisputePayload {
  outcome: DisputeOutcome
  resolution: string
}

export const PAYMENT_STATUSES = ['CREATED', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export interface AdminPayment {
  id: string
  provider: string
  providerOrderId: string
  status: PaymentStatus
  amountPaise: number
  refundedPaise: number
  invoice: { id: string; number: string; totalPaise: number; status: string }
  createdAt: string
}

export interface RefundPayload {
  /** Omit for a full refund of the remaining amount. */
  amountPaise?: number
  reason: string
}

export interface RefundResult {
  paymentId: string
  status: PaymentStatus
  refundedPaise: number
  providerRefundId: string
  providerStatus: 'PENDING' | 'DONE'
}

export interface AdminCategory {
  id: string
  slug: string
  name: string
  icon: string
  isActive: boolean
}

export interface CreateCategoryPayload {
  slug: string
  name: string
  icon?: string
}

export interface UpdateCategoryPayload {
  name?: string
  icon?: string
  isActive?: boolean
}

export interface AdminStats {
  users: Record<string, number>
  workers: Record<string, number>
  requests: Record<string, number>
  jobs: { total: number; completed: number }
  money: { gmvPaise: number; commissionPaise: number; commissionGstPaise: number; paidInvoices: number }
  /** 0–1 ratios. */
  rates: { acceptance: number; completion: number; dispute: number }
}

export type QuoteWindowPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY'

export interface PlatformSettings {
  commissionPercent: number
  gstPercent: number
  tcsPercent: number
  gstOnCommission: boolean
  matchRadiusKm: number
  reopenRadiusKm: number
  fanoutLimit: number
  newcomerSlots: number
  quoteWindowHours: Record<QuoteWindowPriority, number>
  autoConfirmHours: number
  reviewWindowDays: number
  rankingWeights: { rating: number; distance: number; completion: number; response: number }
  bayesianC: number
  bayesianPriorMean: number
}

export type AdminRole = 'ADMIN' | 'SUPERADMIN'

export interface AdminUser {
  id: string
  name: string
  email: string
  globalRole: AdminRole
  mustChangePassword: boolean
  lastLoginAt: string | null
  createdAt: string
}

export interface CreateAdminPayload {
  name: string
  email: string
  password: string
}
