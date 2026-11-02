import { PageHeader } from '@/components/common/PageHeader'
import { AdminList } from '@/features/admin/components/AdminList'
import { useAuth } from '@/features/auth/hooks/useAuth'

export default function AdminAdminsPage() {
  const { user } = useAuth()
  if (!user) return null
  return (
    <>
      <PageHeader title="Admins" description="People who run the platform." />
      <AdminList currentUserId={user.id} />
    </>
  )
}
