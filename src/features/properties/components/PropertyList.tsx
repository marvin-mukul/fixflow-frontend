import { Building2Icon, PlusIcon } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { buildPath, PATHS } from '@/constants/paths'
import { useProperties } from '@/features/properties/hooks/useProperties'
import { PROPERTY_TYPE_LABELS, type Property } from '@/features/properties/types/property.types'

const COLUMNS: DataTableColumn<Property>[] = [
  {
    id: 'label',
    header: 'Property',
    cell: (p) => (
      <div className="flex flex-col">
        <span className="font-medium">{p.label}</span>
        <span className="text-xs text-muted-foreground">{PROPERTY_TYPE_LABELS[p.type]}</span>
      </div>
    ),
  },
  {
    id: 'address',
    header: 'Address',
    cell: (p) => (
      <span className="text-muted-foreground">
        {p.addressLine1}, {p.city} {p.pincode}
      </span>
    ),
    className: 'hidden md:table-cell',
  },
  {
    id: 'relation',
    header: 'You are',
    cell: (p) => (
      <Badge variant={p.relation === 'OWNER' ? 'default' : 'secondary'}>
        {p.relation === 'OWNER' ? 'Owner' : 'Tenant'}
      </Badge>
    ),
  },
]

export function PropertyList() {
  const { items, loading, error, refresh } = useProperties()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-4">
      <ErrorAlert title="Could not load properties" message={error?.message} onRetry={() => void refresh()} />
      <DataTable
        caption="Properties"
        columns={COLUMNS}
        rows={items}
        getRowId={(p) => p.id}
        loading={loading}
        failed={!!error}
        onRowClick={(p) => navigate(buildPath(PATHS.CUSTOMER_PROPERTY_DETAIL, { id: p.id }))}
        empty={
          <EmptyState
            icon={<Building2Icon />}
            title="No properties yet"
            description="Add your home or rental to start raising repair requests. Tenants join through an invite from the owner."
            className="rounded-xl border border-dashed"
            action={
              <Link to={PATHS.CUSTOMER_PROPERTY_NEW} className={buttonVariants()}>
                <PlusIcon />
                Add property
              </Link>
            }
          />
        }
      />
    </div>
  )
}
