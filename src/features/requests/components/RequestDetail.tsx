import { ArrowLeftIcon, CalendarClockIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { PropertyMap } from '@/components/common/map/PropertyMap'
import { PageHeader } from '@/components/common/PageHeader'
import { PhotoGallery } from '@/components/common/PhotoGallery'
import { PriorityBadge } from '@/components/common/PriorityBadge'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Timeline, type TimelineItem } from '@/components/common/Timeline'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PATHS } from '@/constants/paths'
import { REQUEST_STATUS } from '@/constants/status'
import { RequestActions } from '@/features/requests/components/RequestActions'
import { useRequestDetail } from '@/features/requests/hooks/useRequests'
import type { RepairRequest, TimelineEntry } from '@/features/requests/types/request.types'
import { formatDateTime } from '@/utils/format'

const RELATION_LABELS: Record<string, string> = {
  OWNER: 'Owner',
  TENANT: 'Tenant',
  PAYER: 'Payer',
  RAISER: 'Raised by you',
  WORKER: 'Worker',
  ADMIN: 'Admin',
}

function humanize(action: string) {
  const text = action.replace(/_/g, ' ')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function toTimelineItems(entries: TimelineEntry[]): TimelineItem[] {
  return entries.map((e) => ({
    id: e.id,
    title: humanize(e.action),
    description: e.fromStatus
      ? `${REQUEST_STATUS[e.fromStatus].label} → ${REQUEST_STATUS[e.toStatus].label}`
      : REQUEST_STATUS[e.toStatus].label,
    timestamp: e.createdAt,
    meta: e.actor?.name ?? 'System',
  }))
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  )
}

interface RequestDetailProps {
  id: string
  /** Slot for quotes / job panels composed by the page. */
  renderExtra?: (request: RepairRequest, refresh: () => void) => ReactNode
}

export function RequestDetail({ id, renderExtra }: RequestDetailProps) {
  const { request, status, error, timeline, refresh } = useRequestDetail(id)

  if (!request) {
    if (status === 'failed') {
      return (
        <EmptyState
          title="Request not found"
          description={error?.message}
          action={
            <Link to={PATHS.CUSTOMER_REQUESTS} className={buttonVariants({ variant: 'outline' })}>
              Back to requests
            </Link>
          }
        />
      )
    }
    return <Loader />
  }

  const photos = request.media
    .filter((m) => m.mimeType.startsWith('image/'))
    .map((m) => ({ id: m.id, url: m.url, label: m.kind === 'AFTER' ? 'After' : 'Before' }))

  return (
    <div className="flex flex-col gap-6">
      <Link
        to={PATHS.CUSTOMER_REQUESTS}
        className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'self-start' })}
      >
        <ArrowLeftIcon />
        Requests
      </Link>
      <PageHeader
        title={request.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={request.status} />
            <PriorityBadge priority={request.priority} />
            <span>
              {request.category.name} · {request.property.label}
            </span>
          </span>
        }
        actions={<RequestActions request={request} onChanged={refresh} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm whitespace-pre-line">{request.description}</p>
              {request.cancelReason && (
                <p className="rounded-lg bg-muted px-3 py-2 text-sm">
                  <span className="font-medium">Reason: </span>
                  {request.cancelReason}
                </p>
              )}
              <Separator />
              <dl className="grid gap-4 sm:grid-cols-2">
                <DetailRow label="Preferred slots">
                  {request.preferredSlots.length === 0 ? (
                    'Any time'
                  ) : (
                    <ul className="flex flex-col gap-1">
                      {request.preferredSlots.map((s) => (
                        <li key={s.start} className="flex items-center gap-1.5">
                          <CalendarClockIcon className="size-3.5 text-muted-foreground" />
                          {formatDateTime(s.start)} – {formatDateTime(s.end)}
                        </li>
                      ))}
                    </ul>
                  )}
                </DetailRow>
                <DetailRow label="Quotes close">{formatDateTime(request.quoteDeadline)}</DetailRow>
                <DetailRow label="Raised">{formatDateTime(request.createdAt)}</DetailRow>
                <DetailRow label="Search radius">{request.searchRadiusKm} km</DetailRow>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoGallery photos={photos} emptyText="No photos were added." />
            </CardContent>
          </Card>

          {renderExtra?.(request, refresh)}
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>People</CardTitle>
              {request.myRelations.length > 0 && (
                <CardDescription>
                  You: {request.myRelations.map((r) => RELATION_LABELS[r] ?? r).join(', ')}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <dl className="flex flex-col gap-3">
                <DetailRow label="Raised by">{request.raisedBy.name}</DetailRow>
                <DetailRow label="Pays">{request.payer.name}</DetailRow>
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Property</CardTitle>
              <CardDescription>
                {request.property.addressLine1}
                {request.property.addressLine2 && `, ${request.property.addressLine2}`},{' '}
                {request.property.city} {request.property.pincode}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PropertyMap
                location={{ lat: request.property.lat, lng: request.property.lng }}
                label={request.property.label}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {timeline ? <Timeline items={toTimelineItems(timeline)} /> : <Loader />}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
