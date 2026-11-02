import { TagsIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { DataTable, type DataTableColumn } from '@/components/common/DataTable'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { Switch } from '@/components/ui/switch'
import { CategoryFormDialog } from '@/features/admin/components/CategoryFormDialog'
import { useAdminCategories } from '@/features/admin/hooks/useAdmin'
import { updateCategory } from '@/features/admin/store/adminSlice'
import type { AdminCategory } from '@/features/admin/types/admin.types'
import { toApiError } from '@/lib/apiError'
import { useAppDispatch } from '@/store/hooks'

/** All categories (incl. inactive) with create, edit and an active toggle. */
export function CategoryManager() {
  const dispatch = useAppDispatch()
  const { items, loading, error, reload } = useAdminCategories()
  const [toggling, setToggling] = useState<string | null>(null)

  const toggle = async (category: AdminCategory, isActive: boolean) => {
    setToggling(category.id)
    try {
      await dispatch(updateCategory({ id: category.id, payload: { isActive } })).unwrap()
      toast.success(`${category.name} ${isActive ? 'activated' : 'deactivated'}`)
    } catch (err) {
      toast.error(toApiError(err).message)
    } finally {
      setToggling(null)
    }
  }

  const columns: DataTableColumn<AdminCategory>[] = [
    { id: 'name', header: 'Name', cell: (c) => <span className="font-medium">{c.name}</span> },
    { id: 'slug', header: 'Slug', cell: (c) => <code className="text-xs">{c.slug}</code> },
    { id: 'icon', header: 'Icon', className: 'hidden sm:table-cell', cell: (c) => c.icon },
    {
      id: 'active',
      header: 'Active',
      cell: (c) => (
        <Switch
          checked={c.isActive}
          disabled={toggling === c.id}
          aria-label={`${c.name} active`}
          onCheckedChange={(checked) => void toggle(c, checked)}
        />
      ),
    },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      className: 'text-right',
      cell: (c) => <CategoryFormDialog category={c} />,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <CategoryFormDialog />
      </div>
      <ErrorAlert title="Could not load categories" message={error?.message} onRetry={reload} />
      <DataTable
        caption="Categories"
        columns={columns}
        rows={items}
        getRowId={(c) => c.id}
        loading={loading}
        failed={!!error}
        empty={
          <EmptyState
            icon={<TagsIcon />}
            title="No categories yet"
            className="rounded-xl border border-dashed"
          />
        }
      />
    </div>
  )
}
