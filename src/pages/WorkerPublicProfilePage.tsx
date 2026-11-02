import { useParams } from 'react-router'
import { WorkerPublicProfile } from '@/features/reviews/components/WorkerPublicProfile'

export default function WorkerPublicProfilePage() {
  const { id = '' } = useParams()
  return <WorkerPublicProfile id={id} />
}
