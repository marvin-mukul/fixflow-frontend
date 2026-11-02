import { Building2Icon, ClipboardListIcon, InboxIcon, LayoutDashboardIcon } from 'lucide-react'
import { PATHS } from '@/constants/paths'
import { RoleShell } from '@/layouts/RoleShell'

const NAV = [
  { title: 'Dashboard', to: PATHS.CUSTOMER_HOME, icon: <LayoutDashboardIcon />, exact: true },
  { title: 'Properties', to: PATHS.CUSTOMER_PROPERTIES, icon: <Building2Icon /> },
  { title: 'Requests', to: PATHS.CUSTOMER_REQUESTS, icon: <ClipboardListIcon /> },
  { title: 'Approvals', to: PATHS.CUSTOMER_APPROVALS, icon: <InboxIcon /> },
]

export default function CustomerLayout() {
  return <RoleShell roleLabel="Customer" homePath={PATHS.CUSTOMER_HOME} navItems={NAV} />
}
