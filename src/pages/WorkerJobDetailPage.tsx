import { useParams } from 'react-router'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { InvoicePanel } from '@/features/invoices/components/InvoicePanel'
import { WorkerJobDetail } from '@/features/jobs/components/WorkerJobDetail'

export default function WorkerJobDetailPage() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  return (
    <WorkerJobDetail
      id={id}
      renderExtra={(job) =>
        job.invoice && <InvoicePanel invoiceId={job.invoice.id} viewer={{ userId: user?.id ?? '', isWorker: true }} />
      }
    />
  )
}
