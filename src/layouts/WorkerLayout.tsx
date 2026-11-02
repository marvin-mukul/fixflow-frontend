import { LayoutDashboardIcon, RadarIcon, ReceiptIndianRupeeIcon, UserRoundCogIcon } from 'lucide-react'
import { PATHS } from '@/constants/paths'
import { RoleShell } from '@/layouts/RoleShell'

const NAV = [
  { title: 'Dashboard', to: PATHS.WORKER_HOME, icon: <LayoutDashboardIcon />, exact: true },
  { title: 'Leads', to: PATHS.WORKER_LEADS, icon: <RadarIcon /> },
  { title: 'My quotes', to: PATHS.WORKER_QUOTES, icon: <ReceiptIndianRupeeIcon /> },
  { title: 'Profile', to: PATHS.WORKER_PROFILE, icon: <UserRoundCogIcon /> },
]

export default function WorkerLayout() {
  return <RoleShell roleLabel="Worker" homePath={PATHS.WORKER_HOME} navItems={NAV} />
}
