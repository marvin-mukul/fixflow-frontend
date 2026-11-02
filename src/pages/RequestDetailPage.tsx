import { useParams } from 'react-router'
import { QUOTES_VISIBLE_IN } from '@/constants/status'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { InvoicePanel } from '@/features/invoices/components/InvoicePanel'
import { JobTrackingPanel } from '@/features/jobs/components/JobTrackingPanel'
import { QuoteComparison } from '@/features/quotes/components/QuoteComparison'
import { RequestDetail } from '@/features/requests/components/RequestDetail'
import { JobReviewPanel } from '@/features/reviews/components/JobReviewPanel'

export default function RequestDetailPage() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  return (
    <RequestDetail
      id={id}
      renderExtra={(request, refresh) => (
        <>
          {request.jobId && (
            <JobTrackingPanel
              jobId={request.jobId}
              onChanged={refresh}
              renderExtra={(job, refreshJob) => (
                <>
                  {job.invoice && (
                    <InvoicePanel invoiceId={job.invoice.id} viewer={{ userId: user?.id ?? '', isWorker: false }} />
                  )}
                  {job.requestStatus === 'COMPLETED' && (
                    <JobReviewPanel
                      jobId={job.id}
                      relations={job.myRelations}
                      myReview={job.myReview}
                      onSaved={refreshJob}
                    />
                  )}
                </>
              )}
            />
          )}
          {QUOTES_VISIBLE_IN.includes(request.status) && (
            <QuoteComparison
              requestId={request.id}
              canAccept={request.availableActions.includes('accept_quote')}
              onAccepted={refresh}
            />
          )}
        </>
      )}
    />
  )
}
