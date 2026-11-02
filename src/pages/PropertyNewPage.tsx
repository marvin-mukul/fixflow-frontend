import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { buildPath, PATHS } from '@/constants/paths'
import { PropertyForm } from '@/features/properties/components/PropertyForm'

export default function PropertyNewPage() {
  const navigate = useNavigate()
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader title="Add property" description="Pin it on the map so nearby workers can find it." />
      <PropertyForm
        onCancel={() => navigate(PATHS.CUSTOMER_PROPERTIES)}
        onSaved={(property) => {
          toast.success('Property added')
          navigate(buildPath(PATHS.CUSTOMER_PROPERTY_DETAIL, { id: property.id }))
        }}
      />
    </div>
  )
}
