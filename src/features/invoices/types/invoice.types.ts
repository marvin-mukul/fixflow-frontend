export type InvoiceStatus = 'ISSUED' | 'PAID' | 'PAID_OFFLINE' | 'REFUNDED' | 'PARTIALLY_REFUNDED'

/** `?status=` the payment return redirect appends to `/invoices/:id`. */
export type PaymentReturnStatus = 'PAID' | 'FAILED' | 'PENDING'

export interface InvoiceRates {
  commissionPercent?: number
  gstPercent?: number
  tcsPercent?: number
  gstOnCommission?: boolean
  intraState?: boolean
  workerState?: string
  propertyState?: string
}

export interface Invoice {
  id: string
  number: string
  jobId: string
  requestId: string
  requestTitle: string
  workerName: string
  payerUserId: string
  status: InvoiceStatus
  servicePaise: number
  cgstPaise: number
  sgstPaise: number
  igstPaise: number
  totalPaise: number
  gstMode: 'PLATFORM_9_5' | 'WORKER_REGISTERED'
  issuedAt: string
  paidAt: string | null
  offlineMarkedAt: string | null
  payments: {
    id: string
    provider: string
    status: string
    amountPaise: number
    refundedPaise: number
    createdAt: string
  }[]
  /** Worker/admin only; `null` for customers (payout is hidden from them). */
  breakdown: {
    commissionPaise: number
    commissionGstPaise: number
    tcsPaise: number
    workerPayoutPaise: number
    ratesSnapshot: InvoiceRates
  } | null
}

export type CheckoutInstruction = { kind: 'redirect'; url: string } | { kind: 'sdk'; sessionId: string }

export interface CheckoutResult {
  paymentId: string
  provider: 'mock' | 'cashfree'
  checkout: CheckoutInstruction
}

export interface MockOrder {
  providerOrderId: string
  status: string
  amountPaise: number
  invoiceId: string
  invoiceNumber: string
  title: string
}

export type MockOutcome = 'success' | 'failure'

export interface MockCompleteResult {
  status: string
  invoiceId: string
  returnUrl: string
}

export interface OfflinePaymentResult {
  id: string
  status: string
  offlineMarkedAt?: string | null
}

export interface EarningsItem {
  invoiceId: string
  number: string
  jobId: string
  requestTitle: string
  status: InvoiceStatus
  totalPaise: number
  commissionPaise: number
  tcsPaise: number
  workerPayoutPaise: number
  issuedAt: string
  paidAt: string | null
}

export interface Earnings {
  totals: { paidPaise: number; pendingPaise: number; jobs: number }
  items: EarningsItem[]
}

/** Who is looking at an invoice (decides which actions are offered). */
export interface InvoiceViewer {
  userId: string
  /** The assigned worker (may confirm an offline payment). */
  isWorker: boolean
}
