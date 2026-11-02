import { PATHS } from '@/constants/paths'
import type { GlobalRole } from '@/features/auth/types/auth.types'

/** Landing page for a signed-in user, by global role. */
export function homePathForRole(role: GlobalRole): string {
  switch (role) {
    case 'CUSTOMER':
      return PATHS.CUSTOMER_HOME
    case 'WORKER':
      return PATHS.WORKER_HOME
    case 'ADMIN':
    case 'SUPERADMIN':
      return PATHS.ADMIN_HOME
  }
}
