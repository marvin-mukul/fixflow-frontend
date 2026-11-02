import { BriefcaseIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { MoneyText } from '@/components/common/MoneyText'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { buildPath, PATHS } from '@/constants/paths'
import { useWorkerJobs } from '@/features/jobs/hooks/useJobs'
import type { Job, JobFilter } from '@/features/jobs/types/job.types'
import { formatDateTime } from '@/utils/format'

const COLUMNS: DataTableColumn<Job>[] = [
  {
    id: 'title',
    header: 'Job',
    cell: (j) => (
      <div className="flex flex-col">
        <span className="font-medium">{j.title}</span>
        <span className="text-xs text-muted-foreground">
          {j.category.name} · {j.property.city} {j.property.pincode}
        </span>
      </div>
    ),
  },
  { id: 'progress', header: 'Progress', cell: (j) => <StatusBadge kind="job" status={j.subStatus} /> },
  {
    id: 'status',
    header: 'Request',
    cell: (j) => <StatusBadge status={j.requestStatus} />,
    className: 'hidden sm:table-cell',
  },
  {
    id: 'scheduled',
    header: 'Scheduled',
    cell: (j) => <span className="text-muted-foreground">{formatDateTime(j.scheduledStart)}</span>,
    className: 'hidden md:table-cell',
  },
  {
    id: 'amount',
    header: 'Amount',
    cell: (j) => <MoneyText paise={j.finalAmountPaise} />,
    className: 'text-right',
  },
]

function JobsPanel({ filter }: { filter: JobFilter }) {
  const navigate = useNavigate()
  const { items, loading, error, hasMore, loadMore } = useWorkerJobs(filter)
  return (
    <div className="flex flex-col gap-4">
      <ErrorAlert title="Could not load jobs" message={error?.message} />
      <DataTable
        caption="Jobs"
        columns={COLUMNS}
        rows={items}
        getRowId={(j) => j.id}
        loading={loading}
        onRowClick={(j) => navigate(buildPath(PATHS.WORKER_JOB_DETAIL, { id: j.id }))}
        empty={
          <EmptyState
            icon={<BriefcaseIcon />}
            title={filter === 'active' ? 'No active jobs' : 'No jobs yet'}
            description="When a customer accepts your quote, the job shows up here."
            className="rounded-xl border border-dashed"
          />
        }
      />
      {hasMore && (
        <Button variant="outline" className="self-center" onClick={loadMore}>
          Load more
        </Button>
      )}
    </div>
  )
}

/** Jobs assigned to the worker, active/all tabs. */
export function WorkerJobList() {
  const [filter, setFilter] = useState<JobFilter>('active')
  return (
    <Tabs value={filter} onValueChange={(v) => setFilter(v as JobFilter)}>
      <TabsList>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="all">All</TabsTrigger>
      </TabsList>
      <TabsContent value="active" className="pt-2">
        {filter === 'active' && <JobsPanel filter="active" />}
      </TabsContent>
      <TabsContent value="all" className="pt-2">
        {filter === 'all' && <JobsPanel filter="all" />}
      </TabsContent>
    </Tabs>
  )
}
