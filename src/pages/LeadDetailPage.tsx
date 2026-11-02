import { useParams } from 'react-router'
import { LeadQuotePanel } from '@/features/quotes/components/LeadQuotePanel'
import { LeadDetail } from '@/features/worker/components/LeadDetail'

export default function LeadDetailPage() {
  const { requestId = '' } = useParams()
  return (
    <LeadDetail
      requestId={requestId}
      renderQuote={(lead, refresh) => (
        <LeadQuotePanel
          requestId={lead.requestId}
          myQuote={lead.myQuote}
          canQuote={lead.canQuote}
          onChanged={refresh}
        />
      )}
    />
  )
}
