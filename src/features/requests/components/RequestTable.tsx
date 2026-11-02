import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { PriorityBadge } from '@/components/common/PriorityBadge'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { buildPath, PATHS } from '@/constants/paths'
import type { RepairRequest } from '@/features/requests/types/request.types'
import { formatDate } from '@/utils/format'

const BASE_REQUEST_COLUMNS: DataTableColumn<RepairRequest>[] = [
  {
    id: 'title',
    header: 'Request',
    cell: (r) => (
      <div className="flex flex-col">
        <span className="font-medium">{r.title}</span>
        <span className="text-xs text-muted-foreground">{r.category.name}</span>
      </div>
    ),
  },
  {
    id: 'property',
    header: 'Property',
    cell: (r) => <span className="text-muted-foreground">{r.property.label}</span>,
    className: 'hidden md:table-cell',
  },
  { id: 'priority', header: 'Priority', cell: (r) => <PriorityBadge priority={r.priority} /> },
  { id: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
  {
    id: 'created',
    header: 'Raised',
    cell: (r) => <span className="text-muted-foreground">{formatDate(r.createdAt)}</span>,
    className: 'hidden sm:table-cell',
  },
]

interface RequestTableProps {
  rows: RepairRequest[]
  loading: boolean
  empty: ReactNode
  /** The list failed to load (an ErrorAlert is shown by the caller). */
  failed?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  columns?: DataTableColumn<RepairRequest>[]
  caption?: string
  /** Navigate to the request detail on row click (off when rows hold their own buttons). */
  navigateOnRowClick?: boolean
}

export function RequestTable({
  rows,
  loading,
  empty,
  failed,
  hasMore,
  onLoadMore,
  columns = BASE_REQUEST_COLUMNS,
  caption = 'Repair requests',
  navigateOnRowClick = true,
}: RequestTableProps) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col gap-3">
      <DataTable
        caption={caption}
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        loading={loading}
        empty={empty}
        failed={failed}
        onRowClick={
          navigateOnRowClick
            ? (r) => navigate(buildPath(PATHS.CUSTOMER_REQUEST_DETAIL, { id: r.id }))
            : undefined
        }
      />
      {hasMore && (
        <Button variant="outline" className="self-center" disabled={loading} onClick={onLoadMore}>
          {loading ? 'Loading…' : 'Load more'}
        </Button>
      )}
    </div>
  )
}
