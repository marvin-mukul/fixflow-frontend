import { ArrowLeftIcon, CalendarClockIcon, LockIcon, PhoneIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { JobMap } from '@/components/common/map/JobMap'
import { PageHeader } from '@/components/common/PageHeader'
import { PhotoGallery } from '@/components/common/PhotoGallery'
import { PriorityBadge } from '@/components/common/PriorityBadge'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PATHS } from '@/constants/paths'
import { useLead } from '@/features/worker/hooks/useWorker'
import type { Lead } from '@/features/worker/types/worker.types'
import { formatDateTime, formatKm } from '@/utils/format'

interface LeadDetailProps {
  requestId: string
  /** Quote panel composed by the page. */
  renderQuote?: (lead: Lead, refresh: () => void) => ReactNode
}

/** A lead as the worker sees it: masked locality until their quote is accepted. */
export function LeadDetail({ requestId, renderQuote }: LeadDetailProps) {
  const { lead, status, error, refresh } = useLead(requestId)

  if (!lead) {
    if (status === 'failed') {
      return (
        <EmptyState
          title="Lead not available"
          description={error?.message}
          action={
            <Link to={PATHS.WORKER_LEADS} className={buttonVariants({ variant: 'outline' })}>
              Back to leads
            </Link>
          }
        />
      )
    }
    return <Loader />
  }

  const photos = lead.media
    .filter((m) => m.mimeType.startsWith('image/'))
    .map((m) => ({ id: m.id, url: m.url }))

  return (
    <div className="flex flex-col gap-6">
      <Link to={PATHS.WORKER_LEADS} className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'self-start' })}>
        <ArrowLeftIcon />
        Leads
      </Link>
      <PageHeader
        title={lead.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={lead.status} />
            <PriorityBadge priority={lead.priority} />
            <span>{lead.category.name}</span>
          </span>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Job details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm">
              <p className="whitespace-pre-line">{lead.description}</p>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">Preferred slots</dt>
                  <dd>
                    {lead.preferredSlots.length === 0 ? (
                      'Any time'
                    ) : (
                      <ul className="flex flex-col gap-1">
                        {lead.preferredSlots.map((s) => (
                          <li key={s.start} className="flex items-center gap-1.5">
                            <CalendarClockIcon className="size-3.5 text-muted-foreground" />
                            {formatDateTime(s.start)} – {formatDateTime(s.end)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Quotes close</dt>
                  <dd>{formatDateTime(lead.quoteDeadline)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoGallery photos={photos} emptyText="The customer did not add photos." />
            </CardContent>
          </Card>
          {renderQuote?.(lead, refresh)}
        </div>
        <Card className="self-start">
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm">
            <div>
              <p className="font-medium">
                {lead.locality.city} {lead.locality.pincode}
              </p>
              <p className="text-muted-foreground">About {formatKm(lead.approxDistanceKm)} from your base</p>
            </div>
            {lead.unmasked && lead.address ? (
              <>
                <address className="not-italic" data-testid="lead-address">
                  {lead.address.addressLine1}
                  {lead.address.addressLine2 && <>, {lead.address.addressLine2}</>}
                  <br />
                  {lead.address.city}, {lead.address.state} {lead.address.pincode}
                </address>
                {lead.contact && (
                  <p className="flex items-center gap-2">
                    <PhoneIcon className="size-4 text-muted-foreground" />
                    {lead.contact.name}
                    {lead.contact.phone && (
                      <a href={`tel:${lead.contact.phone}`} className="text-primary underline-offset-4 hover:underline">
                        {lead.contact.phone}
                      </a>
                    )}
                  </p>
                )}
                <JobMap location={lead.location} label={lead.title} />
              </>
            ) : (
              <Alert>
                <LockIcon />
                <AlertTitle>Exact address hidden</AlertTitle>
                <AlertDescription>
                  The full address and contact details are shared once the customer accepts your quote.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
