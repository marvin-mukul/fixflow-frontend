import { Navigate, Outlet } from 'react-router'
import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { Button } from '@/components/ui/button'
import { PATHS } from '@/constants/paths'
import { useWorkerProfile } from '@/features/worker/hooks/useWorker'

/** Worker area layout route: no profile yet (WORKER_PROFILE_MISSING) → onboarding wizard. */
export function RequireWorkerProfile() {
  const { profile, loading, missing, error, reload } = useWorkerProfile()
  if (profile) return <Outlet />
  if (missing) return <Navigate to={PATHS.WORKER_ONBOARDING} replace />
  if (loading) return <Loader />
  return (
    <EmptyState
      title="Could not load your worker profile"
      description={error?.message}
      action={<Button onClick={() => void reload()}>Try again</Button>}
    />
  )
}
