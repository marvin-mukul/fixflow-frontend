import { PageHeader } from '@/components/common/PageHeader'
import { LeadsList } from '@/features/worker/components/LeadsList'

export default function LeadsPage() {
  return (
    <>
      <PageHeader
        title="Leads"
        description="Requests matched to your categories and service radius. Locations are approximate until you are hired."
      />
      <LeadsList />
    </>
  )
}
