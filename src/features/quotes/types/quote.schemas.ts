import { z } from 'zod'

const rupees = z
  .string()
  .trim()
  .min(1, 'Enter an amount (0 if none)')
  .regex(/^\d+(\.\d{1,2})?$/, 'Use a number like 1500 or 1500.50')
  .refine((v) => Number(v) <= 1_000_000, 'At most ₹10,00,000')

export const quoteSchema = z
  .object({
    labour: rupees,
    materials: rupees,
    etaHours: z
      .string()
      .trim()
      .regex(/^\d+$/, 'Whole hours')
      .refine((v) => Number(v) >= 1 && Number(v) <= 720, 'Between 1 and 720 hours'),
    proposedSlot: z.string(),
    validUntil: z.string(),
    notes: z.string().trim().max(1000, 'At most 1000 characters'),
  })
  .refine((v) => Number(v.labour) + Number(v.materials) > 0, {
    path: ['labour'],
    message: 'The total must be more than ₹0',
  })
export type QuoteValues = z.infer<typeof quoteSchema>
