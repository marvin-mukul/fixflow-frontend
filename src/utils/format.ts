/** All user-facing dates are shown in India Standard Time. */
export const APP_TIME_ZONE = 'Asia/Kolkata'
const IST_OFFSET = '+05:30'

const dateTimeFormat = new Intl.DateTimeFormat('en-IN', {
  timeZone: APP_TIME_ZONE,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const dateFormat = new Intl.DateTimeFormat('en-IN', {
  timeZone: APP_TIME_ZONE,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const moneyFormat = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '—' : dateTimeFormat.format(date)
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '—' : dateFormat.format(date)
}

/** Integer paise → "₹1,234.50". */
export function formatPaise(paise: number): string {
  return moneyFormat.format(paise / 100)
}

/** Rupees typed by a user ("1234.5") → integer paise, or null when invalid. */
export function rupeesToPaise(rupees: string | number): number | null {
  const value = typeof rupees === 'number' ? rupees : Number(rupees.trim())
  if (!Number.isFinite(value) || value < 0) return null
  return Math.round(value * 100)
}

export function paiseToRupees(paise: number): string {
  return (paise / 100).toFixed(2)
}

/** `<input type="datetime-local">` value (wall clock in IST) → ISO string with the IST offset. */
export function istLocalToIso(local: string): string {
  const withSeconds = local.length === 16 ? `${local}:00` : local
  return new Date(`${withSeconds}${IST_OFFSET}`).toISOString()
}

/** ISO instant → `datetime-local` value in IST. */
export function isoToIstLocal(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso))
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00'
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`
}

export function formatKm(km: number | null | undefined): string {
  if (km === null || km === undefined) return '—'
  return `${km.toFixed(1)} km`
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
