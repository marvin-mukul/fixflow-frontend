import { cn } from '@/lib/utils'
import { formatPaise } from '@/utils/format'

/** Renders integer paise as ₹ (en-IN, 2 decimals). */
export function MoneyText({ paise, className }: { paise: number; className?: string }) {
  return <span className={cn('tabular-nums', className)}>{formatPaise(paise)}</span>
}
