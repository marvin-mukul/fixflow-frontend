import type { ReactNode } from 'react'

export interface NavItem {
  title: string
  to: string
  icon: ReactNode
}

export interface ShellUser {
  name: string
  email: string
}
