import { Navigate, Outlet, useLocation } from 'react-router'
import { PATHS } from '@/constants/paths'
import { selectCurrentUser } from '@/features/auth/store/authSlice'
import { useAppSelector } from '@/store/hooks'

/** Layout route: signed-in users only; forces the change-password page when required. */
export function RequireAuth() {
  const user = useAppSelector(selectCurrentUser)
  const location = useLocation()

  if (!user) {
    return <Navigate to={PATHS.LOGIN} replace state={{ from: location }} />
  }
  if (user.mustChangePassword && location.pathname !== PATHS.CHANGE_PASSWORD) {
    return <Navigate to={PATHS.CHANGE_PASSWORD} replace />
  }
  return <Outlet />
}
