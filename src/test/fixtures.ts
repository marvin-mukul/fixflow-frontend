import { env } from '@/config/env'
import type { User } from '@/features/auth/types/auth.types'

export const apiUrl = (path: string) => `${env.API_URL}${path}`

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u_1',
    email: 'owner@demo.fixflow',
    name: 'Olivia Owner',
    phone: null,
    globalRole: 'CUSTOMER',
    mustChangePassword: false,
    hasWorkerProfile: false,
    ...overrides,
  }
}

export function errorBody(code: string, message: string, details: { path: string; message: string; code: string }[] = []) {
  return { error: { code, message, details, requestId: 'req_test' } }
}

export const IDS = {
  property: '11111111-1111-4111-8111-111111111111',
  category: '22222222-2222-4222-8222-222222222222',
  request: '33333333-3333-4333-8333-333333333333',
  request2: '44444444-4444-4444-8444-444444444444',
}

export function makeProperty(overrides: Record<string, unknown> = {}) {
  return {
    id: IDS.property,
    ownerId: 'u_1',
    label: 'Green Villa',
    type: 'HOUSE',
    addressLine1: '12 Rajpur Road',
    addressLine2: null,
    city: 'Dehradun',
    state: 'Uttarakhand',
    pincode: '248001',
    lat: 30.3165,
    lng: 78.0322,
    isOwnerOccupied: false,
    autoApproveEmergency: false,
    relation: 'OWNER',
    ownerName: 'Olivia Owner',
    createdAt: '2026-10-01T10:00:00.000Z',
    ...overrides,
  }
}

export function makeCategory(overrides: Record<string, unknown> = {}) {
  return { id: IDS.category, slug: 'plumbing', name: 'Plumbing', icon: 'droplet', isActive: true, ...overrides }
}

export function makeRequest(overrides: Record<string, unknown> = {}) {
  return {
    id: IDS.request,
    title: 'Kitchen sink leaking',
    description: 'Water drips under the sink since yesterday.',
    priority: 'HIGH',
    status: 'PENDING_APPROVAL',
    property: {
      id: IDS.property,
      label: 'Green Villa',
      addressLine1: '12 Rajpur Road',
      addressLine2: null,
      city: 'Dehradun',
      state: 'Uttarakhand',
      pincode: '248001',
      lat: 30.3165,
      lng: 78.0322,
    },
    category: { id: IDS.category, slug: 'plumbing', name: 'Plumbing', icon: 'droplet' },
    raisedBy: { id: 'u_2', name: 'Tara Tenant' },
    payer: { id: 'u_1', name: 'Olivia Owner' },
    preferredSlots: [],
    quoteDeadline: null,
    approvedAt: null,
    searchRadiusKm: 10,
    reopenedCount: 0,
    cancelReason: null,
    media: [],
    jobId: null,
    myRelations: ['OWNER', 'PAYER'],
    availableActions: ['approve', 'reject', 'cancel'],
    createdAt: '2026-11-01T09:00:00.000Z',
    updatedAt: '2026-11-01T09:00:00.000Z',
    ...overrides,
  }
}

export function makeQuote(overrides: Record<string, unknown> = {}) {
  return {
    id: 'q_1',
    requestId: IDS.request,
    status: 'SUBMITTED',
    version: 1,
    labourPaise: 150000,
    materialsPaise: 50000,
    totalPaise: 200000,
    notes: null,
    etaHours: 4,
    proposedSlot: null,
    validUntil: '2026-11-05T12:00:00.000Z',
    createdAt: '2026-11-01T10:00:00.000Z',
    worker: {
      id: 'w_1',
      name: 'Worker One',
      jobsCompleted: 10,
      rating: { count: 5, bayesian: 4.2, overall: 4.5, quality: 4.6, punctuality: 4.4, behaviour: 4.8, value: 4.1 },
    },
    distanceKm: 3.2,
    rankScore: 0.5,
    ...overrides,
  }
}

export function makeWorkerProfile(overrides: Record<string, unknown> = {}) {
  return {
    id: 'wp_1',
    userId: 'u_w',
    name: 'Ravi Worker',
    bio: '',
    baseLat: 30.3,
    baseLng: 78.0,
    serviceRadiusKm: 10,
    isAvailable: true,
    verificationStatus: 'VERIFIED',
    hasIdDocument: true,
    gstin: null,
    state: 'Uttarakhand',
    categories: [{ id: IDS.category, slug: 'plumbing', name: 'Plumbing', icon: 'droplet', yearsExperience: 5 }],
    verifiedAt: '2026-10-01T10:00:00.000Z',
    ...overrides,
  }
}

