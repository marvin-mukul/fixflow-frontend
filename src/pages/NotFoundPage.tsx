import { SearchXIcon } from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/common/EmptyState'
import { buttonVariants } from '@/components/ui/button'
import { PATHS } from '@/constants/paths'

export default function NotFoundPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background">
      <EmptyState
        icon={<SearchXIcon />}
        eyebrow="404"
        title="Page not found"
        description="Sorry, the page you are looking for doesn't exist or has been moved."
        action={
          <Link to={PATHS.HOME} className={buttonVariants()}>
            Go home
          </Link>
        }
      />
    </main>
  )
}
