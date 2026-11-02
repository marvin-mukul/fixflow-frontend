import type { ComponentProps } from 'react'
import { Link } from 'react-router'
import { BrandMark } from '@/components/layout/BrandMark'
import { NavMain } from '@/components/layout/NavMain'
import { NavUser } from '@/components/layout/NavUser'
import type { NavItem, ShellUser } from '@/components/layout/types'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'

interface AppSidebarProps extends ComponentProps<typeof Sidebar> {
  roleLabel: string
  homePath: string
  navItems: NavItem[]
  user: ShellUser
  onLogout: () => void
}

export function AppSidebar({
  roleLabel,
  homePath,
  navItems,
  user,
  onLogout,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to={homePath} />}>
              <BrandMark className="text-base" />
              <span className="ml-auto truncate text-xs text-muted-foreground">{roleLabel}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain label={roleLabel} items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} onLogout={onLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
