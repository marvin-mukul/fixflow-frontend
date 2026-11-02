import { z } from 'zod'

/** Mirrors the backend `PasswordSchema`. */
export const passwordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .max(72, 'At most 72 characters')
  .regex(/[a-z]/, 'Needs a lowercase letter')
  .regex(/[A-Z]/, 'Needs an uppercase letter')
  .regex(/[0-9]/, 'Needs a digit')

const emailSchema = z.string().trim().min(1, 'Email is required').pipe(z.email('Enter a valid email'))

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})
export type LoginValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  role: z.enum(['CUSTOMER', 'WORKER']),
  name: z.string().trim().min(2, 'At least 2 characters').max(100, 'At most 100 characters'),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .refine((v) => v === '' || /^\+?[0-9]{10,15}$/.test(v), 'Invalid phone number'),
  password: passwordSchema,
})
export type RegisterValues = z.infer<typeof registerSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ['newPassword'],
    message: 'Choose a password different from the current one',
  })
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>
