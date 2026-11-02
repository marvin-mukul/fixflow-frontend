import { BanknoteIcon, HandCoinsIcon } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { PayButton } from '@/features/invoices/components/PayButton'
import { confirmOfflinePayment, markPaidOffline } from '@/features/invoices/store/invoicesSlice'
import type { Invoice, InvoiceViewer } from '@/features/invoices/types/invoice.types'
import { toApiError } from '@/lib/apiError'
import { useAppDispatch } from '@/store/hooks'
import { formatDateTime } from '@/utils/format'

interface InvoiceActionsProps {
  invoice: Invoice
  viewer: InvoiceViewer
  onChanged?: () => void
}

/** Pay online / "I paid offline" for the payer; "Confirm cash received" for the worker. */
export function InvoiceActions({ invoice, viewer, onChanged }: InvoiceActionsProps) {
  const dispatch = useAppDispatch()
  if (invoice.status !== 'ISSUED') return null

  const isPayer = invoice.payerUserId === viewer.userId
  const offlineMarked = invoice.offlineMarkedAt !== null

  const run = async (action: 'mark' | 'confirm') => {
    try {
      if (action === 'mark') {
        await dispatch(markPaidOffline(invoice.id)).unwrap()
        toast.success('Marked as paid offline', { description: 'The worker will confirm they received it.' })
      } else {
        await dispatch(confirmOfflinePayment(invoice.id)).unwrap()
        toast.success('Payment confirmed')
      }
      onChanged?.()
    } catch (err) {
      toast.error('Action failed', { description: toApiError(err).message })
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {offlineMarked && (
        <p className="text-sm text-muted-foreground">
          Marked as paid offline {formatDateTime(invoice.offlineMarkedAt)}
          {isPayer ? ' · waiting for the worker to confirm.' : '.'}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {isPayer && (
          <PayButton invoiceId={invoice.id} totalPaise={invoice.totalPaise} onAlreadyPaid={onChanged} />
        )}
        {isPayer && !offlineMarked && (
          <ConfirmDialog
            title="Paid in cash or UPI directly?"
            description="The worker is asked to confirm they received the money. Only use this if you already paid them."
            confirmLabel="I paid offline"
            onConfirm={() => void run('mark')}
            trigger={
              <Button variant="outline">
                <BanknoteIcon />
                I paid offline
              </Button>
            }
          />
        )}
        {viewer.isWorker && offlineMarked && (
          <ConfirmDialog
            title="Confirm you received the payment?"
            description="The invoice is closed as paid offline. This cannot be undone."
            confirmLabel="Confirm cash received"
            onConfirm={() => void run('confirm')}
            trigger={
              <Button>
                <HandCoinsIcon />
                Confirm cash received
              </Button>
            }
          />
        )}
        {viewer.isWorker && !offlineMarked && !isPayer && (
          <p className="text-sm text-muted-foreground">Waiting for the customer to pay.</p>
        )}
      </div>
    </div>
  )
}
