import { PageHeader } from '@/components/common/PageHeader'
import { WorkerJobList } from '@/features/jobs/components/WorkerJobList'

export default function WorkerJobsPage() {
  return (
    <>
      <PageHeader title="Jobs" description="Jobs you were hired for. Update your progress so the customer can follow along." />
      <WorkerJobList />
    </>
  )
}
