import { z } from 'zod'

/** Mirrors the backend `CreateCategoryBody`. */
export const categorySchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{2,40}$/, '2–40 lowercase letters, digits or dashes'),
  name: z.string().trim().min(2, 'At least 2 characters').max(60, 'At most 60 characters'),
  icon: z.string().trim().min(1, 'Icon is required').max(40, 'At most 40 characters'),
})
export type CategoryValues = z.infer<typeof categorySchema>

export const createAdminSchema = z.object({
  name: z.string().trim().min(2, 'At least 2 characters'),
  email: z.string().trim().min(1, 'Email is required').pipe(z.email('Enter a valid email')),
  password: z.string().min(8, 'At least 8 characters'),
})
export type CreateAdminValues = z.infer<typeof createAdminSchema>

const num = (min: number, max?: number) => {
  let schema = z.number({ error: 'Enter a number' }).min(min, `At least ${min}`)
  if (max !== undefined) schema = schema.max(max, `At most ${max}`)
  return schema
}
const int = (min: number, max: number) => num(min, max).int('Whole numbers only')
const weight = () => num(0, 1)
const positive = () => z.number({ error: 'Enter a number' }).positive('Must be greater than 0')

/** Mirrors the backend platform settings bounds (§6). */
export const settingsSchema = z.object({
  commissionPercent: num(0, 50),
  gstPercent: num(0, 40),
  tcsPercent: num(0, 5),
  gstOnCommission: z.boolean(),
  matchRadiusKm: int(1, 50),
  reopenRadiusKm: int(1, 100),
  fanoutLimit: int(1, 100),
  newcomerSlots: int(0, 10),
  quoteWindowHours: z.object({
    LOW: positive(),
    MEDIUM: positive(),
    HIGH: positive(),
    EMERGENCY: positive(),
  }),
  autoConfirmHours: positive(),
  reviewWindowDays: positive(),
  rankingWeights: z.object({
    rating: weight(),
    distance: weight(),
    completion: weight(),
    response: weight(),
  }),
  bayesianC: positive(),
  bayesianPriorMean: num(1, 5),
})
export type SettingsValues = z.infer<typeof settingsSchema>
