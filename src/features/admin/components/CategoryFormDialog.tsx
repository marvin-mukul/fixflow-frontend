import { zodResolver } from '@hookform/resolvers/zod'
import { PencilIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { FormField } from '@/components/common/FormField'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createCategory, updateCategory } from '@/features/admin/store/adminSlice'
import { categorySchema, type CategoryValues } from '@/features/admin/types/admin.schemas'
import type { AdminCategory } from '@/features/admin/types/admin.types'
import { toApiError } from '@/lib/apiError'
import { applyApiFieldErrors } from '@/lib/form'
import { useAppDispatch } from '@/store/hooks'

const FIELDS = ['slug', 'name', 'icon'] as const

/** Create a category, or edit an existing one's name and icon (the slug is fixed). */
export function CategoryFormDialog({ category }: { category?: AdminCategory }) {
  const dispatch = useAppDispatch()
  const editing = !!category
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const defaults: CategoryValues = {
    slug: category?.slug ?? '',
    name: category?.name ?? '',
    icon: category?.icon ?? 'wrench',
  }
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryValues>({ resolver: zodResolver(categorySchema), defaultValues: defaults })

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) reset(defaults)
    else setFormError(null)
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      if (category) {
        await dispatch(
          updateCategory({ id: category.id, payload: { name: values.name, icon: values.icon } }),
        ).unwrap()
        toast.success(`Category “${values.name}” updated`)
      } else {
        await dispatch(createCategory(values)).unwrap()
        toast.success(`Category “${values.name}” created`)
      }
      onOpenChange(false)
    } catch (err) {
      const error = toApiError(err)
      if (error.status === 409 && !editing) {
        setError('slug', { type: 'server', message: 'A category with this slug already exists.' })
      } else if (!applyApiFieldErrors(error, setError, FIELDS)) {
        setFormError(error.message)
      }
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {category ? (
        <DialogTrigger render={<Button size="sm" variant="ghost" aria-label={`Edit ${category.name}`} />}>
          <PencilIcon />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button />}>
          <PlusIcon />
          New category
        </DialogTrigger>
      )}
      <DialogContent>
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${category.name}` : 'New category'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'The slug cannot change once workers and requests use it.'
                : 'Workers pick categories during onboarding; customers pick one per request.'}
            </DialogDescription>
          </DialogHeader>
          <ErrorAlert title="Could not save the category" message={formError} />
          <FormField
            id="category-slug"
            label="Slug"
            placeholder="roofing"
            disabled={editing}
            error={errors.slug?.message}
            {...register('slug')}
          />
          <FormField id="category-name" label="Name" error={errors.name?.message} {...register('name')} />
          <FormField
            id="category-icon"
            label="Icon"
            description="A lucide icon name, e.g. wrench, droplet, zap."
            error={errors.icon?.message}
            {...register('icon')}
          />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : editing ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
