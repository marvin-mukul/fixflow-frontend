import { useCallback } from 'react'
import {
  changePassword,
  login,
  logout,
  register,
  selectAuth,
} from '@/features/auth/store/authSlice'
import type {
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
} from '@/features/auth/types/auth.types'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

export function useAuth() {
  const dispatch = useAppDispatch()
  const { user, accessToken, status, error, initialized } = useAppSelector(selectAuth)

  return {
    user,
    accessToken,
    status,
    error,
    initialized,
    isAuthenticated: user !== null,
    isLoading: status === 'loading',
    login: useCallback((p: LoginPayload) => dispatch(login(p)).unwrap(), [dispatch]),
    register: useCallback((p: RegisterPayload) => dispatch(register(p)).unwrap(), [dispatch]),
    changePassword: useCallback(
      (p: ChangePasswordPayload) => dispatch(changePassword(p)).unwrap(),
      [dispatch],
    ),
    logout: useCallback(() => dispatch(logout()), [dispatch]),
  }
}
