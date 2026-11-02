import { useState, type ReactElement, type ReactNode } from 'react'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { SwitchField } from '@/components/common/SwitchField'
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
import { approveRequest } from '@/features/requests/store/requestsSlice'
import type { RepairRequest } from '@/features/requests/types/request.types'
import { toApiError } from '@/lib/apiError'
import { useAppDispatch } from '@/store/hooks'

interface ApproveDialogProps {
  request: Pick<RepairRequest, 'id' | 'title' | 'raisedBy'>
  trigger: ReactElement
  triggerLabel: ReactNode
  onApproved?: (request: RepairRequest) => void
}

/** Owner approves a tenant's request, optionally making the tenant the payer. */
export function ApproveDialog({ request, trigger, triggerLabel, onApproved }: ApproveDialogProps) {
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const [tenantPays, setTenantPays] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setTenantPays(false)
      setError(null)
    }
  }

  const approve = async () => {
    setBusy(true)
    setError(null)
    try {
      const updated = await dispatch(approveRequest({ id: request.id, tenantPays })).unwrap()
      onOpenChange(false)
      onApproved?.(updated)
    } catch (err) {
      setError(toApiError(err).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger}>{triggerLabel}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve “{request.title}”?</DialogTitle>
          <DialogDescription>
            Nearby workers will be able to quote once you approve.
          </DialogDescription>
        </DialogHeader>
        <ErrorAlert title="Could not approve" message={error} />
        <SwitchField
          id={`tenant-pays-${request.id}`}
          label="Tenant pays"
          description={`${request.raisedBy.name} accepts quotes and pays for this job.`}
          checked={tenantPays}
          onCheckedChange={setTenantPays}
        />
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Back</DialogClose>
          <Button disabled={busy} onClick={() => void approve()}>
            {busy ? 'Approving…' : 'Approve'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
