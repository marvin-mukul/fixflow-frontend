import { PlusIcon } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { buttonVariants } from '@/components/ui/button'
import { PATHS } from '@/constants/paths'
import { PropertyDetail } from '@/features/properties/components/PropertyDetail'

export default function PropertyDetailPage() {
  const { id = '' } = useParams()
  return (
    <PropertyDetail
      id={id}
      actions={
        <Link
          to={`${PATHS.CUSTOMER_REQUEST_NEW}?propertyId=${encodeURIComponent(id)}`}
          className={buttonVariants()}
        >
          <PlusIcon />
          Raise request
        </Link>
      }
    />
  )
}
