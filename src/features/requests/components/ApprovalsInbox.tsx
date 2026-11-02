import { CheckIcon, InboxIcon, XIcon } from 'lucide-react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import type { DataTableColumn } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { PriorityBadge } from '@/components/common/PriorityBadge'
import { ReasonDialog } from '@/components/common/ReasonDialog'
import { Button } from '@/components/ui/button'
import { buildPath, PATHS } from '@/constants/paths'
import { ApproveDialog } from '@/features/requests/components/ApproveDialog'
import { RequestTable } from '@/features/requests/components/RequestTable'
import { useRequestList } from '@/features/requests/hooks/useRequests'
import { rejectRequest } from '@/features/requests/store/requestsSlice'
import type { RepairRequest } from '@/features/requests/types/request.types'
import { useAppDispatch } from '@/store/hooks'
import { formatDate } from '@/utils/format'

/** Owner's queue of tenant requests waiting for approval. */
export function ApprovalsInbox() {
  const dispatch = useAppDispatch()
  const { items, loading, error, hasMore, loadMore } = useRequestList({ scope: 'approvals' })

  const reject = async (request: RepairRequest, reason: string) => {
    await dispatch(rejectRequest({ id: request.id, reason })).unwrap()
    toast.success(`Rejected “${request.title}”`)
  }

  const columns: DataTableColumn<RepairRequest>[] = [
    {
      id: 'title',
      header: 'Request',
      cell: (r) => (
        <div className="flex flex-col">
          <Link
            to={buildPath(PATHS.CUSTOMER_REQUEST_DETAIL, { id: r.id })}
            className="font-medium underline-offset-4 hover:underline"
          >
            {r.title}
          </Link>
          <span className="text-xs text-muted-foreground">
            {r.category.name} · {r.property.label}
          </span>
        </div>
      ),
    },
    {
      id: 'raisedBy',
      header: 'Raised by',
      cell: (r) => (
        <div className="flex flex-col">
          <span>{r.raisedBy.name}</span>
          <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
        </div>
      ),
      className: 'hidden md:table-cell',
    },
    { id: 'priority', header: 'Priority', cell: (r) => <PriorityBadge priority={r.priority} /> },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'text-right',
      cell: (r) => (
        <div className="flex justify-end gap-2">
          <ApproveDialog
            request={r}
            trigger={<Button size="sm" aria-label={`Approve ${r.title}`} />}
            triggerLabel={
              <>
                <CheckIcon />
                Approve
              </>
            }
            onApproved={() => toast.success(`Approved “${r.title}”`)}
          />
          <ReasonDialog
            title={`Reject “${r.title}”?`}
            description={`${r.raisedBy.name} will be notified with your reason.`}
            confirmLabel="Reject request"
            destructive
            trigger={<Button size="sm" variant="outline" aria-label={`Reject ${r.title}`} />}
            triggerLabel={
              <>
                <XIcon />
                Reject
              </>
            }
            onSubmit={(reason) => reject(r, reason)}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      <ErrorAlert title="Could not load approvals" message={error?.message} />
      <RequestTable
        caption="Requests awaiting approval"
        navigateOnRowClick={false}
        columns={columns}
        rows={items}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        empty={
          <EmptyState
            icon={<InboxIcon />}
            title="All caught up"
            description="Tenant requests that need your approval appear here."
            className="rounded-xl border border-dashed"
          />
        }
      />
    </div>
  )
}
