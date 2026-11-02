import { BanIcon, BadgeCheckIcon, XCircleIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { AuthDocument } from '@/components/common/AuthDocument'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { ReasonDialog } from '@/components/common/ReasonDialog'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { actOnWorker } from '@/features/admin/store/adminSlice'
import type { AdminWorker, WorkerAction } from '@/features/admin/types/admin.types'
import { toApiError } from '@/lib/apiError'
import { useAppDispatch } from '@/store/hooks'
import { formatDate, formatDateTime } from '@/utils/format'

interface WorkerReviewSheetProps {
  worker: AdminWorker | null
  onOpenChange: (open: boolean) => void
}

const DONE_MESSAGE: Record<WorkerAction, string> = {
  verify: 'verified',
  reject: 'rejected',
  suspend: 'suspended',
}

const INCOMPLETE_HINT = 'The worker needs at least one category and an ID document before they can be verified.'

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  )
}

/** Worker application details, ID document preview and verify / reject / suspend actions. */
export function WorkerReviewSheet({ worker, onOpenChange }: WorkerReviewSheetProps) {
  const dispatch = useAppDispatch()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async (action: WorkerAction, reason?: string) => {
    if (!worker) return
    await dispatch(actOnWorker({ id: worker.id, action, reason })).unwrap()
    toast.success(`${worker.name} ${DONE_MESSAGE[action]}`)
    onOpenChange(false)
  }

  const verify = async () => {
    setBusy(true)
    setError(null)
    try {
      await run('verify')
    } catch (err) {
      const apiError = toApiError(err)
      setError(apiError.code === 'WORKER_INCOMPLETE' ? INCOMPLETE_HINT : apiError.message)
    } finally {
      setBusy(false)
    }
  }

  const status = worker?.verificationStatus

  return (
    <Sheet
      open={worker !== null}
      onOpenChange={(open) => {
        if (!open) setError(null)
        onOpenChange(open)
      }}
    >
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {worker && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                {worker.name}
                <StatusBadge kind="worker" status={worker.verificationStatus} />
              </SheetTitle>
              <SheetDescription>Applied on {formatDate(worker.createdAt)}</SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-5 px-4">
              <ErrorAlert title="Action failed" message={error} />
              <dl className="grid grid-cols-2 gap-4">
                <Detail label="Email">{worker.email}</Detail>
                <Detail label="Phone">{worker.phone ?? '—'}</Detail>
                <Detail label="State">{worker.state}</Detail>
                <Detail label="GSTIN">{worker.gstin ?? 'Not registered'}</Detail>
                <Detail label="Service radius">{worker.serviceRadiusKm} km</Detail>
                <Detail label="Base location">
                  {worker.baseLat.toFixed(4)}, {worker.baseLng.toFixed(4)}
                </Detail>
                <Detail label="Available">{worker.isAvailable ? 'Yes' : 'No'}</Detail>
                <Detail label="Verified at">{formatDateTime(worker.verifiedAt)}</Detail>
              </dl>
              {worker.bio && (
                <div className="flex flex-col gap-1">
                  <h2 className="text-sm font-medium">Bio</h2>
                  <p className="text-sm whitespace-pre-line text-muted-foreground">{worker.bio}</p>
                </div>
              )}
              <Separator />
              <div className="flex flex-col gap-2">
                <h2 className="text-sm font-medium">Categories</h2>
                {worker.categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No categories selected.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {worker.categories.map((c) => (
                      <Badge key={c.id} variant="secondary">
                        {c.name} · {c.yearsExperience} yr
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                <h2 className="text-sm font-medium">ID document</h2>
                {worker.idDocumentUrl ? (
                  <AuthDocument src={worker.idDocumentUrl} title={`ID document of ${worker.name}`} />
                ) : (
                  <p className="text-sm text-muted-foreground">No ID document uploaded.</p>
                )}
              </div>
            </div>

            <SheetFooter className="flex-row flex-wrap justify-end">
              {status === 'PENDING' && (
                <ReasonDialog
                  title={`Reject ${worker.name}?`}
                  description="The worker sees this reason and can update their application."
                  confirmLabel="Reject worker"
                  destructive
                  trigger={<Button variant="outline" />}
                  triggerLabel={
                    <>
                      <XCircleIcon />
                      Reject
                    </>
                  }
                  onSubmit={(reason) => run('reject', reason).catch((err: unknown) => Promise.reject(toApiError(err)))}
                />
              )}
              {status === 'VERIFIED' && (
                <ReasonDialog
                  title={`Suspend ${worker.name}?`}
                  description="Suspended workers stop receiving leads until they are verified again."
                  confirmLabel="Suspend worker"
                  destructive
                  trigger={<Button variant="destructive" />}
                  triggerLabel={
                    <>
                      <BanIcon />
                      Suspend
                    </>
                  }
                  onSubmit={(reason) => run('suspend', reason).catch((err: unknown) => Promise.reject(toApiError(err)))}
                />
              )}
              {status !== 'VERIFIED' && (
                <Button onClick={() => void verify()} disabled={busy}>
                  <BadgeCheckIcon />
                  {busy ? 'Verifying…' : status === 'PENDING' ? 'Verify' : 'Verify again'}
                </Button>
              )}
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
