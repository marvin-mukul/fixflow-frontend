import type { Priority, RequestStatus } from '@/constants/status'

export const JOB_SUB_STATUSES = ['CONFIRMED', 'EN_ROUTE', 'ARRIVED', 'WORKING', 'DONE'] as const
export type JobSubStatus = (typeof JOB_SUB_STATUSES)[number]

/** Worker progress actions the API may list in `workerActions`. */
export type WorkerJobAction = 'en_route' | 'arrive' | 'start' | 'complete'

export type JobFilter = 'active' | 'all'

export interface Job {
  id: string
  requestId: string
  subStatus: JobSubStatus
  requestStatus: RequestStatus
  title: string
  category: { id: string; slug: string; name: string; icon: string }
  priority: Priority
  quote: {
    id: string
    labourPaise: number
    materialsPaise: number
    totalPaise: number
    etaHours: number
    notes: string | null
  }
  finalAmountPaise: number
  scheduledStart: string | null
  startedAt: string | null
  completedAt: string | null
  confirmedAt: string | null
  worker: { id: string; name: string; phone: string | null }
  property: {
    label: string
    addressLine1: string
    addressLine2: string | null
    city: string
    state: string
    pincode: string
    lat: number
    lng: number
  }
  contact: { name: string; phone: string | null }
  afterPhotos: { id: string; url: string; mimeType: string }[]
  invoice: { id: string; number: string; status: string; totalPaise: number } | null
  dispute: { id: string; status: string; reason: string; resolution: string | null } | null
  myReview: { id: string; overall: number; createdAt?: string } | null
  myRelations: string[]
  workerActions: WorkerJobAction[]
  customerActions: string[]
}

export interface CompleteJobPayload {
  files: File[]
  finalAmountPaise?: number
}
