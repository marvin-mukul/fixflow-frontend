import { ShieldXIcon } from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/common/EmptyState'
import { buttonVariants } from '@/components/ui/button'
import { PATHS } from '@/constants/paths'

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background">
      <EmptyState
        icon={<ShieldXIcon />}
        eyebrow="403"
        title="Access denied"
        description="You don't have permission to view this page."
        action={
          <>
            <Link to={PATHS.HOME} className={buttonVariants()}>
              Go home
            </Link>
            <Link to={PATHS.LOGIN} className={buttonVariants({ variant: 'outline' })}>
              Switch account
            </Link>
          </>
        }
      />
    </main>
  )
}
