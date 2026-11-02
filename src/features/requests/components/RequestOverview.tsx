import { CalendarCheckIcon, ClipboardListIcon, InboxIcon, PlusIcon } from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/common/EmptyState'
import { StatCard } from '@/components/common/StatCard'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PATHS } from '@/constants/paths'
import { REQUEST_STATUS_GROUPS } from '@/constants/status'
import { RequestTable } from '@/features/requests/components/RequestTable'
import { useRequestList } from '@/features/requests/hooks/useRequests'

function countLabel(count: number, hasMore: boolean) {
  return hasMore ? `${count}+` : String(count)
}

/** Customer dashboard: request counts by group plus the most recent requests. */
export function RequestOverview() {
  const active = useRequestList({ status: REQUEST_STATUS_GROUPS.active.statuses })
  const ongoing = useRequestList({ status: REQUEST_STATUS_GROUPS.ongoing.statuses })
  const approvals = useRequestList({ scope: 'approvals' })
  const recent = useRequestList({ scope: 'all' })

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Active requests"
          icon={<ClipboardListIcon />}
          value={countLabel(active.items.length, active.hasMore)}
          hint="Awaiting approval or quotes"
          loading={active.loading}
          to={PATHS.CUSTOMER_REQUESTS}
        />
        <StatCard
          label="Scheduled & ongoing"
          icon={<CalendarCheckIcon />}
          value={countLabel(ongoing.items.length, ongoing.hasMore)}
          hint="Jobs booked with a worker"
          loading={ongoing.loading}
          to={PATHS.CUSTOMER_REQUESTS}
        />
        <StatCard
          label="Needs your approval"
          icon={<InboxIcon />}
          value={countLabel(approvals.items.length, approvals.hasMore)}
          hint="Tenant requests on your properties"
          loading={approvals.loading}
          to={PATHS.CUSTOMER_APPROVALS}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent requests</CardTitle>
          <CardAction>
            <Link to={PATHS.CUSTOMER_REQUEST_NEW} className={buttonVariants({ size: 'sm' })}>
              <PlusIcon />
              Raise request
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <RequestTable
            rows={recent.items.slice(0, 5)}
            loading={recent.loading}
            empty={
              <EmptyState
                icon={<ClipboardListIcon />}
                title="No repair requests yet"
                description="Raise one for any of your properties and nearby workers will quote."
              />
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
