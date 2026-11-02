import { PageHeader } from '@/components/common/PageHeader'
import { SettingsForm } from '@/features/admin/components/SettingsForm'
import { useAuth } from '@/features/auth/hooks/useAuth'

export default function AdminSettingsPage() {
  const { user } = useAuth()
  return (
    <>
      <PageHeader title="Platform settings" description="Pricing, matching, timing and ranking rules." />
      <SettingsForm canEdit={user?.globalRole === 'SUPERADMIN'} />
    </>
  )
}
