import { Building2Icon, PlusIcon } from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/common/EmptyState'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { buildPath, PATHS } from '@/constants/paths'
import { useProperties } from '@/features/properties/hooks/useProperties'

/** Dashboard card listing the user's properties. */
export function PropertySummary() {
  const { items, loading } = useProperties()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Properties</CardTitle>
        <CardDescription>
          {loading ? 'Loading…' : `${items.length} propert${items.length === 1 ? 'y' : 'ies'}`}
        </CardDescription>
        <CardAction>
          <Link to={PATHS.CUSTOMER_PROPERTY_NEW} className={buttonVariants({ size: 'sm', variant: 'outline' })}>
            <PlusIcon />
            Add
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-16 w-full" />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Building2Icon />}
            title="No properties yet"
            description="Add a property, or accept an invitation from your landlord."
          />
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {items.slice(0, 6).map((p) => (
              <li key={p.id}>
                <Link
                  to={buildPath(PATHS.CUSTOMER_PROPERTY_DETAIL, { id: p.id })}
                  className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{p.label}</span>
                    <span className="truncate text-xs text-muted-foreground">{p.city}</span>
                  </span>
                  <Badge variant={p.relation === 'OWNER' ? 'default' : 'secondary'}>
                    {p.relation === 'OWNER' ? 'Owner' : 'Tenant'}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
