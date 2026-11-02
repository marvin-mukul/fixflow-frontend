export type GlobalRole = 'SUPERADMIN' | 'ADMIN' | 'CUSTOMER' | 'WORKER'
export type SelfRegisterRole = Extract<GlobalRole, 'CUSTOMER' | 'WORKER'>

export interface User {
  id: string
  email: string
  name: string
  phone: string | null
  globalRole: GlobalRole
  mustChangePassword: boolean
  hasWorkerProfile: boolean
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone?: string
  role: SelfRegisterRole
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}
