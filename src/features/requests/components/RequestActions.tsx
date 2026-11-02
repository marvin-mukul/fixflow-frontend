import { BanIcon, CheckIcon, RotateCcwIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ReasonDialog } from '@/components/common/ReasonDialog'
import { Button } from '@/components/ui/button'
import { ApproveDialog } from '@/features/requests/components/ApproveDialog'
import {
  cancelRequest,
  rejectRequest,
  reopenRequest,
} from '@/features/requests/store/requestsSlice'
import type { RepairRequest } from '@/features/requests/types/request.types'
import { toApiError } from '@/lib/apiError'
import { useAppDispatch } from '@/store/hooks'

interface RequestActionsProps {
  request: RepairRequest
  /** Called after any successful transition (e.g. to refresh the timeline). */
  onChanged: () => void
}

/** Buttons driven by the API's `availableActions` for the current user. */
export function RequestActions({ request, onChanged }: RequestActionsProps) {
  const dispatch = useAppDispatch()
  const can = (action: string) => request.availableActions.includes(action)

  const done = (message: string) => {
    toast.success(message)
    onChanged()
  }

  const reopen = async () => {
    try {
      await dispatch(reopenRequest(request.id)).unwrap()
      done('Request reopened for quotes')
    } catch (err) {
      toast.error('Could not reopen', { description: toApiError(err).message })
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {can('approve') && (
        <ApproveDialog
          request={request}
          trigger={<Button />}
          triggerLabel={
            <>
              <CheckIcon />
              Approve
            </>
          }
          onApproved={() => done('Request approved')}
        />
      )}
      {can('reject') && (
        <ReasonDialog
          title="Reject this request?"
          description={`${request.raisedBy.name} will see your reason.`}
          confirmLabel="Reject request"
          destructive
          trigger={<Button variant="outline" />}
          triggerLabel={
            <>
              <XIcon />
              Reject
            </>
          }
          onSubmit={async (reason) => {
            await dispatch(rejectRequest({ id: request.id, reason })).unwrap()
            done('Request rejected')
          }}
        />
      )}
      {can('reopen') && (
        <ConfirmDialog
          title="Reopen for quotes?"
          description="Workers nearby get another chance to quote. A request can be reopened once."
          confirmLabel="Reopen"
          onConfirm={() => void reopen()}
          trigger={
            <Button variant="outline">
              <RotateCcwIcon />
              Reopen
            </Button>
          }
        />
      )}
      {can('cancel') && (
        <ReasonDialog
          title="Cancel this request?"
          description="Workers who quoted are notified. This cannot be undone."
          confirmLabel="Cancel request"
          destructive
          trigger={<Button variant="destructive" />}
          triggerLabel={
            <>
              <BanIcon />
              Cancel request
            </>
          }
          onSubmit={async (reason) => {
            await dispatch(cancelRequest({ id: request.id, reason })).unwrap()
            done('Request cancelled')
          }}
        />
      )}
    </div>
  )
}
