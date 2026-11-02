import { WrenchIcon } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'

export default function CustomerDashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Your properties and repair requests at a glance." />
      <EmptyState
        icon={<WrenchIcon />}
        title="No repair requests yet"
        description="Properties and repair requests arrive in the next steps."
        className="rounded-xl border border-dashed"
      />
    </>
  )
}
