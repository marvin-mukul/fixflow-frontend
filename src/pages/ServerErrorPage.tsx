import { ServerCrashIcon } from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/common/EmptyState'
import { buttonVariants } from '@/components/ui/button'
import { PATHS } from '@/constants/paths'

export default function ServerErrorPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background">
      <EmptyState
        icon={<ServerCrashIcon />}
        eyebrow="500"
        title="Something went wrong"
        description="The server ran into a problem. Please try again in a moment."
        action={
          <Link to={PATHS.HOME} className={buttonVariants()}>
            Go home
          </Link>
        }
      />
    </main>
  )
}
