import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import type { ApiError } from '@/types/api'

/**
 * Maps 422 `VALIDATION_ERROR` details (paths like `body.email`) onto form fields.
 * Returns true when at least one detail was mapped to a known field.
 */
export function applyApiFieldErrors<T extends FieldValues>(
  error: ApiError,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): boolean {
  if (error.status !== 422) return false
  let mapped = false
  for (const detail of error.details) {
    const field = detail.path.replace(/^body\./, '') as Path<T>
    if (fields.includes(field)) {
      setError(field, { type: 'server', message: detail.message })
      mapped = true
    }
  }
  return mapped
}
