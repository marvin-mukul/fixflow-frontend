import { PageHeader } from '@/components/common/PageHeader'
import { WorkerVerificationQueue } from '@/features/admin/components/WorkerVerificationQueue'

export default function AdminWorkersPage() {
  return (
    <>
      <PageHeader title="Workers" description="Verify new workers, or suspend verified ones." />
      <WorkerVerificationQueue />
    </>
  )
}
