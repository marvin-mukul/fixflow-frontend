import { ClipboardListIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { buttonVariants } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PATHS } from '@/constants/paths'
import { REQUEST_STATUS_GROUPS, type RequestStatusGroup } from '@/constants/status'
import { RequestTable } from '@/features/requests/components/RequestTable'
import { useRequestList } from '@/features/requests/hooks/useRequests'

type Tab = RequestStatusGroup | 'all'
const TABS: { value: Tab; label: string }[] = [
  ...(Object.keys(REQUEST_STATUS_GROUPS) as RequestStatusGroup[]).map((value) => ({
    value,
    label: REQUEST_STATUS_GROUPS[value].label,
  })),
  { value: 'all', label: 'All' },
]

function TabPanel({ tab }: { tab: Tab }) {
  const { items, loading, error, hasMore, loadMore, reload } = useRequestList({
    scope: 'all',
    status: tab === 'all' ? undefined : REQUEST_STATUS_GROUPS[tab].statuses,
  })
  return (
    <div className="flex flex-col gap-3">
      <ErrorAlert title="Could not load requests" message={error?.message} onRetry={reload} />
      <RequestTable
        rows={items}
        loading={loading}
        failed={!!error}
        hasMore={hasMore}
        onLoadMore={loadMore}
        empty={
          <EmptyState
            icon={<ClipboardListIcon />}
            title="Nothing here"
            description="Requests you raise, pay for, or that concern your properties show up here."
            className="rounded-xl border border-dashed"
            action={
              <Link to={PATHS.CUSTOMER_REQUEST_NEW} className={buttonVariants()}>
                <PlusIcon />
                Raise a request
              </Link>
            }
          />
        }
      />
    </div>
  )
}

/** Requests grouped into status tabs. */
export function RequestList() {
  const [tab, setTab] = useState<Tab>('active')
  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
      <TabsList>
        {TABS.map((t) => (
          <TabsTrigger key={t.value} value={t.value}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {TABS.map((t) => (
        <TabsContent key={t.value} value={t.value} className="pt-2">
          {tab === t.value && <TabPanel tab={t.value} />}
        </TabsContent>
      ))}
    </Tabs>
  )
}
