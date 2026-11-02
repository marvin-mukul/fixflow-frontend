import { z } from 'zod'

const optionalText = z.string().trim().max(200)

/** Mirrors the backend `PropertyBody` (lat/lng bounds cover India). */
export const propertySchema = z.object({
  label: z.string().trim().min(2, 'At least 2 characters').max(100),
  type: z.enum(['HOUSE', 'FLAT', 'OTHER']),
  addressLine1: z.string().trim().min(3, 'At least 3 characters').max(200),
  addressLine2: optionalText,
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  pincode: z.string().trim().regex(/^[1-9][0-9]{5}$/, 'Enter a 6-digit pincode'),
  lat: z
    .number({ error: 'Pick the location on the map or enter coordinates' })
    .min(6, 'Latitude must be within India (6–38)')
    .max(38, 'Latitude must be within India (6–38)'),
  lng: z
    .number({ error: 'Pick the location on the map or enter coordinates' })
    .min(68, 'Longitude must be within India (68–98)')
    .max(98, 'Longitude must be within India (68–98)'),
  isOwnerOccupied: z.boolean(),
  autoApproveEmergency: z.boolean(),
})
export type PropertyValues = z.infer<typeof propertySchema>

export const inviteSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').pipe(z.email('Enter a valid email')),
})
export type InviteValues = z.infer<typeof inviteSchema>
