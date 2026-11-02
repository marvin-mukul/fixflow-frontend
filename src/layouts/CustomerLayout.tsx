import { Building2Icon, LayoutDashboardIcon } from 'lucide-react'
import { PATHS } from '@/constants/paths'
import { RoleShell } from '@/layouts/RoleShell'

const NAV = [
  { title: 'Dashboard', to: PATHS.CUSTOMER_HOME, icon: <LayoutDashboardIcon />, exact: true },
  { title: 'Properties', to: PATHS.CUSTOMER_PROPERTIES, icon: <Building2Icon /> },
]

export default function CustomerLayout() {
  return <RoleShell roleLabel="Customer" homePath={PATHS.CUSTOMER_HOME} navItems={NAV} />
}
