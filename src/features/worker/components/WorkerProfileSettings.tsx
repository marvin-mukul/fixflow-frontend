import { toast } from 'sonner'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { Loader } from '@/components/common/Loader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AvailabilityToggle } from '@/features/worker/components/AvailabilityToggle'
import { CategoriesForm } from '@/features/worker/components/CategoriesForm'
import { IdDocumentForm } from '@/features/worker/components/IdDocumentForm'
import { ProfileForm } from '@/features/worker/components/ProfileForm'
import { VerificationBadge } from '@/features/worker/components/VerificationBadge'
import { useWorkerProfile } from '@/features/worker/hooks/useWorker'

/** Profile page: availability, base profile, categories and ID document. */
export function WorkerProfileSettings() {
  const { profile, loading, error } = useWorkerProfile()
  if (loading) return <Loader />
  if (!profile) return <ErrorAlert title="Could not load your profile" message={error?.message} />

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your base and service radius decide which leads you see.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm profile={profile} onSaved={() => toast.success('Profile saved')} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoriesForm profile={profile} onSaved={() => toast.success('Categories saved')} />
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>
              <VerificationBadge status={profile.verificationStatus} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AvailabilityToggle profile={profile} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ID document</CardTitle>
            <CardDescription>Admins check it before verifying you.</CardDescription>
          </CardHeader>
          <CardContent>
            <IdDocumentForm profile={profile} onSaved={() => toast.success('Document uploaded')} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
