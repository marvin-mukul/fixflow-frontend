import { TriangleAlertIcon, SearchXIcon } from 'lucide-react'
import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { EmptyState } from '@/components/common/EmptyState'
import { Button, buttonVariants } from '@/components/ui/button'
import { PATHS } from '@/constants/paths'

/** Router `errorElement`: catches loader errors and render errors below the root route. */
export default function RouteErrorBoundary() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404

  if (import.meta.env.DEV && !notFound) console.error(error)

  return (
    <main className="flex min-h-svh items-center justify-center bg-background">
      {notFound ? (
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
      ) : (
        <EmptyState
          icon={<TriangleAlertIcon />}
          title="Something went wrong"
          description="An unexpected error occurred while showing this page."
          action={
            <>
              <Button onClick={() => window.location.reload()}>Reload page</Button>
              <Link to={PATHS.HOME} className={buttonVariants({ variant: 'outline' })}>
                Go home
              </Link>
            </>
          }
        />
      )}
    </main>
  )
}
