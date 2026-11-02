import { LayoutDashboardIcon } from 'lucide-react'
import { PATHS } from '@/constants/paths'
import { RoleShell } from '@/layouts/RoleShell'

const NAV = [{ title: 'Dashboard', to: PATHS.ADMIN_HOME, icon: <LayoutDashboardIcon /> }]

export default function AdminLayout() {
  return <RoleShell roleLabel="Admin" homePath={PATHS.ADMIN_HOME} navItems={NAV} />
}
