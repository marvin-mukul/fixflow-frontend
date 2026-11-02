import { CircleCheckIcon, CircleXIcon, ClockIcon, Loader2Icon } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { PageHeader } from '@/components/common/PageHeader'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { InvoiceActions } from '@/features/invoices/components/InvoiceActions'
import { InvoiceView } from '@/features/invoices/components/InvoiceView'
import { useInvoice, usePaymentPolling } from '@/features/invoices/hooks/useInvoices'
import type { Invoice, InvoiceViewer, PaymentReturnStatus } from '@/features/invoices/types/invoice.types'

const PAID_STATUSES: Invoice['status'][] = ['PAID', 'PAID_OFFLINE']

function ReturnBanner({
  invoice,
  returnStatus,
  polling,
  timedOut,
  onRefresh,
}: {
  invoice: Invoice
  returnStatus: PaymentReturnStatus | null
  polling: boolean
  timedOut: boolean
  onRefresh: () => void
}) {
  if (!returnStatus) return null
  if (PAID_STATUSES.includes(invoice.status)) {
    return (
      <Alert className="border-emerald-300 text-emerald-800 dark:text-emerald-200">
        <CircleCheckIcon />
        <AlertTitle>Payment received</AlertTitle>
        <AlertDescription>Thank you! Invoice {invoice.number} is paid.</AlertDescription>
      </Alert>
    )
  }
  if (returnStatus === 'FAILED') {
    return (
      <Alert variant="destructive">
        <CircleXIcon />
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>No money was taken. You can try again below.</AlertDescription>
      </Alert>
    )
  }
  if (polling) {
    return (
      <Alert>
        <Loader2Icon className="animate-spin" />
        <AlertTitle>Confirming your payment…</AlertTitle>
        <AlertDescription>This usually takes a few seconds. Please keep this page open.</AlertDescription>
      </Alert>
    )
  }
  if (timedOut) {
    return (
      <Alert>
        <ClockIcon />
        <AlertTitle>Payment is still processing</AlertTitle>
        <AlertDescription>
          We have not received the confirmation yet. You will be notified once it arrives.
          <Button variant="outline" size="sm" className="mt-2 w-fit" onClick={onRefresh}>
            Check again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }
  return null
}

interface InvoiceDetailProps {
  id: string
  viewer: InvoiceViewer
  /** `?status=` from the payment return redirect. */
  returnStatus: PaymentReturnStatus | null
}

/** Invoice page; also the landing page after a gateway return (polls until the webhook lands). */
export function InvoiceDetail({ id, viewer, returnStatus }: InvoiceDetailProps) {
  const { invoice, status, error, refresh } = useInvoice(id)
  const { polling, timedOut } = usePaymentPolling(id, returnStatus, invoice?.status)

  if (!invoice) {
    if (status === 'failed') return <EmptyState title="Invoice not found" description={error?.message} />
    return <Loader />
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader title={`Invoice ${invoice.number}`} description={invoice.requestTitle} />
      <ReturnBanner invoice={invoice} returnStatus={returnStatus} polling={polling} timedOut={timedOut} onRefresh={refresh} />
      <Card>
        <CardContent>
          <InvoiceView invoice={invoice} />
        </CardContent>
        {invoice.status === 'ISSUED' && !polling && (
          <CardFooter>
            <InvoiceActions invoice={invoice} viewer={viewer} onChanged={refresh} />
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
