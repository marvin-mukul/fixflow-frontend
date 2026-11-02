import { ExternalLinkIcon } from 'lucide-react'
import { Link } from 'react-router'
import { PageHeader } from '@/components/common/PageHeader'
import { buttonVariants } from '@/components/ui/button'
import { buildPath, PATHS } from '@/constants/paths'
import { WorkerProfileSettings } from '@/features/worker/components/WorkerProfileSettings'
import { useWorkerProfile } from '@/features/worker/hooks/useWorker'

export default function WorkerProfilePage() {
  const { profile } = useWorkerProfile()
  return (
    <>
      <PageHeader
        title="Profile & availability"
        description="What customers see and where you get leads."
        actions={
          profile && (
            <Link
              to={buildPath(PATHS.WORKER_PUBLIC_PROFILE, { id: profile.id })}
              className={buttonVariants({ variant: 'outline' })}
            >
              Public profile & reviews
              <ExternalLinkIcon />
            </Link>
          )
        }
      />
      <WorkerProfileSettings />
    </>
  )
}
