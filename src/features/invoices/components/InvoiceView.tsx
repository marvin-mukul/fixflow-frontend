import type { ReactNode } from 'react'
import { MoneyText } from '@/components/common/MoneyText'
import { StatusBadge } from '@/components/common/StatusBadge'
import type { Invoice } from '@/features/invoices/types/invoice.types'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/utils/format'

function Line({ label, paise, negative, strong, hint }: { label: ReactNode; paise: number; negative?: boolean; strong?: boolean; hint?: ReactNode }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-4 text-sm', strong && 'border-t pt-2 text-base font-semibold')}>
      <dt className={cn(!strong && 'text-muted-foreground')}>
        {label}
        {hint && <span className="ml-1 text-xs text-muted-foreground">{hint}</span>}
      </dt>
      <dd>
        {negative && '− '}
        <MoneyText paise={paise} />
      </dd>
    </div>
  )
}

const pct = (value: number | undefined) => (value === undefined ? undefined : `(${value}%)`)

/** Line items, GST split (CGST+SGST or IGST) and total; payout breakdown only when the API sends it. */
export function InvoiceView({ invoice }: { invoice: Invoice }) {
  const interState = invoice.igstPaise > 0
  const rates = invoice.breakdown?.ratesSnapshot
  const halfGst = rates?.gstPercent !== undefined ? rates.gstPercent / 2 : undefined
  return (
    <div className="flex flex-col gap-4" data-testid="invoice-view">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex flex-col">
          <span className="font-medium">Invoice {invoice.number}</span>
          <span className="text-xs text-muted-foreground">
            {invoice.requestTitle} · {invoice.workerName} · issued {formatDateTime(invoice.issuedAt)}
          </span>
        </div>
        <StatusBadge kind="invoice" status={invoice.status} />
      </div>
      <dl className="flex flex-col gap-2">
        <Line label="Service charges" paise={invoice.servicePaise} />
        {interState ? (
          <Line label="IGST" hint={pct(rates?.gstPercent)} paise={invoice.igstPaise} />
        ) : (
          <>
            <Line label="CGST" hint={pct(halfGst)} paise={invoice.cgstPaise} />
            <Line label="SGST" hint={pct(halfGst)} paise={invoice.sgstPaise} />
          </>
        )}
        <Line label="Total" paise={invoice.totalPaise} strong />
      </dl>
      {invoice.paidAt && (
        <p className="text-xs text-muted-foreground">Paid {formatDateTime(invoice.paidAt)}</p>
      )}
      {invoice.breakdown && (
        <section aria-label="Payout breakdown" className="flex flex-col gap-2 rounded-xl bg-muted/50 p-3">
          <h2 className="text-sm font-medium">Your payout</h2>
          <dl className="flex flex-col gap-1.5">
            <Line label="Invoice total" paise={invoice.totalPaise} />
            <Line label="Platform commission" hint={pct(rates?.commissionPercent)} paise={invoice.breakdown.commissionPaise} negative />
            {invoice.breakdown.commissionGstPaise > 0 && (
              <Line label="GST on commission" paise={invoice.breakdown.commissionGstPaise} negative />
            )}
            {invoice.breakdown.tcsPaise > 0 && (
              <Line label="TCS" hint={pct(rates?.tcsPercent)} paise={invoice.breakdown.tcsPaise} negative />
            )}
            {invoice.gstMode === 'PLATFORM_9_5' && invoice.igstPaise + invoice.cgstPaise + invoice.sgstPaise > 0 && (
              <Line label="GST (remitted by the platform)" paise={invoice.igstPaise + invoice.cgstPaise + invoice.sgstPaise} negative />
            )}
            <Line label="You receive" paise={invoice.breakdown.workerPayoutPaise} strong />
          </dl>
        </section>
      )}
    </div>
  )
}
