import { LayoutDashboardIcon } from 'lucide-react'
import { PATHS } from '@/constants/paths'
import { RoleShell } from '@/layouts/RoleShell'

const NAV = [{ title: 'Dashboard', to: PATHS.WORKER_HOME, icon: <LayoutDashboardIcon /> }]

export default function WorkerLayout() {
  return <RoleShell roleLabel="Worker" homePath={PATHS.WORKER_HOME} navItems={NAV} />
}
