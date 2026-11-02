import { ExternalLinkIcon } from 'lucide-react'
import { Link } from 'react-router'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { Loader } from '@/components/common/Loader'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { buildPath, PATHS } from '@/constants/paths'
import { InvoiceActions } from '@/features/invoices/components/InvoiceActions'
import { InvoiceView } from '@/features/invoices/components/InvoiceView'
import { useInvoice } from '@/features/invoices/hooks/useInvoices'
import type { InvoiceViewer } from '@/features/invoices/types/invoice.types'

interface InvoicePanelProps {
  invoiceId: string
  viewer: InvoiceViewer
}

/** Invoice card for the request/job screens, with pay / offline actions. */
export function InvoicePanel({ invoiceId, viewer }: InvoicePanelProps) {
  const { invoice, status, error, refresh } = useInvoice(invoiceId)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice</CardTitle>
        <CardAction>
          <Link
            to={buildPath(PATHS.INVOICE_DETAIL, { id: invoiceId })}
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          >
            Open
            <ExternalLinkIcon />
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {invoice ? (
          <InvoiceView invoice={invoice} />
        ) : status === 'failed' ? (
          <ErrorAlert title="Could not load the invoice" message={error?.message} />
        ) : (
          <Loader label="Loading invoice…" />
        )}
      </CardContent>
      {invoice?.status === 'ISSUED' && (
        <CardFooter>
          <InvoiceActions invoice={invoice} viewer={viewer} onChanged={refresh} />
        </CardFooter>
      )}
    </Card>
  )
}
