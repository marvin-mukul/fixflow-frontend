import { useParams } from 'react-router'
import { PageHeader } from '@/components/common/PageHeader'
import { EditPropertyForm } from '@/features/properties/components/EditPropertyForm'

export default function PropertyEditPage() {
  const { id = '' } = useParams()
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader title="Edit property" />
      <EditPropertyForm id={id} />
    </div>
  )
}
