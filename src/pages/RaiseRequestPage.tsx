import { useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { buildPath, PATHS } from '@/constants/paths'
import { usePropertyOptions } from '@/features/properties/hooks/useProperties'
import { RaiseRequestForm } from '@/features/requests/components/RaiseRequestForm'

export default function RaiseRequestPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { options, loading } = usePropertyOptions()

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader title="Raise a repair request" description="Nearby verified workers will send quotes." />
      <RaiseRequestForm
        properties={options}
        propertiesLoading={loading}
        defaultPropertyId={params.get('propertyId') ?? undefined}
        onCreated={(request) => {
          toast.success('Request raised')
          navigate(buildPath(PATHS.CUSTOMER_REQUEST_DETAIL, { id: request.id }))
        }}
      />
    </div>
  )
}
