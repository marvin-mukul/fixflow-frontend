import { RadarIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { LeadsMap } from '@/components/common/map/LeadsMap'
import { PriorityBadge } from '@/components/common/PriorityBadge'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { buildPath, PATHS } from '@/constants/paths'
import { useLeads, useWorkerProfile } from '@/features/worker/hooks/useWorker'
import type { LeadFilter } from '@/features/worker/store/workerSlice'
import type { Lead } from '@/features/worker/types/worker.types'
import { formatDateTime, formatKm } from '@/utils/format'

const COLUMNS: DataTableColumn<Lead>[] = [
  {
    id: 'title',
    header: 'Lead',
    cell: (l) => (
      <div className="flex flex-col">
        <span className="font-medium">{l.title}</span>
        <span className="text-xs text-muted-foreground">{l.category.name}</span>
      </div>
    ),
  },
  {
    id: 'locality',
    header: 'Area',
    cell: (l) => (
      <div className="flex flex-col">
        <span>
          {l.locality.city} {l.locality.pincode}
        </span>
        <span className="text-xs text-muted-foreground">~{formatKm(l.approxDistanceKm)}</span>
      </div>
    ),
  },
  { id: 'priority', header: 'Priority', cell: (l) => <PriorityBadge priority={l.priority} /> },
  {
    id: 'deadline',
    header: 'Quotes close',
    cell: (l) => <span className="text-muted-foreground">{formatDateTime(l.quoteDeadline)}</span>,
    className: 'hidden md:table-cell',
  },
  {
    id: 'myQuote',
    header: 'My quote',
    cell: (l) =>
      l.myQuote ? (
        <StatusBadge kind="quote" status={l.myQuote.status} />
      ) : l.canQuote ? (
        <span className="text-xs text-muted-foreground">Not quoted</span>
      ) : (
        <StatusBadge status={l.status} />
      ),
  },
]

function LeadsPanel({ filter }: { filter: LeadFilter }) {
  const navigate = useNavigate()
  const { profile } = useWorkerProfile()
  const { items, loading, error, hasMore, loadMore, reload } = useLeads(filter)
  const open = (requestId: string) => navigate(buildPath(PATHS.WORKER_LEAD_DETAIL, { requestId }))

  return (
    <div className="flex flex-col gap-4">
      <ErrorAlert title="Could not load leads" message={error?.message} onRetry={reload} />
      <LeadsMap
        center={profile ? { lat: profile.baseLat, lng: profile.baseLng } : null}
        radiusKm={profile?.serviceRadiusKm}
        leads={items.map((l) => ({ id: l.requestId, title: l.title, ...l.location }))}
        onSelect={open}
      />
      <DataTable
        caption="Leads"
        columns={COLUMNS}
        rows={items}
        getRowId={(l) => l.requestId}
        loading={loading}
        failed={!!error}
        onRowClick={(l) => open(l.requestId)}
        empty={
          <EmptyState
            icon={<RadarIcon />}
            title={filter === 'open' ? 'No open leads right now' : 'No leads yet'}
            description="Requests in your categories and service radius show up here. Stay available to get matched."
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

/** Matched requests (masked) on a map and in a table, with open/all tabs. */
export function LeadsList() {
  const [filter, setFilter] = useState<LeadFilter>('open')
  return (
    <Tabs value={filter} onValueChange={(v) => setFilter(v as LeadFilter)}>
      <TabsList>
        <TabsTrigger value="open">Open</TabsTrigger>
        <TabsTrigger value="all">All</TabsTrigger>
      </TabsList>
      <TabsContent value="open" className="pt-2">
        {filter === 'open' && <LeadsPanel filter="open" />}
      </TabsContent>
      <TabsContent value="all" className="pt-2">
        {filter === 'all' && <LeadsPanel filter="all" />}
      </TabsContent>
    </Tabs>
  )
}
