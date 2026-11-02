import { PageHeader } from '@/components/common/PageHeader'
import { DisputeList } from '@/features/admin/components/DisputeList'

export default function AdminDisputesPage() {
  return (
    <>
      <PageHeader title="Disputes" description="Decide disputed completions: complete or cancel the job." />
      <DisputeList />
    </>
  )
}
