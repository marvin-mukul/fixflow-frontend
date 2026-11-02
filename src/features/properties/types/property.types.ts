export type PropertyType = 'HOUSE' | 'FLAT' | 'OTHER'
export type PropertyRelation = 'OWNER' | 'TENANT'
export type TenancyStatus = 'INVITED' | 'ACTIVE' | 'ENDED'

export interface Property {
  id: string
  ownerId: string | null
  label: string
  type: PropertyType
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string
  pincode: string
  lat: number
  lng: number
  isOwnerOccupied: boolean
  autoApproveEmergency: boolean
  relation: PropertyRelation
  ownerName: string | null
  createdAt: string
}

export interface PropertyTenant {
  tenancyId: string
  userId: string
  name: string
  email: string
  status: TenancyStatus
  startDate: string
  endDate: string | null
}

export interface PendingInvitation {
  id: string
  email: string
  expiresAt: string
}

export interface PropertyDetail extends Property {
  tenants: PropertyTenant[]
  pendingInvitations: PendingInvitation[]
}

export interface PropertyPayload {
  label: string
  type: PropertyType
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  pincode: string
  lat: number
  lng: number
  isOwnerOccupied?: boolean
  autoApproveEmergency?: boolean
}

export interface InvitationCreated {
  id: string
  email: string
  expiresAt: string
}

export interface InvitationPreview {
  type: 'TENANT' | 'OWNER'
  email: string
  propertyLabel: string
  city: string
  inviterName: string
  expiresAt: string
  needsRegistration: boolean
}

export interface InvitationAccepted {
  propertyId: string
  tenancyId: string
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  HOUSE: 'House',
  FLAT: 'Flat / apartment',
  OTHER: 'Other',
}
