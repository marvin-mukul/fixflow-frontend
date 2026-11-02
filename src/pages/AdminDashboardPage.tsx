import { PageHeader } from '@/components/common/PageHeader'
import { AdminStatsOverview } from '@/features/admin/components/AdminStatsOverview'

export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader title="Admin dashboard" description="Platform operations at a glance." />
      <AdminStatsOverview />
    </>
  )
}
