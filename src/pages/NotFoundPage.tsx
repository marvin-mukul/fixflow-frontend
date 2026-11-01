import { Link } from 'react-router'
import { buttonVariants } from '@/components/ui/button'
import { PATHS } from '@/constants/paths'

function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="max-w-md text-muted-foreground">
        Sorry, the page you are looking for doesn't exist or has been moved.
      </p>
      <Link to={PATHS.HOME} className={buttonVariants()}>
        Go home
      </Link>
    </main>
  )
}

export default NotFoundPage
