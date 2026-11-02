import { FileCheckIcon, FileXIcon, UsersIcon } from 'lucide-react'
import { useState } from 'react'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WORKER_STATUS_SHORT, type WorkerVerificationStatus } from '@/constants/status'
import { WorkerReviewSheet } from '@/features/admin/components/WorkerReviewSheet'
import { useAdminWorkers } from '@/features/admin/hooks/useAdmin'
import type { AdminWorker } from '@/features/admin/types/admin.types'
import { formatDate } from '@/utils/format'

const TABS = Object.keys(WORKER_STATUS_SHORT) as WorkerVerificationStatus[]

/** Worker verification queue: status tabs, table and a review sheet. */
export function WorkerVerificationQueue() {
  const [status, setStatus] = useState<WorkerVerificationStatus>('PENDING')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { items, loading, error, filter, reload } = useAdminWorkers(status)
  const rows = filter === status ? items : []
  const selected = rows.find((w) => w.id === selectedId) ?? null

  const columns: DataTableColumn<AdminWorker>[] = [
    {
      id: 'name',
      header: 'Worker',
      cell: (w) => (
        <div className="flex flex-col">
          <span className="font-medium">{w.name}</span>
          <span className="text-xs text-muted-foreground">{w.email}</span>
        </div>
      ),
    },
    { id: 'phone', header: 'Phone', cell: (w) => w.phone ?? '—', className: 'hidden md:table-cell' },
    {
      id: 'categories',
      header: 'Categories',
      className: 'hidden lg:table-cell',
      cell: (w) =>
        w.categories.length === 0 ? (
          <span className="text-muted-foreground">None</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {w.categories.map((c) => (
              <Badge key={c.id} variant="outline">
                {c.name}
              </Badge>
            ))}
          </div>
        ),
    },
    {
      id: 'document',
      header: 'ID',
      cell: (w) =>
        w.hasIdDocument ? (
          <FileCheckIcon className="size-4 text-emerald-600" aria-label="ID document uploaded" />
        ) : (
          <FileXIcon className="size-4 text-muted-foreground" aria-label="No ID document" />
        ),
    },
    { id: 'applied', header: 'Applied', cell: (w) => formatDate(w.createdAt), className: 'hidden sm:table-cell' },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'text-right',
      cell: (w) => (
        <Button size="sm" variant="outline" aria-label={`Review ${w.name}`} onClick={() => setSelectedId(w.id)}>
          Review
        </Button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={status} onValueChange={(v) => setStatus(v as WorkerVerificationStatus)}>
        <TabsList>
          {TABS.map((s) => (
            <TabsTrigger key={s} value={s}>
              {WORKER_STATUS_SHORT[s].label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <ErrorAlert title="Could not load workers" message={error?.message} onRetry={reload} />
      <DataTable
        caption="Workers"
        columns={columns}
        rows={rows}
        getRowId={(w) => w.id}
        loading={loading}
        failed={!!error}
        empty={
          <EmptyState
            icon={<UsersIcon />}
            title="No workers here"
            description={
              status === 'PENDING' ? 'New worker applications show up here.' : 'No workers have this status.'
            }
            className="rounded-xl border border-dashed"
          />
        }
      />
      <WorkerReviewSheet worker={selected} onOpenChange={(open) => !open && setSelectedId(null)} />
    </div>
  )
}
