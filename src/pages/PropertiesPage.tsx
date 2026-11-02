import { PlusIcon } from 'lucide-react'
import { Link } from 'react-router'
import { PageHeader } from '@/components/common/PageHeader'
import { buttonVariants } from '@/components/ui/button'
import { PATHS } from '@/constants/paths'
import { PropertyList } from '@/features/properties/components/PropertyList'

export default function PropertiesPage() {
  return (
    <>
      <PageHeader
        title="Properties"
        description="Homes you own or rent. Owners can invite tenants."
        actions={
          <Link to={PATHS.CUSTOMER_PROPERTY_NEW} className={buttonVariants()}>
            <PlusIcon />
            Add property
          </Link>
        }
      />
      <PropertyList />
    </>
  )
}
