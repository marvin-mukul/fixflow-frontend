import { HardHatIcon } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'

export default function WorkerDashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Leads, quotes and jobs at a glance." />
      <EmptyState
        icon={<HardHatIcon />}
        title="No leads yet"
        description="Onboarding, leads and jobs arrive in the next steps."
        className="rounded-xl border border-dashed"
      />
    </>
  )
}
