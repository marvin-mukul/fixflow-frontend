import { z } from 'zod'

/** Mirrors the backend `WorkerProfileBody`. */
export const workerProfileSchema = z.object({
  bio: z.string().trim().max(1000, 'At most 1000 characters'),
  baseLat: z
    .number({ error: 'Pick your base location or enter coordinates' })
    .min(6, 'Latitude must be within India (6–38)')
    .max(38, 'Latitude must be within India (6–38)'),
  baseLng: z
    .number({ error: 'Pick your base location or enter coordinates' })
    .min(68, 'Longitude must be within India (68–98)')
    .max(98, 'Longitude must be within India (68–98)'),
  serviceRadiusKm: z.number().int().min(1, 'At least 1 km').max(20, 'At most 20 km'),
  state: z.string().trim().min(2, 'State is required'),
  gstin: z
    .string()
    .trim()
    .toUpperCase()
    .refine(
      (v) => v === '' || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(v),
      'Enter a valid 15-character GSTIN',
    ),
})
export type WorkerProfileValues = z.infer<typeof workerProfileSchema>
