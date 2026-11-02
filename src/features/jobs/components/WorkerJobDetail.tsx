import { ArrowLeftIcon, PhoneIcon, ShieldAlertIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { JobMap } from '@/components/common/map/JobMap'
import { MoneyText } from '@/components/common/MoneyText'
import { PageHeader } from '@/components/common/PageHeader'
import { PhotoGallery } from '@/components/common/PhotoGallery'
import { PriorityBadge } from '@/components/common/PriorityBadge'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PATHS } from '@/constants/paths'
import { JobProgress } from '@/features/jobs/components/JobProgress'
import { WorkerJobActions } from '@/features/jobs/components/WorkerJobActions'
import { useJob } from '@/features/jobs/hooks/useJobs'
import type { Job } from '@/features/jobs/types/job.types'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/utils/format'

interface WorkerJobDetailProps {
  id: string
  /** Invoice / review panels composed by the page. */
  renderExtra?: (job: Job, refresh: () => void) => ReactNode
}

function Row({ label, children, divided }: { label: string; children: ReactNode; divided?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between gap-4 text-sm', divided && 'mt-1 border-t pt-3')}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  )
}

/** An assigned job as the worker sees it: next action, exact address, contact and map. */
export function WorkerJobDetail({ id, renderExtra }: WorkerJobDetailProps) {
  const { job, status, error, refresh } = useJob(id)

  if (!job) {
    if (status === 'failed') {
      return (
        <EmptyState
          title="Job not found"
          description={error?.message}
          action={
            <Link to={PATHS.WORKER_JOBS} className={buttonVariants({ variant: 'outline' })}>
              Back to jobs
            </Link>
          }
        />
      )
    }
    return <Loader />
  }

  const photos = job.afterPhotos
    .filter((p) => p.mimeType.startsWith('image/'))
    .map((p) => ({ id: p.id, url: p.url, label: 'After' }))

  return (
    <div className="flex flex-col gap-6">
      <Link to={PATHS.WORKER_JOBS} className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'self-start' })}>
        <ArrowLeftIcon />
        Jobs
      </Link>
      <PageHeader
        title={job.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={job.requestStatus} />
            <StatusBadge kind="job" status={job.subStatus} />
            <PriorityBadge priority={job.priority} />
            <span>{job.category.name}</span>
          </span>
        }
        actions={<WorkerJobActions job={job} />}
      />

      {job.dispute && (
        <Alert variant="destructive">
          <ShieldAlertIcon />
          <AlertTitle>Disputed by the customer</AlertTitle>
          <AlertDescription>
            {job.dispute.reason}
            {job.dispute.resolution && <> · Resolution: {job.dispute.resolution}</>}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <JobProgress job={job} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quote</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="flex flex-col gap-2">
                <Row label="Labour">
                  <MoneyText paise={job.quote.labourPaise} />
                </Row>
                <Row label="Materials">
                  <MoneyText paise={job.quote.materialsPaise} />
                </Row>
                <Row label="Quoted total">
                  <MoneyText paise={job.quote.totalPaise} className="font-medium" />
                </Row>
                {job.finalAmountPaise !== job.quote.totalPaise && (
                  <Row label="Final amount">
                    <MoneyText paise={job.finalAmountPaise} className="font-medium" />
                  </Row>
                )}
                <Row label="Scheduled" divided>{formatDateTime(job.scheduledStart)}</Row>
                <Row label="Estimated time">{job.quote.etaHours} h</Row>
              </dl>
              {job.quote.notes && <p className="mt-3 text-sm whitespace-pre-line text-muted-foreground">{job.quote.notes}</p>}
            </CardContent>
          </Card>
          {photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>After photos</CardTitle>
              </CardHeader>
              <CardContent>
                <PhotoGallery photos={photos} />
              </CardContent>
            </Card>
          )}
          {renderExtra?.(job, refresh)}
        </div>
        <Card className="self-start">
          <CardHeader>
            <CardTitle>Site</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm">
            <address className="not-italic" data-testid="job-address">
              <span className="font-medium">{job.property.label}</span>
              <br />
              {job.property.addressLine1}
              {job.property.addressLine2 && <>, {job.property.addressLine2}</>}
              <br />
              {job.property.city}, {job.property.state} {job.property.pincode}
            </address>
            <p className="flex flex-wrap items-center gap-2">
              <PhoneIcon className="size-4 text-muted-foreground" />
              {job.contact.name}
              {job.contact.phone && (
                <a href={`tel:${job.contact.phone}`} className="text-primary underline-offset-4 hover:underline">
                  {job.contact.phone}
                </a>
              )}
            </p>
            <JobMap location={{ lat: job.property.lat, lng: job.property.lng }} label={job.property.label} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
