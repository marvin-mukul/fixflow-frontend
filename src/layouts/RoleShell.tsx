import { useNavigate } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import type { NavItem } from '@/components/layout/types'
import { PATHS } from '@/constants/paths'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface RoleShellProps {
  roleLabel: string
  homePath: string
  navItems: NavItem[]
}

/** Binds the generic `AppShell` to the signed-in user and logout. */
export function RoleShell({ roleLabel, homePath, navItems }: RoleShellProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const handleLogout = async () => {
    await logout()
    navigate(PATHS.LOGIN, { replace: true })
  }

  return (
    <AppShell
      roleLabel={roleLabel}
      homePath={homePath}
      navItems={navItems}
      user={user}
      onLogout={() => void handleLogout()}
    />
  )
}
