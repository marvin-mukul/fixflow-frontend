import { ShieldIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreateAdminDialog } from '@/features/admin/components/CreateAdminDialog'
import { useAdmins } from '@/features/admin/hooks/useAdmin'
import { removeAdmin } from '@/features/admin/store/adminSlice'
import type { AdminUser } from '@/features/admin/types/admin.types'
import { toApiError } from '@/lib/apiError'
import { useAppDispatch } from '@/store/hooks'
import { formatDate, formatDateTime } from '@/utils/format'

interface AdminListProps {
  /** The signed-in superadmin; they cannot remove themselves. */
  currentUserId: string
}

/** Superadmin: admins table with create and remove. */
export function AdminList({ currentUserId }: AdminListProps) {
  const dispatch = useAppDispatch()
  const { items, loading, error, reload } = useAdmins()

  const remove = async (admin: AdminUser) => {
    try {
      await dispatch(removeAdmin(admin.id)).unwrap()
      toast.success(`${admin.name} removed`)
    } catch (err) {
      toast.error(toApiError(err).message)
    }
  }

  const columns: DataTableColumn<AdminUser>[] = [
    {
      id: 'name',
      header: 'Admin',
      cell: (a) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {a.name}
            {a.id === currentUserId && <span className="text-muted-foreground"> (you)</span>}
          </span>
          <span className="text-xs text-muted-foreground">{a.email}</span>
        </div>
      ),
    },
    {
      id: 'role',
      header: 'Role',
      cell: (a) => (
        <Badge variant={a.globalRole === 'SUPERADMIN' ? 'default' : 'secondary'}>
          {a.globalRole === 'SUPERADMIN' ? 'Superadmin' : 'Admin'}
        </Badge>
      ),
    },
    {
      id: 'password',
      header: 'Password',
      className: 'hidden md:table-cell',
      cell: (a) =>
        a.mustChangePassword ? <Badge variant="outline">Must change</Badge> : <span className="text-muted-foreground">Set</span>,
    },
    { id: 'login', header: 'Last login', className: 'hidden md:table-cell', cell: (a) => formatDateTime(a.lastLoginAt) },
    { id: 'created', header: 'Added', className: 'hidden sm:table-cell', cell: (a) => formatDate(a.createdAt) },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'text-right',
      cell: (a) =>
        a.id === currentUserId || a.globalRole === 'SUPERADMIN' ? null : (
          <ConfirmDialog
            title={`Remove ${a.name}?`}
            description="They lose admin access immediately."
            confirmLabel="Remove"
            destructive
            onConfirm={() => void remove(a)}
            trigger={
              <Button size="sm" variant="ghost" aria-label={`Remove ${a.name}`}>
                <Trash2Icon />
              </Button>
            }
          />
        ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <CreateAdminDialog />
      </div>
      <ErrorAlert title="Could not load admins" message={error?.message} onRetry={reload} />
      <DataTable
        caption="Admins"
        columns={columns}
        rows={items}
        getRowId={(a) => a.id}
        loading={loading}
        failed={!!error}
        empty={<EmptyState icon={<ShieldIcon />} title="No admins yet" className="rounded-xl border border-dashed" />}
      />
    </div>
  )
}
