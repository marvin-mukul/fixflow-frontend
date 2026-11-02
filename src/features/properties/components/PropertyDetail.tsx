import { PencilIcon, Trash2Icon, UserRoundXIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { PropertyMap } from '@/components/common/map/PropertyMap'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { buildPath, PATHS } from '@/constants/paths'
import { InviteTenantDialog } from '@/features/properties/components/InviteTenantDialog'
import { usePropertyDetail } from '@/features/properties/hooks/useProperties'
import { deleteProperty, endTenancy } from '@/features/properties/store/propertiesSlice'
import {
  PROPERTY_TYPE_LABELS,
  type PropertyTenant,
} from '@/features/properties/types/property.types'
import { toApiError } from '@/lib/apiError'
import { useAppDispatch } from '@/store/hooks'
import { formatDate } from '@/utils/format'

const TENANCY_LABEL: Record<PropertyTenant['status'], string> = {
  INVITED: 'Invited',
  ACTIVE: 'Active',
  ENDED: 'Ended',
}

interface PropertyDetailProps {
  id: string
  /** Extra header actions supplied by the page (e.g. "Raise request"). */
  actions?: ReactNode
}

export function PropertyDetail({ id, actions }: PropertyDetailProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { property, loading, error } = usePropertyDetail(id)
  const [ending, setEnding] = useState<PropertyTenant | null>(null)

  if (loading) return <Loader />
  if (!property) {
    return (
      <EmptyState
        title="Property not found"
        description={error?.message ?? 'It may have been removed.'}
        action={
          <Link to={PATHS.CUSTOMER_PROPERTIES} className={buttonVariants({ variant: 'outline' })}>
            Back to properties
          </Link>
        }
      />
    )
  }

  const isOwner = property.relation === 'OWNER'

  const remove = async () => {
    try {
      await dispatch(deleteProperty(property.id)).unwrap()
      toast.success('Property deleted')
      navigate(PATHS.CUSTOMER_PROPERTIES, { replace: true })
    } catch (err) {
      toast.error('Could not delete the property', { description: toApiError(err).message })
    }
  }

  const confirmEndTenancy = async () => {
    if (!ending) return
    try {
      await dispatch(endTenancy({ propertyId: property.id, tenancyId: ending.tenancyId })).unwrap()
      toast.success(`Tenancy for ${ending.name} ended`)
    } catch (err) {
      toast.error('Could not end the tenancy', { description: toApiError(err).message })
    }
  }

  const tenantColumns: DataTableColumn<PropertyTenant>[] = [
    {
      id: 'name',
      header: 'Tenant',
      cell: (t) => (
        <div className="flex flex-col">
          <span className="font-medium">{t.name}</span>
          <span className="text-xs text-muted-foreground">{t.email}</span>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (t) => (
        <Badge variant={t.status === 'ACTIVE' ? 'default' : 'outline'}>{TENANCY_LABEL[t.status]}</Badge>
      ),
    },
    {
      id: 'since',
      header: 'Since',
      cell: (t) => (t.endDate ? `${formatDate(t.startDate)} – ${formatDate(t.endDate)}` : formatDate(t.startDate)),
      className: 'hidden sm:table-cell',
    },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'text-right',
      cell: (t) =>
        t.status !== 'ENDED' ? (
          <Button variant="ghost" size="sm" onClick={() => setEnding(t)}>
            <UserRoundXIcon />
            End tenancy
          </Button>
        ) : null,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={property.label}
        description={`${PROPERTY_TYPE_LABELS[property.type]} · ${property.city}, ${property.state}`}
        actions={
          <>
            {actions}
            {isOwner && (
              <>
                <InviteTenantDialog propertyId={property.id} />
                <Link
                  to={buildPath(PATHS.CUSTOMER_PROPERTY_EDIT, { id: property.id })}
                  className={buttonVariants({ variant: 'outline' })}
                >
                  <PencilIcon />
                  Edit
                </Link>
                <ConfirmDialog
                  title="Delete this property?"
                  description="This cannot be undone. Properties with open requests cannot be deleted."
                  confirmLabel="Delete"
                  destructive
                  onConfirm={() => void remove()}
                  trigger={
                    <Button variant="destructive" aria-label="Delete property">
                      <Trash2Icon />
                    </Button>
                  }
                />
              </>
            )}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
            <CardDescription>
              You are the {isOwner ? 'owner' : 'tenant'}
              {!isOwner && property.ownerName ? ` · owner: ${property.ownerName}` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <address className="not-italic">
              {property.addressLine1}
              {property.addressLine2 && <>, {property.addressLine2}</>}
              <br />
              {property.city}, {property.state} {property.pincode}
            </address>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{property.isOwnerOccupied ? 'Owner occupied' : 'Rented out'}</Badge>
              {property.autoApproveEmergency && (
                <Badge variant="outline">Emergencies auto-approved</Badge>
              )}
            </div>
          </CardContent>
        </Card>
        <PropertyMap location={{ lat: property.lat, lng: property.lng }} label={property.label} />
      </div>

      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Tenants</CardTitle>
            <CardDescription>People who can raise requests for this property.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <DataTable
              caption="Tenants"
              columns={tenantColumns}
              rows={property.tenants}
              getRowId={(t) => t.tenancyId}
              empty={<p className="text-sm text-muted-foreground">No tenants yet.</p>}
            />
            {property.pendingInvitations.length > 0 && (
              <div className="flex flex-col gap-2">
                <h2 className="text-sm font-medium">Pending invitations</h2>
                <ul className="flex flex-col gap-1 text-sm">
                  {property.pendingInvitations.map((inv) => (
                    <li key={inv.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                      <span>{inv.email}</span>
                      <span className="text-xs text-muted-foreground">
                        expires {formatDate(inv.expiresAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={ending !== null}
        onOpenChange={(open) => !open && setEnding(null)}
        title="End this tenancy?"
        description={ending ? `${ending.name} will no longer be able to raise requests for ${property.label}.` : undefined}
        confirmLabel="End tenancy"
        destructive
        onConfirm={() => void confirmEndTenancy()}
      />
    </div>
  )
}
