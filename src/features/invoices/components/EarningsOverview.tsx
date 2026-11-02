import { BriefcaseIcon, ClockIcon, WalletIcon } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { MoneyText } from '@/components/common/MoneyText'
import { StatCard } from '@/components/common/StatCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { buildPath, PATHS } from '@/constants/paths'
import { useEarnings } from '@/features/invoices/hooks/useInvoices'
import type { EarningsItem } from '@/features/invoices/types/invoice.types'
import { formatDate } from '@/utils/format'

const COLUMNS: DataTableColumn<EarningsItem>[] = [
  {
    id: 'job',
    header: 'Job',
    cell: (i) => (
      <div className="flex flex-col">
        <Link
          to={buildPath(PATHS.WORKER_JOB_DETAIL, { id: i.jobId })}
          className="font-medium underline-offset-4 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {i.requestTitle}
        </Link>
        <span className="text-xs text-muted-foreground">
          {i.number} · {formatDate(i.issuedAt)}
        </span>
      </div>
    ),
  },
  { id: 'status', header: 'Status', cell: (i) => <StatusBadge kind="invoice" status={i.status} /> },
  { id: 'total', header: 'Invoice', cell: (i) => <MoneyText paise={i.totalPaise} />, className: 'text-right' },
  {
    id: 'commission',
    header: 'Commission',
    cell: (i) => <MoneyText paise={i.commissionPaise} className="text-muted-foreground" />,
    className: 'hidden text-right md:table-cell',
  },
  {
    id: 'tcs',
    header: 'TCS',
    cell: (i) => <MoneyText paise={i.tcsPaise} className="text-muted-foreground" />,
    className: 'hidden text-right lg:table-cell',
  },
  {
    id: 'payout',
    header: 'Payout',
    cell: (i) => <MoneyText paise={i.workerPayoutPaise} className="font-medium" />,
    className: 'text-right',
  },
  {
    id: 'paid',
    header: 'Paid',
    cell: (i) => <span className="text-muted-foreground">{formatDate(i.paidAt)}</span>,
    className: 'hidden sm:table-cell',
  },
]

/** Worker earnings: paid / pending payout totals and the invoice list. */
export function EarningsOverview() {
  const navigate = useNavigate()
  const { earnings, error, loading } = useEarnings()
  return (
    <div className="flex flex-col gap-6">
      <ErrorAlert title="Could not load earnings" message={error?.message} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Paid out"
          icon={<WalletIcon />}
          loading={loading}
          value={<MoneyText paise={earnings?.totals.paidPaise ?? 0} />}
          hint="Your payout on paid invoices"
        />
        <StatCard
          label="Pending"
          icon={<ClockIcon />}
          loading={loading}
          value={<MoneyText paise={earnings?.totals.pendingPaise ?? 0} />}
          hint="Invoices awaiting payment"
        />
        <StatCard label="Invoiced jobs" icon={<BriefcaseIcon />} loading={loading} value={earnings?.totals.jobs ?? 0} />
      </div>
      <DataTable
        caption="Earnings"
        columns={COLUMNS}
        rows={earnings?.items ?? []}
        getRowId={(i) => i.invoiceId}
        loading={loading}
        onRowClick={(i) => navigate(buildPath(PATHS.INVOICE_DETAIL, { id: i.invoiceId }))}
        empty={
          <EmptyState
            icon={<WalletIcon />}
            title="No invoices yet"
            description="Invoices are issued when a customer confirms a completed job."
            className="rounded-xl border border-dashed"
          />
        }
      />
    </div>
  )
}
