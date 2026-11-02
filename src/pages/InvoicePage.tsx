import { useParams, useSearchParams } from 'react-router'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { InvoiceDetail } from '@/features/invoices/components/InvoiceDetail'
import type { PaymentReturnStatus } from '@/features/invoices/types/invoice.types'

const RETURN_STATUSES: readonly string[] = ['PAID', 'FAILED', 'PENDING'] satisfies PaymentReturnStatus[]

/** `/invoices/:id[?status=PAID|FAILED|PENDING]` — also where the payment return lands. */
export default function InvoicePage() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const { user } = useAuth()
  const raw = params.get('status')
  const returnStatus = raw && RETURN_STATUSES.includes(raw) ? (raw as PaymentReturnStatus) : null
  return (
    <InvoiceDetail
      id={id}
      returnStatus={returnStatus}
      viewer={{ userId: user?.id ?? '', isWorker: user?.globalRole === 'WORKER' }}
    />
  )
}
