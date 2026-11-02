import { PageHeader } from '@/components/common/PageHeader'
import { PropertySummary } from '@/features/properties/components/PropertySummary'
import { RequestOverview } from '@/features/requests/components/RequestOverview'

export default function CustomerDashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Your properties and repair requests at a glance." />
      <RequestOverview />
      <PropertySummary />
    </>
  )
}
