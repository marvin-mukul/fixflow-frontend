import { useParams } from 'react-router'
import { WorkerJobDetail } from '@/features/jobs/components/WorkerJobDetail'

export default function WorkerJobDetailPage() {
  const { id = '' } = useParams()
  return <WorkerJobDetail id={id} />
}
