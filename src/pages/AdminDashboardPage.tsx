import { ShieldCheckIcon } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'

export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader title="Admin dashboard" description="Platform operations at a glance." />
      <EmptyState
        icon={<ShieldCheckIcon />}
        title="Nothing to review"
        description="Worker verification, disputes and stats arrive in later steps."
        className="rounded-xl border border-dashed"
      />
    </>
  )
}
