import { Stepper } from '@/components/common/Stepper'
import { JOB_SUB_STATUS } from '@/constants/status'
import { JOB_SUB_STATUSES, type Job } from '@/features/jobs/types/job.types'
import { formatDateTime } from '@/utils/format'

/** Sub-status stepper: confirmed → on the way → arrived → working → done. */
export function JobProgress({ job }: { job: Job }) {
  const current = JOB_SUB_STATUSES.indexOf(job.subStatus)
  const timestamps: Partial<Record<Job['subStatus'], string | null>> = {
    WORKING: job.startedAt,
    DONE: job.completedAt,
  }
  return (
    <Stepper
      label="Job progress"
      // DONE is terminal: show every step as completed.
      current={job.subStatus === 'DONE' ? JOB_SUB_STATUSES.length : current}
      steps={JOB_SUB_STATUSES.map((s) => ({
        id: s,
        label: JOB_SUB_STATUS[s].label,
        description: timestamps[s] ? formatDateTime(timestamps[s]) : undefined,
      }))}
    />
  )
}
