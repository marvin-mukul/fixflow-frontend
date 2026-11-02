import { api } from '@/lib/axios'
import type {
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  User,
} from '@/features/auth/types/auth.types'

export const authApi = {
  async login(payload: LoginPayload) {
    const { data } = await api.post<AuthResponse>('/auth/login', payload)
    return data
  },
  async register(payload: RegisterPayload) {
    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    return data
  },
  async refresh() {
    const { data } = await api.post<AuthResponse>('/auth/refresh')
    return data
  },
  async logout() {
    await api.post('/auth/logout')
  },
  async me() {
    const { data } = await api.get<User>('/auth/me')
    return data
  },
  async changePassword(payload: ChangePasswordPayload) {
    const { data } = await api.post<AuthResponse>('/auth/change-password', payload)
    return data
  },
}
