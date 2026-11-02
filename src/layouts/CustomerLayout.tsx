import { LayoutDashboardIcon } from 'lucide-react'
import { PATHS } from '@/constants/paths'
import { RoleShell } from '@/layouts/RoleShell'

const NAV = [{ title: 'Dashboard', to: PATHS.CUSTOMER_HOME, icon: <LayoutDashboardIcon /> }]

export default function CustomerLayout() {
  return <RoleShell roleLabel="Customer" homePath={PATHS.CUSTOMER_HOME} navItems={NAV} />
}