export function makeLead(overrides: Record<string, unknown> = {}) {
  return {
    requestId: IDS.request,
    title: 'Kitchen sink leaking',
    description: 'Water drips under the sink since yesterday.',
    priority: 'HIGH',
    status: 'OPEN_FOR_QUOTES',
    category: { id: IDS.category, slug: 'plumbing', name: 'Plumbing', icon: 'droplet' },
    locality: { city: 'Dehradun', pincode: '248001' },
    approxDistanceKm: 2.4,
    location: { lat: 30.32, lng: 78.03 },
    preferredSlots: [],
    quoteDeadline: '2026-11-03T12:00:00.000Z',
    media: [],
    myQuote: null,
    canQuote: true,
    unmasked: false,
    address: null,
    contact: null,
    jobId: null,
    matchedAt: '2026-11-01T09:05:00.000Z',
    ...overrides,
  }
}

export const JOB_ID = '55555555-5555-4555-8555-555555555555'
export const INVOICE_ID = '66666666-6666-4666-8666-666666666666'

export function makeJob(overrides: Record<string, unknown> = {}) {
  return {
    id: JOB_ID,
    requestId: IDS.request,
    subStatus: 'CONFIRMED',
    requestStatus: 'SCHEDULED',
    title: 'Kitchen sink leaking',
    category: { id: IDS.category, slug: 'plumbing', name: 'Plumbing', icon: 'droplet' },
    priority: 'HIGH',
    quote: { id: 'q_1', labourPaise: 150000, materialsPaise: 50000, totalPaise: 200000, etaHours: 4, notes: null },
    finalAmountPaise: 200000,
    scheduledStart: '2026-11-03T05:30:00.000Z',
    startedAt: null,
    completedAt: null,
    confirmedAt: null,
    worker: { id: 'wp_1', name: 'Ravi Worker', phone: '+919811111111' },
    property: {
      label: 'Green Villa',
      addressLine1: '12 Rajpur Road',
      addressLine2: null,
      city: 'Dehradun',
      state: 'Uttarakhand',
      pincode: '248001',
      lat: 30.3165,
      lng: 78.0322,
    },
    contact: { name: 'Tara Tenant', phone: '+919800000000' },
    afterPhotos: [],
    invoice: null,
    dispute: null,
    myReview: null,
    myRelations: ['WORKER'],
    workerActions: ['en_route'],
    customerActions: [],
    ...overrides,
  }
}

export function makeInvoice(overrides: Record<string, unknown> = {}) {
  return {
    id: INVOICE_ID,
    number: 'FF-2026-000001',
    jobId: JOB_ID,
    requestId: IDS.request,
    requestTitle: 'Kitchen sink leaking',
    workerName: 'Ravi Worker',
    payerUserId: 'u_1',
    status: 'ISSUED',
    servicePaise: 200000,
    cgstPaise: 18000,
    sgstPaise: 18000,
    igstPaise: 0,
    totalPaise: 236000,
    gstMode: 'PLATFORM_9_5',
    issuedAt: '2026-11-02T10:00:00.000Z',
    paidAt: null,
    offlineMarkedAt: null,
    payments: [],
    breakdown: null,
    ...overrides,
  }
}

export function makeAdminWorker(overrides: Record<string, unknown> = {}) {
  return {
    ...makeWorkerProfile({ verificationStatus: 'PENDING', verifiedAt: null }),
    email: 'ravi@demo.fixflow',
    phone: '+919811111111',
    createdAt: '2026-10-30T10:00:00.000Z',
    idDocumentUrl: null,
    ...overrides,
  }
}

export function makeSettings(overrides: Record<string, unknown> = {}) {
  return {
    commissionPercent: 10,
    gstPercent: 18,
    tcsPercent: 0.5,
    gstOnCommission: true,
    matchRadiusKm: 10,
    reopenRadiusKm: 20,
    fanoutLimit: 20,
    newcomerSlots: 2,
    quoteWindowHours: { LOW: 24, MEDIUM: 24, HIGH: 6, EMERGENCY: 1 },
    autoConfirmHours: 72,
    reviewWindowDays: 7,
    rankingWeights: { rating: 0.4, distance: 0.3, completion: 0.2, response: 0.1 },
    bayesianC: 10,
    bayesianPriorMean: 4,
    ...overrides,
  }
}

export function makePayment(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pay_1',
    provider: 'mock',
    providerOrderId: 'order_1',
    status: 'PAID',
    amountPaise: 236000,
    refundedPaise: 0,
    invoice: { id: INVOICE_ID, number: 'FF/2026-27/000001', totalPaise: 236000, status: 'PAID' },
    createdAt: '2026-11-02T10:00:00.000Z',
    ...overrides,
  }
}
