import { ScaleIcon } from 'lucide-react'
import { useState } from 'react'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { MoneyText } from '@/components/common/MoneyText'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResolveDisputeDialog } from '@/features/admin/components/ResolveDisputeDialog'
import { useDisputes } from '@/features/admin/hooks/useAdmin'
import type { AdminDispute, DisputeStatus } from '@/features/admin/types/admin.types'
import { formatDateTime } from '@/utils/format'

/** Disputes with open / resolved tabs; open ones can be resolved. */
export function DisputeList() {
  const [status, setStatus] = useState<DisputeStatus>('OPEN')
  const { items, loading, error, filter, reload } = useDisputes(status)
  const rows = filter === status ? items : []

  const columns: DataTableColumn<AdminDispute>[] = [
    {
      id: 'request',
      header: 'Request',
      cell: (d) => (
        <div className="flex flex-col">
          <span className="font-medium">{d.requestTitle}</span>
          <span className="text-xs text-muted-foreground">
            Worker {d.workerName} · raised by {d.raisedBy.name}
          </span>
        </div>
      ),
    },
    {
      id: 'reason',
      header: status === 'OPEN' ? 'Reason' : 'Resolution',
      className: 'hidden max-w-xs whitespace-normal md:table-cell',
      cell: (d) => <span className="line-clamp-3 text-sm">{status === 'OPEN' ? d.reason : d.resolution}</span>,
    },
    {
      id: 'amount',
      header: 'Amount',
      cell: (d) => (d.amountPaise === null ? '—' : <MoneyText paise={d.amountPaise} />),
    },
    {
      id: 'date',
      header: status === 'OPEN' ? 'Raised' : 'Resolved',
      className: 'hidden sm:table-cell',
      cell: (d) => formatDateTime(status === 'OPEN' ? d.createdAt : d.resolvedAt),
    },
    { id: 'status', header: 'Status', cell: (d) => <StatusBadge kind="dispute" status={d.status} /> },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'text-right',
      cell: (d) => (d.status === 'OPEN' ? <ResolveDisputeDialog dispute={d} /> : null),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={status} onValueChange={(v) => setStatus(v as DisputeStatus)}>
        <TabsList>
          <TabsTrigger value="OPEN">Open</TabsTrigger>
          <TabsTrigger value="RESOLVED">Resolved</TabsTrigger>
        </TabsList>
      </Tabs>
      <ErrorAlert title="Could not load disputes" message={error?.message} onRetry={reload} />
      <DataTable
        caption="Disputes"
        columns={columns}
        rows={rows}
        getRowId={(d) => d.id}
        loading={loading}
        failed={!!error}
        empty={
          <EmptyState
            icon={<ScaleIcon />}
            title={status === 'OPEN' ? 'No open disputes' : 'No resolved disputes yet'}
            className="rounded-xl border border-dashed"
          />
        }
      />
    </div>
  )
}
