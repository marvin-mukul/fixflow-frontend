import { createAsyncThunk } from '@reduxjs/toolkit'
import { toApiError } from '@/lib/apiError'
import type { ApiError } from '@/types/api'

/**
 * `createAsyncThunk` that normalises any thrown error into an `ApiError`
 * via `rejectWithValue`, so reducers and `unwrap()` callers see one shape.
 */
export function createApiThunk<Returned, Arg = void>(
  type: string,
  run: (arg: Arg) => Promise<Returned>,
) {
  return createAsyncThunk<Returned, Arg, { rejectValue: ApiError }>(
    type,
    async (arg, { rejectWithValue }) => {
      try {
        return await run(arg)
      } catch (error) {
        return rejectWithValue(toApiError(error))
      }
    },
  )
}
