import { selectCurrentUser } from '@/features/auth/store/authSlice'
import AdminLayout from '@/layouts/AdminLayout'
import CustomerLayout from '@/layouts/CustomerLayout'
import WorkerLayout from '@/layouts/WorkerLayout'
import { useAppSelector } from '@/store/hooks'

/** Shell for screens any signed-in participant can open (invoices, worker profiles): the viewer's own role shell. */
export default function ParticipantLayout() {
  const user = useAppSelector(selectCurrentUser)
  switch (user?.globalRole) {
    case 'WORKER':
      return <WorkerLayout />
    case 'CUSTOMER':
      return <CustomerLayout />
    default:
      return <AdminLayout />
  }
}
