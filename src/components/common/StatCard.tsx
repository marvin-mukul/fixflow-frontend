import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface StatCardProps {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon?: ReactNode
  to?: string
  loading?: boolean
}

/** Dashboard metric tile (shadcn `dashboard-01` section card, simplified). */
export function StatCard({ label, value, hint, icon, to, loading }: StatCardProps) {
  const card = (
    <Card size="sm" className="h-full transition-colors hover:bg-muted/40">
      <CardHeader>
        <CardDescription className="flex items-center gap-2 [&_svg]:size-4">
          {icon}
          {label}
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums">
          {loading ? <Skeleton className="h-7 w-12" /> : value}
        </CardTitle>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardHeader>
    </Card>
  )
  return to ? (
    <Link to={to} className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      {card}
    </Link>
  ) : (
    card
  )
}
