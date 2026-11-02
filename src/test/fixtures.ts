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
