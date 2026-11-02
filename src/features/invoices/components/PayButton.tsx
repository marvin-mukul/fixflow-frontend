import { CreditCardIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { MoneyText } from '@/components/common/MoneyText'
import { Button } from '@/components/ui/button'
import { startCheckout } from '@/features/invoices/store/invoicesSlice'
import { toApiError } from '@/lib/apiError'
import { useAppDispatch } from '@/store/hooks'

interface PayButtonProps {
  invoiceId: string
  totalPaise: number
  /** Called when the invoice turned out to be paid already (409 INVOICE_NOT_PAYABLE). */
  onAlreadyPaid?: () => void
}

/** Starts a checkout with the configured provider (redirect or Cashfree SDK). */
export function PayButton({ invoiceId, totalPaise, onAlreadyPaid }: PayButtonProps) {
  const dispatch = useAppDispatch()
  const [busy, setBusy] = useState(false)

  const pay = async () => {
    setBusy(true)
    try {
      await dispatch(startCheckout(invoiceId)).unwrap()
      // The browser is leaving for the gateway; keep the button disabled.
    } catch (err) {
      const error = toApiError(err)
      setBusy(false)
      if (error.code === 'INVOICE_NOT_PAYABLE') {
        toast.info('This invoice is already paid')
        onAlreadyPaid?.()
      } else {
        toast.error('Could not start the payment', { description: error.message })
      }
    }
  }

  return (
    <Button onClick={() => void pay()} disabled={busy}>
      <CreditCardIcon />
      {busy ? 'Opening checkout…' : (
        <>
          Pay <MoneyText paise={totalPaise} />
        </>
      )}
    </Button>
  )
}
