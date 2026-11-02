import type { Priority, RequestStatus } from '@/constants/status'

export type RequestScope = 'all' | 'raised' | 'approvals'

/** Actions the API may list in `availableActions`. */
export type RequestAction =
  | 'approve'
  | 'reject'
  | 'cancel'
  | 'reopen'
  | 'accept_quote'
  | 'start'
  | 'complete'
  | 'confirm'
  | 'dispute'

export interface RequestMedia {
  id: string
  kind: 'BEFORE' | 'AFTER' | 'DOCUMENT'
  mimeType: string
  sizeBytes: number
  url: string
  createdAt: string
}

export interface TimeSlot {
  start: string
  end: string
}

export interface RepairRequest {
  id: string
  title: string
  description: string
  priority: Priority
  status: RequestStatus
  property: {
    id: string
    label: string
    addressLine1: string
    addressLine2: string | null
    city: string
    state: string
    pincode: string
    lat: number
    lng: number
  }
  category: { id: string; slug: string; name: string; icon: string }
  raisedBy: { id: string; name: string }
  payer: { id: string; name: string }
  preferredSlots: TimeSlot[]
  quoteDeadline: string | null
  approvedAt: string | null
  searchRadiusKm: number
  reopenedCount: number
  cancelReason: string | null
  media: RequestMedia[]
  jobId: string | null
  myRelations: string[]
  availableActions: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateRequestPayload {
  propertyId: string
  categoryId: string
  title: string
  description: string
  priority: Priority
  preferredSlots?: TimeSlot[]
  payerUserId?: string
}

export interface RequestQuery {
  scope?: RequestScope
  status?: RequestStatus[]
  propertyId?: string
}

export interface TimelineEntry {
  id: string
  action: string
  fromStatus: RequestStatus | null
  toStatus: RequestStatus
  actor: { id: string; name: string } | null
  payload?: unknown
  createdAt: string
}
