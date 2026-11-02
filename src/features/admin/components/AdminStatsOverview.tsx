import {
  BadgeIndianRupeeIcon,
  BriefcaseIcon,
  CheckCheckIcon,
  HandshakeIcon,
  PercentIcon,
  ReceiptIcon,
  ScaleIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { MoneyText } from '@/components/common/MoneyText'
import { StatCard } from '@/components/common/StatCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { useAdminStats } from '@/features/admin/hooks/useAdmin'

const percent = (ratio: number) => `${(ratio * 100).toFixed(1)}%`

const ROLE_LABEL: Record<string, string> = {
  SUPERADMIN: 'Superadmins',
  ADMIN: 'Admins',
  CUSTOMER: 'Customers',
  WORKER: 'Workers',
}

function CountTable({
  title,
  counts,
  renderKey,
}: {
  title: string
  counts: Record<string, number>
  renderKey: (key: string) => ReactNode
}) {
  const entries = Object.entries(counts)
  const total = entries.reduce((sum, [, n]) => sum + n, 0)
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          {title}
          <span className="text-sm font-normal text-muted-foreground tabular-nums">{total} total</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        ) : (
          <Table aria-label={title}>
            <TableBody>
              {entries.map(([key, n]) => (
                <TableRow key={key}>
                  <TableCell>{renderKey(key)}</TableCell>
                  <TableCell className="text-right tabular-nums">{n}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

/** Platform metrics: money, jobs, rates and counts by status. */
export function AdminStatsOverview() {
  const { value: stats, loading, error, reload } = useAdminStats()
  const isLoading = loading && !stats

  return (
    <div className="flex flex-col gap-6">
      <ErrorAlert
        title="Could not load stats"
        message={error?.message}
        action={
          <Button size="sm" variant="outline" onClick={reload}>
            Retry
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="GMV"
          icon={<BadgeIndianRupeeIcon />}
          loading={isLoading}
          value={stats ? <MoneyText paise={stats.money.gmvPaise} /> : '—'}
          hint="Total of paid invoices"
        />
        <StatCard
          label="Commission"
          icon={<ReceiptIcon />}
          loading={isLoading}
          value={stats ? <MoneyText paise={stats.money.commissionPaise} /> : '—'}
          hint={stats ? <>+ <MoneyText paise={stats.money.commissionGstPaise} /> GST on commission</> : undefined}
        />
        <StatCard
          label="Paid invoices"
          icon={<CheckCheckIcon />}
          loading={isLoading}
          value={stats?.money.paidInvoices ?? '—'}
        />
        <StatCard
          label="Jobs"
          icon={<BriefcaseIcon />}
          loading={isLoading}
          value={stats ? `${stats.jobs.completed} / ${stats.jobs.total}` : '—'}
          hint="Completed / total"
        />
        <StatCard
          label="Acceptance rate"
          icon={<HandshakeIcon />}
          loading={isLoading}
          value={stats ? percent(stats.rates.acceptance) : '—'}
          hint="Requests with an accepted quote"
        />
        <StatCard
          label="Completion rate"
          icon={<PercentIcon />}
          loading={isLoading}
          value={stats ? percent(stats.rates.completion) : '—'}
          hint="Jobs completed"
        />
        <StatCard
          label="Dispute rate"
          icon={<ScaleIcon />}
          loading={isLoading}
          value={stats ? percent(stats.rates.dispute) : '—'}
          hint="Jobs disputed"
        />
      </div>
      {stats && (
        <div className="grid gap-4 lg:grid-cols-3">
          <CountTable
            title="Users"
            counts={stats.users}
            renderKey={(role) => <Badge variant="outline">{ROLE_LABEL[role] ?? role}</Badge>}
          />
          <CountTable
            title="Workers"
            counts={stats.workers}
            renderKey={(status) => <StatusBadge kind="worker" status={status} />}
          />
          <CountTable
            title="Requests"
            counts={stats.requests}
            renderKey={(status) => <StatusBadge status={status} />}
          />
        </div>
      )}
    </div>
  )
}
