import { Navigate, Outlet } from 'react-router'
import { PATHS } from '@/constants/paths'
import { selectCurrentUser } from '@/features/auth/store/authSlice'
import type { GlobalRole } from '@/features/auth/types/auth.types'
import { useAppSelector } from '@/store/hooks'

interface RequireRoleProps {
  roles: readonly GlobalRole[]
}

/** Layout route nested under `RequireAuth`: wrong role → 403 page. */
export function RequireRole({ roles }: RequireRoleProps) {
  const user = useAppSelector(selectCurrentUser)
  if (!user) return <Navigate to={PATHS.LOGIN} replace />
  if (!roles.includes(user.globalRole)) return <Navigate to={PATHS.FORBIDDEN} replace />
  return <Outlet />
}
