import { useParams } from 'react-router'
import { PropertyDetail } from '@/features/properties/components/PropertyDetail'

export default function PropertyDetailPage() {
  const { id = '' } = useParams()
  return <PropertyDetail id={id} />
}
