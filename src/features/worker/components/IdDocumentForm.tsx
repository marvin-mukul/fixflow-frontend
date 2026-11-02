import { BadgeCheckIcon } from 'lucide-react'
import { useState } from 'react'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { FileUploader } from '@/components/common/FileUploader'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { DOCUMENT_MIME_TYPES } from '@/constants/uploads'
import { uploadIdDocument } from '@/features/worker/store/workerSlice'
import type { WorkerProfile } from '@/features/worker/types/worker.types'
import { toApiError } from '@/lib/apiError'
import { useAppDispatch } from '@/store/hooks'

interface IdDocumentFormProps {
  profile: WorkerProfile
  onSaved: (profile: WorkerProfile) => void
  submitLabel?: string
}

/** Government ID upload for admin verification (`POST /worker/id-document`). */
export function IdDocumentForm({ profile, onSaved, submitLabel = 'Upload document' }: IdDocumentFormProps) {
  const dispatch = useAppDispatch()
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const upload = async () => {
    const file = files[0]
    if (!file) {
      setError('Choose a file first.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      onSaved(await dispatch(uploadIdDocument(file)).unwrap())
      setFiles([])
    } catch (err) {
      setError(toApiError(err).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <FieldGroup>
      {profile.hasIdDocument && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <BadgeCheckIcon className="size-4 text-emerald-600" />
          A document is on file. Uploading again replaces it.
        </p>
      )}
      <ErrorAlert title="Upload failed" message={error} />
      <FileUploader
        files={files}
        onChange={setFiles}
        maxFiles={1}
        accept={DOCUMENT_MIME_TYPES}
        label="Drop your Aadhaar / PAN / licence here or click to browse"
        disabled={busy}
      />
      <div className="flex justify-end">
        <Button disabled={busy || files.length === 0} onClick={() => void upload()}>
          {busy ? 'Uploading…' : submitLabel}
        </Button>
      </div>
    </FieldGroup>
  )
}
