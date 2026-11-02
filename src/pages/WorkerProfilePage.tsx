import { PageHeader } from '@/components/common/PageHeader'
import { WorkerProfileSettings } from '@/features/worker/components/WorkerProfileSettings'

export default function WorkerProfilePage() {
  return (
    <>
      <PageHeader title="Profile & availability" description="What customers see and where you get leads." />
      <WorkerProfileSettings />
    </>
  )
}
