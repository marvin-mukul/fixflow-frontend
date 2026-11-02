import { useParams } from 'react-router'
import { QUOTES_VISIBLE_IN } from '@/constants/status'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { InvoicePanel } from '@/features/invoices/components/InvoicePanel'
import { JobTrackingPanel } from '@/features/jobs/components/JobTrackingPanel'
import { QuoteComparison } from '@/features/quotes/components/QuoteComparison'
import { RequestDetail } from '@/features/requests/components/RequestDetail'

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
              renderExtra={(job) =>
                job.invoice && (
                  <InvoicePanel invoiceId={job.invoice.id} viewer={{ userId: user?.id ?? '', isWorker: false }} />
                )
              }
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
