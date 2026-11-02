import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { buildPath, PATHS } from '@/constants/paths'
import { PropertyForm } from '@/features/properties/components/PropertyForm'
import { usePropertyDetail } from '@/features/properties/hooks/useProperties'

/** Loads a property and renders `PropertyForm` in edit mode. */
export function EditPropertyForm({ id }: { id: string }) {
  const navigate = useNavigate()
  const { property, loading, error } = usePropertyDetail(id)
  const detailPath = buildPath(PATHS.CUSTOMER_PROPERTY_DETAIL, { id })

  if (loading) return <Loader />
  if (!property) return <EmptyState title="Property not found" description={error?.message} />
  if (property.relation !== 'OWNER') {
    return <EmptyState title="Only the owner can edit this property" />
  }
  return (
    <PropertyForm
      property={property}
      onCancel={() => navigate(detailPath)}
      onSaved={() => {
        toast.success('Property updated')
        navigate(detailPath)
      }}
    />
  )
}
