import { useState } from 'react'
import { AuthImage } from '@/components/common/AuthImage'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

export interface GalleryPhoto {
  id: string
  url: string
  label?: string
}

/** Thumbnail grid of protected media with a lightbox dialog. */
export function PhotoGallery({ photos, emptyText = 'No photos.' }: { photos: GalleryPhoto[]; emptyText?: string }) {
  const [active, setActive] = useState<GalleryPhoto | null>(null)
  if (photos.length === 0) return <p className="text-sm text-muted-foreground">{emptyText}</p>
  return (
    <>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((photo, i) => (
          <li key={photo.id}>
            <button
              type="button"
              onClick={() => setActive(photo)}
              className="block w-full overflow-hidden rounded-lg border outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label={`Open photo ${i + 1}`}
            >
              <AuthImage src={photo.url} alt={photo.label ?? `Photo ${i + 1}`} className="aspect-square w-full object-cover" />
            </button>
          </li>
        ))}
      </ul>
      <Dialog open={active !== null} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogTitle className="sr-only">{active?.label ?? 'Photo'}</DialogTitle>
          {active && <AuthImage src={active.url} alt={active.label ?? 'Photo'} className="max-h-[75vh] w-full rounded-lg object-contain" />}
        </DialogContent>
      </Dialog>
    </>
  )
}
