/** Mirrors the backend upload limits (`media.service.ts`, `upload.ts`). */
export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const DOCUMENT_MIME_TYPES = [...IMAGE_MIME_TYPES, 'application/pdf'] as const
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
export const MAX_REQUEST_PHOTOS = 5
