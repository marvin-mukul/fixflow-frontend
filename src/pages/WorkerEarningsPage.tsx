import { PageHeader } from '@/components/common/PageHeader'
import { EarningsOverview } from '@/features/invoices/components/EarningsOverview'

export default function WorkerEarningsPage() {
  return (
    <>
      <PageHeader title="Earnings" description="Your payout per invoice after platform commission and taxes." />
      <EarningsOverview />
    </>
  )
}
