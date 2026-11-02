import { FileIcon, ImagePlusIcon, XIcon } from 'lucide-react'
import { useId, useRef, useState, type DragEvent } from 'react'
import { Button } from '@/components/ui/button'
import { IMAGE_MIME_TYPES, MAX_UPLOAD_BYTES } from '@/constants/uploads'
import { FieldDescription, FieldError } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { formatBytes } from '@/utils/format'


const previewUrls = new WeakMap<File, string>()

function previewUrl(file: File): string | null {
  if (!file.type.startsWith('image/') || typeof URL.createObjectURL !== 'function') return null
  let url = previewUrls.get(file)
  if (!url) {
    url = URL.createObjectURL(file)
    previewUrls.set(file, url)
  }
  return url
}

function releasePreview(file: File) {
  const url = previewUrls.get(file)
  if (url) {
    URL.revokeObjectURL(url)
    previewUrls.delete(file)
  }
}

interface FileUploaderProps {
  files: File[]
  onChange: (files: File[]) => void
  maxFiles?: number
  maxSizeBytes?: number
  accept?: readonly string[]
  label?: string
  hint?: string
  disabled?: boolean
}

/** Drag & drop / click-to-pick uploader with previews and client-side type/size checks. */
export function FileUploader({
  files,
  onChange,
  maxFiles = 5,
  maxSizeBytes = MAX_UPLOAD_BYTES,
  accept = IMAGE_MIME_TYPES,
  label = 'Drop photos here or click to browse',
  hint,
  disabled = false,
}: FileUploaderProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const full = files.length >= maxFiles

  const addFiles = (incoming: File[]) => {
    const problems: string[] = []
    const accepted: File[] = []
    for (const file of incoming) {
      if (!accept.includes(file.type)) {
        problems.push(`${file.name}: unsupported file type`)
      } else if (file.size > maxSizeBytes) {
        problems.push(`${file.name}: larger than ${formatBytes(maxSizeBytes)}`)
      } else if (files.length + accepted.length >= maxFiles) {
        problems.push(`${file.name}: at most ${maxFiles} file${maxFiles === 1 ? '' : 's'}`)
      } else {
        accepted.push(file)
      }
    }
    setErrors(problems)
    if (accepted.length > 0) onChange(maxFiles === 1 ? accepted.slice(0, 1) : [...files, ...accepted])
  }

  const removeAt = (index: number) => {
    const file = files[index]
    if (file) releasePreview(file)
    onChange(files.filter((_, i) => i !== index))
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    if (!disabled) addFiles(Array.from(event.dataTransfer.files))
  }

  const extensions = accept.map((t) => t.split('/')[1]?.toUpperCase()).join(', ')

  return (
    <div className="flex flex-col gap-3">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || full}
        aria-describedby={`${id}-hint`}
        onClick={() => !disabled && !full && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled && !full) {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
          dragging ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
          (disabled || full) && 'cursor-not-allowed opacity-60',
        )}
      >
        <ImagePlusIcon className="size-6 text-muted-foreground" />
        <span className="font-medium">{full ? 'File limit reached' : label}</span>
        <FieldDescription id={`${id}-hint`}>
          {hint ?? `${extensions} · up to ${formatBytes(maxSizeBytes)} each · max ${maxFiles}`}
        </FieldDescription>
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          tabIndex={-1}
          aria-label={label}
          accept={accept.join(',')}
          multiple={maxFiles > 1}
          disabled={disabled}
          onChange={(e) => {
            addFiles(Array.from(e.target.files ?? []))
            e.target.value = ''
          }}
        />
      </div>
      {errors.length > 0 && (
        <FieldError>
          <ul className="list-inside list-disc">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </FieldError>
      )}
      {files.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {files.map((file, index) => {
            const url = previewUrl(file)
            return (
              <li key={`${file.name}-${file.size}-${file.lastModified}`} className="relative overflow-hidden rounded-lg border">
                {url ? (
                  <img src={url} alt={file.name} className="aspect-square w-full object-cover" />
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-muted">
                    <FileIcon className="size-6 text-muted-foreground" />
                  </div>
                )}
                <div className="truncate px-2 py-1 text-xs text-muted-foreground">{file.name}</div>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="secondary"
                  className="absolute top-1 right-1"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => removeAt(index)}
                  disabled={disabled}
                >
                  <XIcon />
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
