import { z } from 'zod'
import { PRIORITIES } from '@/constants/status'

const slotSchema = z
  .object({
    start: z.string().min(1, 'Pick a start time'),
    end: z.string().min(1, 'Pick an end time'),
  })
  .refine((s) => !s.start || !s.end || s.end > s.start, {
    path: ['end'],
    message: 'End must be after start',
  })

/** Mirrors the backend `CreateRequestBody` (slots are IST `datetime-local` values here). */
export const raiseRequestSchema = z.object({
  propertyId: z.string().min(1, 'Choose a property'),
  categoryId: z.string().min(1, 'Choose a category'),
  title: z.string().trim().min(5, 'At least 5 characters').max(120, 'At most 120 characters'),
  description: z.string().trim().min(10, 'At least 10 characters').max(2000, 'At most 2000 characters'),
  priority: z.enum(PRIORITIES),
  preferredSlots: z.array(slotSchema).max(3, 'At most 3 slots'),
})
export type RaiseRequestValues = z.infer<typeof raiseRequestSchema>
