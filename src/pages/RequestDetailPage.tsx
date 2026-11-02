import { useParams } from 'react-router'
import { RequestDetail } from '@/features/requests/components/RequestDetail'

export default function RequestDetailPage() {
  const { id = '' } = useParams()
  return <RequestDetail id={id} />
}
