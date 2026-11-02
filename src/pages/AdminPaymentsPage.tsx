import { PageHeader } from '@/components/common/PageHeader'
import { PaymentList } from '@/features/admin/components/PaymentList'

export default function AdminPaymentsPage() {
  return (
    <>
      <PageHeader title="Payments" description="Invoice payments and refunds." />
      <PaymentList />
    </>
  )
}
