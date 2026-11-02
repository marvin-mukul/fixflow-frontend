import { HammerIcon, MapPinCheckIcon, NavigationIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CompleteJobDialog } from '@/features/jobs/components/CompleteJobDialog'
import { progressJob } from '@/features/jobs/store/jobsSlice'
import type { Job, WorkerJobAction } from '@/features/jobs/types/job.types'
import { toApiError } from '@/lib/apiError'
import { useAppDispatch } from '@/store/hooks'

const STEP_ACTIONS: Record<Exclude<WorkerJobAction, 'complete'>, { label: string; done: string; icon: ReactNode }> = {
  en_route: { label: "I'm on my way", done: 'Customer notified that you are on the way', icon: <NavigationIcon /> },
  arrive: { label: 'Mark arrived', done: 'Marked as arrived', icon: <MapPinCheckIcon /> },
  start: { label: 'Start work', done: 'Work started', icon: <HammerIcon /> },
}

interface WorkerJobActionsProps {
  job: Job
  /** Optional hook after a transition; the slice already holds the updated job. */
  onChanged?: () => void
}

/** The next progress button(s), driven only by the API's `workerActions`. */
export function WorkerJobActions({ job, onChanged }: WorkerJobActionsProps) {
  const dispatch = useAppDispatch()
  const [busy, setBusy] = useState(false)

  const run = async (action: Exclude<WorkerJobAction, 'complete'>) => {
    setBusy(true)
    try {
      await dispatch(progressJob({ id: job.id, action })).unwrap()
      toast.success(STEP_ACTIONS[action].done)
      onChanged?.()
    } catch (err) {
      toast.error('Could not update the job', { description: toApiError(err).message })
    } finally {
      setBusy(false)
    }
  }

  if (job.workerActions.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {job.workerActions.map((action) =>
        action === 'complete' ? (
          <CompleteJobDialog
            key={action}
            job={job}
            onCompleted={() => {
              toast.success('Job completed', { description: 'Waiting for the customer to confirm.' })
              onChanged?.()
            }}
          />
        ) : (
          <Button key={action} disabled={busy} onClick={() => void run(action)}>
            {STEP_ACTIONS[action].icon}
            {STEP_ACTIONS[action].label}
          </Button>
        ),
      )}
    </div>
  )
}
