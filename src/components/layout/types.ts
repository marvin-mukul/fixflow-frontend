import type { ReactNode } from 'react'

export interface NavItem {
  title: string
  to: string
  icon: ReactNode
  /** Only active on an exact match (for section home links). */
  exact?: boolean
}

export interface ShellUser {
  name: string
  email: string
}
