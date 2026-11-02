import {
  BadgeCheckIcon,
  ClipboardListIcon,
  CreditCardIcon,
  MapPinIcon,
  MessageSquareQuoteIcon,
  StarIcon,
} from 'lucide-react'
import { Link } from 'react-router'
import { BrandMark } from '@/components/layout/BrandMark'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PATHS } from '@/constants/paths'

const FEATURES = [
  {
    icon: ClipboardListIcon,
    title: 'Raise a request in minutes',
    description: 'Describe the problem, add photos and pick a category. Tenants can raise requests for owner approval.',
  },
  {
    icon: MapPinIcon,
    title: 'Workers nearby, not across town',
    description: 'Verified plumbers, electricians and carpenters within reach of your property see your request.',
  },
  {
    icon: MessageSquareQuoteIcon,
    title: 'Compare quotes side by side',
    description: 'Price, estimated time and ratings in one view. Accept the quote that fits.',
  },
  {
    icon: BadgeCheckIcon,
    title: 'Track the job to completion',
    description: 'From scheduled to in progress to done, with completion photos at every step.',
  },
  {
    icon: CreditCardIcon,
    title: 'Pay securely, with GST invoices',
    description: 'Clear invoices with commission and tax broken down. Pay online when the job is done.',
  },
  {
    icon: StarIcon,
    title: 'Reviews you can trust',
    description: 'Only customers who paid for a job can review it, so ratings reflect real work.',
  },
]

const STEPS = [
  { title: 'Request', description: 'Post what needs fixing at your property.' },
  { title: 'Quote', description: 'Nearby workers send quotes. You pick one.' },
  { title: 'Fix', description: 'Track the job live until it is completed.' },
  { title: 'Pay & review', description: 'Pay the invoice and rate the worker.' },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link to={PATHS.HOME}>
            <BrandMark />
          </Link>
          <nav className="flex items-center gap-2">
            <Link to={PATHS.LOGIN} className={buttonVariants({ variant: 'ghost' })}>
              Log in
            </Link>
            <Link to={PATHS.REGISTER} className={buttonVariants()}>
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center md:px-6 md:py-28">
          <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
            Home repairs, without the chasing
          </span>
          <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight md:text-6xl">
            Get it fixed by trusted workers near you
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Report a repair, get quotes from verified workers nearby, and track the job from
            request to payment, all in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to={PATHS.REGISTER} className={buttonVariants({ size: 'lg' })}>
              Raise a repair request
            </Link>
            <Link to={PATHS.REGISTER} className={buttonVariants({ size: 'lg', variant: 'outline' })}>
              Join as a worker
            </Link>
          </div>
        </section>

        <section className="border-y bg-muted/40">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-16 sm:grid-cols-2 md:px-6 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <Card key={title}>
                <CardHeader>
                  <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <h2 className="text-center font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            How it works
          </h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 md:px-6">
          <Card className="items-center gap-4 bg-primary px-6 py-12 text-center text-primary-foreground">
            <h2 className="font-heading text-2xl font-semibold md:text-3xl">
              Ready to get something fixed?
            </h2>
            <p className="max-w-lg text-primary-foreground/80">
              Create a free account in under a minute. Owners, tenants and workers welcome.
            </p>
            <Link to={PATHS.REGISTER} className={buttonVariants({ size: 'lg', variant: 'secondary' })}>
              Get started
            </Link>
          </Card>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground md:flex-row md:px-6">
          <BrandMark className="text-sm" />
          <Separator className="md:hidden" />
          <p>© {new Date().getFullYear()} FixFlow. Home repair marketplace.</p>
        </div>
      </footer>
    </div>
  )
}
