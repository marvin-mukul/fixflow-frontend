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
