import { PageHeader } from '@/components/common/PageHeader'
import { ApprovalsInbox } from '@/features/requests/components/ApprovalsInbox'

export default function ApprovalsPage() {
  return (
    <>
      <PageHeader
        title="Approvals"
        description="Tenant requests on your properties wait here until you approve or reject them."
      />
      <ApprovalsInbox />
    </>
  )
}
