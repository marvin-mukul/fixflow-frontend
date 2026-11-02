import { CreditCardIcon } from 'lucide-react'
import { useState } from 'react'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { MoneyText } from '@/components/common/MoneyText'
import { SelectField } from '@/components/common/SelectField'
import { StatusBadge } from '@/components/common/StatusBadge'
import { PAYMENT_STATUS } from '@/constants/status'
import { RefundDialog } from '@/features/admin/components/RefundDialog'
import { usePayments } from '@/features/admin/hooks/useAdmin'
import { PAYMENT_STATUSES, type AdminPayment, type PaymentStatus } from '@/features/admin/types/admin.types'
import { formatDateTime } from '@/utils/format'

type Filter = PaymentStatus | 'ALL'

const FILTER_OPTIONS = [
  { value: 'ALL', label: 'All payments' },
  ...PAYMENT_STATUSES.map((s) => ({ value: s, label: PAYMENT_STATUS[s].label })),
]

const REFUNDABLE: readonly PaymentStatus[] = ['PAID', 'PARTIALLY_REFUNDED']

/** Payments with a status filter; paid ones can be refunded fully or partly. */
export function PaymentList() {
  const [status, setStatus] = useState<Filter>('ALL')
  const { items, loading, error, filter } = usePayments(status)
  const rows = filter === status ? items : []

  const columns: DataTableColumn<AdminPayment>[] = [
    {
      id: 'invoice',
      header: 'Invoice',
      cell: (p) => (
        <div className="flex flex-col">
          <span className="font-medium">{p.invoice.number}</span>
          <span className="text-xs text-muted-foreground">
            {p.provider} · {p.providerOrderId}
          </span>
        </div>
      ),
    },
    { id: 'amount', header: 'Amount', cell: (p) => <MoneyText paise={p.amountPaise} /> },
    {
      id: 'refunded',
      header: 'Refunded',
      cell: (p) => (p.refundedPaise > 0 ? <MoneyText paise={p.refundedPaise} /> : '—'),
    },
    { id: 'status', header: 'Status', cell: (p) => <StatusBadge kind="payment" status={p.status} /> },
    { id: 'created', header: 'Created', className: 'hidden md:table-cell', cell: (p) => formatDateTime(p.createdAt) },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'text-right',
      cell: (p) =>
        REFUNDABLE.includes(p.status) && p.amountPaise > p.refundedPaise ? <RefundDialog payment={p} /> : null,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-xs">
        <SelectField
          id="payment-status"
          label="Status"
          options={FILTER_OPTIONS}
          value={status}
          onChange={(v) => setStatus(v as Filter)}
        />
      </div>
      <ErrorAlert title="Could not load payments" message={error?.message} />
      <DataTable
        caption="Payments"
        columns={columns}
        rows={rows}
        getRowId={(p) => p.id}
        loading={loading}
        empty={
          <EmptyState
            icon={<CreditCardIcon />}
            title="No payments"
            description="Online and offline invoice payments show up here."
            className="rounded-xl border border-dashed"
          />
        }
      />
    </div>
  )
}
