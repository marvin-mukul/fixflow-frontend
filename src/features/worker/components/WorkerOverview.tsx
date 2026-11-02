import { BadgeCheckIcon, RadarIcon, ReceiptIndianRupeeIcon } from 'lucide-react'
import { Link } from 'react-router'
import { StatCard } from '@/components/common/StatCard'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PATHS } from '@/constants/paths'
import { AvailabilityToggle } from '@/features/worker/components/AvailabilityToggle'
import { VerificationBadge } from '@/features/worker/components/VerificationBadge'
import { useLeads, useWorkerProfile } from '@/features/worker/hooks/useWorker'

/** Worker dashboard header: verification, availability and lead counts. */
export function WorkerOverview() {
  const { profile } = useWorkerProfile()
  const open = useLeads('open')
  const quotedOpen = open.items.filter((l) => l.myQuote?.status === 'SUBMITTED').length
  const notQuoted = open.items.filter((l) => !l.myQuote && l.canQuote).length

  if (!profile) return null
  return (
    <div className="flex flex-col gap-6">
      {profile.verificationStatus !== 'VERIFIED' && (
        <Alert>
          <BadgeCheckIcon />
          <AlertTitle>
            <VerificationBadge status={profile.verificationStatus} />
          </AlertTitle>
          <AlertDescription>
            {profile.hasIdDocument
              ? 'An admin is reviewing your ID document.'
              : 'Upload your ID document from your profile so an admin can verify you.'}
          </AlertDescription>
        </Alert>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Open leads to quote"
          icon={<RadarIcon />}
          value={notQuoted}
          loading={open.loading}
          to={PATHS.WORKER_LEADS}
        />
        <StatCard
          label="Quotes awaiting decision"
          icon={<ReceiptIndianRupeeIcon />}
          value={quotedOpen}
          loading={open.loading}
          to={PATHS.WORKER_QUOTES}
        />
        <Card size="sm">
          <CardHeader>
            <CardDescription>Availability</CardDescription>
          </CardHeader>
          <CardContent>
            <AvailabilityToggle profile={profile} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Service area</CardTitle>
          <CardDescription>
            {profile.serviceRadiusKm} km around your base · {profile.categories.map((c) => c.name).join(', ') || 'no categories yet'}
          </CardDescription>
          <CardAction>
            <Link to={PATHS.WORKER_PROFILE} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Edit profile
            </Link>
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  )
}
