import { useParams } from 'react-router'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { InvoicePanel } from '@/features/invoices/components/InvoicePanel'
import { WorkerJobDetail } from '@/features/jobs/components/WorkerJobDetail'
import { JobReviewPanel } from '@/features/reviews/components/JobReviewPanel'

export default function WorkerJobDetailPage() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  return (
    <WorkerJobDetail
      id={id}
      renderExtra={(job, refresh) => (
        <>
          {job.invoice && (
            <InvoicePanel invoiceId={job.invoice.id} viewer={{ userId: user?.id ?? '', isWorker: true }} />
          )}
          {job.requestStatus === 'COMPLETED' && (
            <JobReviewPanel jobId={job.id} relations={job.myRelations} myReview={job.myReview} onSaved={refresh} />
          )}
        </>
      )}
    />
  )
}
