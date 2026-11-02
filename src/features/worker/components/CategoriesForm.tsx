import { useState } from 'react'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { Loader } from '@/components/common/Loader'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useCategories } from '@/hooks/useCategories'
import { saveWorkerCategories } from '@/features/worker/store/workerSlice'
import type { WorkerProfile } from '@/features/worker/types/worker.types'
import { toApiError } from '@/lib/apiError'
import { useAppDispatch } from '@/store/hooks'

const MAX_CATEGORIES = 7

interface CategoriesFormProps {
  profile: WorkerProfile
  onSaved: (profile: WorkerProfile) => void
  submitLabel?: string
}

/** Trades the worker offers, with years of experience each (`PUT /worker/categories`). */
export function CategoriesForm({ profile, onSaved, submitLabel = 'Save categories' }: CategoriesFormProps) {
  const dispatch = useAppDispatch()
  const categories = useCategories()
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(profile.categories.map((c) => [c.id, String(c.yearsExperience)])),
  )
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const count = Object.keys(selected).length

  const toggle = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = { ...prev }
      if (checked) next[id] = next[id] ?? '1'
      else delete next[id]
      return next
    })
  }

  const save = async () => {
    setError(null)
    if (count === 0) {
      setError('Pick at least one category.')
      return
    }
    const entries = Object.entries(selected).map(([categoryId, years]) => ({
      categoryId,
      yearsExperience: Number(years),
    }))
    if (entries.some((e) => !Number.isInteger(e.yearsExperience) || e.yearsExperience < 0 || e.yearsExperience > 60)) {
      setError('Years of experience must be a whole number between 0 and 60.')
      return
    }
    setSaving(true)
    try {
      onSaved(await dispatch(saveWorkerCategories({ categories: entries })).unwrap())
    } catch (err) {
      setError(toApiError(err).message)
    } finally {
      setSaving(false)
    }
  }

  if (categories.loading) return <Loader />

  return (
    <FieldGroup>
      <ErrorAlert title="Could not save categories" message={error ?? categories.error?.message} />
      <FieldDescription>
        Pick up to {MAX_CATEGORIES}. You only get leads in these categories.
      </FieldDescription>
      <ul className="grid gap-2 sm:grid-cols-2">
        {categories.items.map((category) => {
          const checked = category.id in selected
          const id = `category-${category.id}`
          return (
            <li key={category.id} className="flex items-center gap-3 rounded-lg border px-3 py-2">
              <Checkbox
                id={id}
                checked={checked}
                disabled={!checked && count >= MAX_CATEGORIES}
                onCheckedChange={(value) => toggle(category.id, value)}
              />
              <FieldLabel htmlFor={id} className="flex-1">
                {category.name}
              </FieldLabel>
              {checked && (
                <Input
                  aria-label={`Years of experience in ${category.name}`}
                  className="w-20"
                  type="number"
                  min={0}
                  max={60}
                  value={selected[category.id]}
                  onChange={(e) => setSelected((prev) => ({ ...prev, [category.id]: e.target.value }))}
                />
              )}
            </li>
          )
        })}
      </ul>
      <div className="flex justify-end">
        <Button disabled={saving} onClick={() => void save()}>
          {saving ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </FieldGroup>
  )
}
