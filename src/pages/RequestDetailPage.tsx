import { useParams } from 'react-router'
import { QUOTES_VISIBLE_IN } from '@/constants/status'
import { JobTrackingPanel } from '@/features/jobs/components/JobTrackingPanel'
import { QuoteComparison } from '@/features/quotes/components/QuoteComparison'
import { RequestDetail } from '@/features/requests/components/RequestDetail'

export default function RequestDetailPage() {
  const { id = '' } = useParams()
  return (
    <RequestDetail
      id={id}
      renderExtra={(request, refresh) => (
        <>
          {request.jobId && <JobTrackingPanel jobId={request.jobId} onChanged={refresh} />}
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
