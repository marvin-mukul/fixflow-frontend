import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { Loader } from '@/components/common/Loader'
import { AppSidebar } from '@/components/layout/AppSidebar'
import type { NavItem, ShellUser } from '@/components/layout/types'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

interface AppShellProps {
  roleLabel: string
  homePath: string
  navItems: NavItem[]
  user: ShellUser
  onLogout: () => void
}

/** Sidebar shell (from shadcn `sidebar-07`) shared by every role layout. */
export function AppShell(props: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar {...props} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
          <span className="text-sm font-medium text-muted-foreground">{props.roleLabel}</span>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
