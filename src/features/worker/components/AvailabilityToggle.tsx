import { useState } from 'react'
import { toast } from 'sonner'
import { SwitchField } from '@/components/common/SwitchField'
import { setWorkerAvailability } from '@/features/worker/store/workerSlice'
import type { WorkerProfile } from '@/features/worker/types/worker.types'
import { toApiError } from '@/lib/apiError'
import { useAppDispatch } from '@/store/hooks'

/** On/off switch for receiving new leads (`PATCH /worker/availability`). */
export function AvailabilityToggle({ profile }: { profile: WorkerProfile }) {
  const dispatch = useAppDispatch()
  const [busy, setBusy] = useState(false)

  const change = async (isAvailable: boolean) => {
    setBusy(true)
    try {
      await dispatch(setWorkerAvailability(isAvailable)).unwrap()
      toast.success(isAvailable ? 'You are available for new leads' : 'New leads paused')
    } catch (err) {
      toast.error('Could not update availability', { description: toApiError(err).message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <SwitchField
      id="availability"
      label="Available for new leads"
      description={
        profile.isAvailable
          ? 'Matching requests within your radius reach you.'
          : 'You will not be matched to new requests.'
      }
      checked={profile.isAvailable}
      disabled={busy}
      onCheckedChange={(checked) => void change(checked)}
    />
  )
}
