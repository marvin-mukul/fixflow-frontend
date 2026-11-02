import { Navigate, Outlet, useLocation, type Location } from 'react-router'
import { PATHS } from '@/constants/paths'
import { selectCurrentUser } from '@/features/auth/store/authSlice'
import { homePathForRole } from '@/features/auth/utils/roleHome'
import { useAppSelector } from '@/store/hooks'

/**
 * Layout route for login/register. Once a user exists (including right after a
 * successful login) it redirects to `from`, or the role home.
 */
export function GuestOnly() {
  const user = useAppSelector(selectCurrentUser)
  const location = useLocation()

  if (!user) return <Outlet />
  if (user.mustChangePassword) return <Navigate to={PATHS.CHANGE_PASSWORD} replace />

  const from = (location.state as { from?: Location } | null)?.from
  const to = from ? `${from.pathname}${from.search}${from.hash}` : homePathForRole(user.globalRole)
  return <Navigate to={to} replace />
}
