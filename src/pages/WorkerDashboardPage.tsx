import { Link } from 'react-router'
import { PageHeader } from '@/components/common/PageHeader'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PATHS } from '@/constants/paths'
import { MyQuotes } from '@/features/quotes/components/MyQuotes'
import { WorkerOverview } from '@/features/worker/components/WorkerOverview'

export default function WorkerDashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Leads, quotes and jobs at a glance." />
      <WorkerOverview />
      <Card>
        <CardHeader>
          <CardTitle>Recent quotes</CardTitle>
          <CardAction>
            <Link to={PATHS.WORKER_LEADS} className={buttonVariants({ size: 'sm' })}>
              Find leads
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <MyQuotes limit={5} />
        </CardContent>
      </Card>
    </>
  )
}
