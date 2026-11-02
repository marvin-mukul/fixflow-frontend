import { CheckIcon, PhoneIcon, ShieldAlertIcon, TriangleAlertIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { Loader } from '@/components/common/Loader'
import { MoneyText } from '@/components/common/MoneyText'
import { PhotoGallery } from '@/components/common/PhotoGallery'
import { ReasonDialog } from '@/components/common/ReasonDialog'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { JobProgress } from '@/features/jobs/components/JobProgress'
import { useJob } from '@/features/jobs/hooks/useJobs'
import { confirmJob, disputeJob } from '@/features/jobs/store/jobsSlice'
import type { Job } from '@/features/jobs/types/job.types'
import { toApiError } from '@/lib/apiError'
import { useAppDispatch } from '@/store/hooks'
import { formatDateTime } from '@/utils/format'

interface JobTrackingPanelProps {
  jobId: string
  /** Called after confirm/dispute so the page can refresh the request. */
  onChanged: () => void
  /** Renders the worker's name (e.g. as a link to their public profile). */
  renderWorker?: (job: Job) => ReactNode
  /** Invoice / review panels composed by the page. */
  renderExtra?: (job: Job, refresh: () => void) => ReactNode
}

/** Customer view of an accepted job: progress, worker, after photos, confirm/dispute. */
export function JobTrackingPanel({ jobId, onChanged, renderWorker, renderExtra }: JobTrackingPanelProps) {
  const dispatch = useAppDispatch()
  const { job, status, error, refresh } = useJob(jobId)

  if (!job) {
    if (status === 'failed') return <ErrorAlert title="Could not load the job" message={error?.message} />
    return <Loader label="Loading job…" />
  }

  const can = (action: string) => job.customerActions.includes(action)
  const photos = job.afterPhotos
    .filter((p) => p.mimeType.startsWith('image/'))
    .map((p) => ({ id: p.id, url: p.url, label: 'After' }))

  const confirm = async () => {
    try {
      await dispatch(confirmJob(job.id)).unwrap()
      toast.success('Job confirmed', { description: 'The invoice has been issued.' })
      onChanged()
    } catch (err) {
      toast.error('Could not confirm', { description: toApiError(err).message })
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Job</CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-2">
            <StatusBadge kind="job" status={job.subStatus} />
            {job.scheduledStart && <span>Scheduled {formatDateTime(job.scheduledStart)}</span>}
          </CardDescription>
          {(can('confirm') || can('dispute')) && (
            <CardAction className="flex flex-wrap gap-2">
              {can('confirm') && (
                <ConfirmDialog
                  title="Confirm the work is done?"
                  description={
                    <>
                      The invoice for <MoneyText paise={job.finalAmountPaise} /> is issued and the request is closed.
                    </>
                  }
                  confirmLabel="Confirm completion"
                  onConfirm={() => void confirm()}
                  trigger={
                    <Button>
                      <CheckIcon />
                      Confirm completion
                    </Button>
                  }
                />
              )}
              {can('dispute') && (
                <ReasonDialog
                  title="Raise a dispute"
                  description="Tell us what is wrong. An admin reviews the job and both sides are notified."
                  label="What went wrong?"
                  minLength={10}
                  confirmLabel="Raise dispute"
                  destructive
                  trigger={<Button variant="outline" />}
                  triggerLabel={
                    <>
                      <TriangleAlertIcon />
                      Dispute
                    </>
                  }
                  onSubmit={async (reason) => {
                    await dispatch(disputeJob({ id: job.id, reason })).unwrap()
                    toast.success('Dispute raised')
                    onChanged()
                  }}
                />
              )}
            </CardAction>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <JobProgress job={job} />
          {job.dispute && (
            <Alert variant="destructive">
              <ShieldAlertIcon />
              <AlertTitle>Dispute {job.dispute.status.toLowerCase()}</AlertTitle>
              <AlertDescription>
                {job.dispute.reason}
                {job.dispute.resolution && <> · Resolution: {job.dispute.resolution}</>}
              </AlertDescription>
            </Alert>
          )}
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">Worker</dt>
              <dd className="font-medium">{renderWorker ? renderWorker(job) : job.worker.name}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">Phone</dt>
              <dd>
                {job.worker.phone ? (
                  <a href={`tel:${job.worker.phone}`} className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline">
                    <PhoneIcon className="size-3.5" />
                    {job.worker.phone}
                  </a>
                ) : (
                  '—'
                )}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">Amount</dt>
              <dd>
                <MoneyText paise={job.finalAmountPaise} className="font-medium" />
                {job.finalAmountPaise !== job.quote.totalPaise && (
                  <span className="text-xs text-muted-foreground">
                    {' '}
                    (quoted <MoneyText paise={job.quote.totalPaise} />)
                  </span>
                )}
              </dd>
            </div>
          </dl>
          {photos.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">After photos</h3>
              <PhotoGallery photos={photos} />
            </div>
          )}
        </CardContent>
      </Card>
      {renderExtra?.(job, refresh)}
    </>
  )
}
