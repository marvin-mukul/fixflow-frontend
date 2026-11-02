import { ReceiptIndianRupeeIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { MoneyText } from '@/components/common/MoneyText'
import { StatusBadge } from '@/components/common/StatusBadge'
import { buildPath, PATHS } from '@/constants/paths'
import {
  fetchMyQuotes,
  selectMyQuotes,
  selectMyQuotesError,
  selectMyQuotesStatus,
} from '@/features/quotes/store/quotesSlice'
import type { MyQuoteItem } from '@/features/quotes/types/quote.types'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { formatDate, formatDateTime } from '@/utils/format'

const COLUMNS: DataTableColumn<MyQuoteItem>[] = [
  {
    id: 'request',
    header: 'Request',
    cell: (q) => (
      <div className="flex flex-col">
        <span className="font-medium">{q.request.title}</span>
        <span className="text-xs text-muted-foreground">Sent {formatDate(q.createdAt)} · v{q.version}</span>
      </div>
    ),
  },
  { id: 'status', header: 'Status', cell: (q) => <StatusBadge kind="quote" status={q.status} /> },
  { id: 'total', header: 'Total', cell: (q) => <MoneyText paise={q.totalPaise} className="font-medium" /> },
  { id: 'eta', header: 'ETA', cell: (q) => `${q.etaHours} h`, className: 'hidden sm:table-cell' },
  {
    id: 'valid',
    header: 'Valid until',
    cell: (q) => <span className="text-muted-foreground">{formatDateTime(q.validUntil)}</span>,
    className: 'hidden md:table-cell',
  },
]

/** Worker's quotes across all leads. */
export function MyQuotes({ limit }: { limit?: number }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const items = useAppSelector(selectMyQuotes)
  const status = useAppSelector(selectMyQuotesStatus)
  const error = useAppSelector(selectMyQuotesError)

  useEffect(() => {
    if (status === 'idle') void dispatch(fetchMyQuotes())
  }, [dispatch, status])

  return (
    <div className="flex flex-col gap-3">
      <ErrorAlert title="Could not load your quotes" message={error?.message} />
      <DataTable
        caption="My quotes"
        columns={COLUMNS}
        rows={limit ? items.slice(0, limit) : items}
        getRowId={(q) => q.id}
        loading={status === 'loading' || status === 'idle'}
        onRowClick={(q) => navigate(buildPath(PATHS.WORKER_LEAD_DETAIL, { requestId: q.request.id }))}
        empty={
          <EmptyState
            icon={<ReceiptIndianRupeeIcon />}
            title="No quotes yet"
            description="Open a lead and send a quote to see it here."
            className="rounded-xl border border-dashed"
          />
        }
      />
    </div>
  )
}
