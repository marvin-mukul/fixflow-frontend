import {
  CreditCardIcon,
  LayoutDashboardIcon,
  ScaleIcon,
  SettingsIcon,
  ShieldIcon,
  TagsIcon,
  UserCheckIcon,
} from 'lucide-react'
import type { NavItem } from '@/components/layout/types'
import { PATHS } from '@/constants/paths'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { RoleShell } from '@/layouts/RoleShell'

const NAV: NavItem[] = [
  { title: 'Dashboard', to: PATHS.ADMIN_HOME, icon: <LayoutDashboardIcon />, exact: true },
  { title: 'Workers', to: PATHS.ADMIN_WORKERS, icon: <UserCheckIcon /> },
  { title: 'Disputes', to: PATHS.ADMIN_DISPUTES, icon: <ScaleIcon /> },
  { title: 'Payments', to: PATHS.ADMIN_PAYMENTS, icon: <CreditCardIcon /> },
  { title: 'Categories', to: PATHS.ADMIN_CATEGORIES, icon: <TagsIcon /> },
  { title: 'Settings', to: PATHS.ADMIN_SETTINGS, icon: <SettingsIcon /> },
]

const SUPERADMIN_NAV: NavItem[] = [...NAV, { title: 'Admins', to: PATHS.ADMIN_ADMINS, icon: <ShieldIcon /> }]

export default function AdminLayout() {
  const { user } = useAuth()
  const superadmin = user?.globalRole === 'SUPERADMIN'
  return (
    <RoleShell
      roleLabel={superadmin ? 'Superadmin' : 'Admin'}
      homePath={PATHS.ADMIN_HOME}
      navItems={superadmin ? SUPERADMIN_NAV : NAV}
    />
  )
}
