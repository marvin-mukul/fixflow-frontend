import { ExternalLinkIcon, FileWarningIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiObjectUrl } from '@/hooks/useApiObjectUrl'
import { cn } from '@/lib/utils'

interface AuthDocumentProps {
  /** API path that needs the Bearer header; the file may be an image or a PDF. */
  src: string
  title: string
  className?: string
}

/** Previews a protected image or PDF (via an object URL) with an "open in new tab" link. */
export function AuthDocument({ src, title, className }: AuthDocumentProps) {
  const { url, type, failed } = useApiObjectUrl(src)

  if (failed) {
    return (
      <div
        role="alert"
        className={cn(
          'flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground',
          className,
        )}
      >
        <FileWarningIcon className="size-4" />
        The document could not be loaded.
      </div>
    )
  }
  if (!url) return <Skeleton className={cn('h-64 w-full', className)} />

  const isPdf = type === 'application/pdf'
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {isPdf ? (
        <iframe src={url} title={title} className="h-96 w-full rounded-lg border" />
      ) : (
        <img src={url} alt={title} className="max-h-96 w-full rounded-lg border object-contain" />
      )}
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'self-start')}
      >
        <ExternalLinkIcon />
        Open in new tab
      </a>
    </div>
  )
}
