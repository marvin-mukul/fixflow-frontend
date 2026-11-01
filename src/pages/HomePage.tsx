import { Link } from 'react-router'
import { buttonVariants } from '@/components/ui/button'
import { PATHS } from '@/constants/paths'

function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-foreground">
        Welcome to FixFlow
      </h1>
      <p className="max-w-md text-muted-foreground">
        Report a repair, get quotes from verified workers nearby, and track the
        job to completion.
      </p>
      <Link to={PATHS.HOME} className={buttonVariants()}>
        Get started
      </Link>
    </main>
  )
}

export default HomePage
