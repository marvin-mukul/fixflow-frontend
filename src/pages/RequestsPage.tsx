import { PlusIcon } from 'lucide-react'
import { Link } from 'react-router'
import { PageHeader } from '@/components/common/PageHeader'
import { buttonVariants } from '@/components/ui/button'
import { PATHS } from '@/constants/paths'
import { RequestList } from '@/features/requests/components/RequestList'

export default function RequestsPage() {
  return (
    <>
      <PageHeader
        title="Repair requests"
        description="Everything you raised, pay for, or that concerns your properties."
        actions={
          <Link to={PATHS.CUSTOMER_REQUEST_NEW} className={buttonVariants()}>
            <PlusIcon />
            Raise request
          </Link>
        }
      />
      <RequestList />
    </>
  )
}
