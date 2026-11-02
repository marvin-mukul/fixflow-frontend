/**
 * Lazy loader for the Cashfree JS SDK (v3). The script is injected only when a
 * checkout actually needs it, so the mock provider never downloads it.
 */
const SDK_URL = 'https://sdk.cashfree.com/js/v3/cashfree.js'

interface CashfreeInstance {
  checkout: (options: { paymentSessionId: string; redirectTarget?: '_self' | '_blank' | '_top' | '_modal' }) => Promise<unknown>
}
type CashfreeFactory = (options: { mode: 'sandbox' | 'production' }) => CashfreeInstance

declare global {
  interface Window {
    Cashfree?: CashfreeFactory
  }
}

let loading: Promise<CashfreeFactory> | null = null

function loadSdk(): Promise<CashfreeFactory> {
  if (window.Cashfree) return Promise.resolve(window.Cashfree)
  if (!loading) {
    loading = new Promise<CashfreeFactory>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = SDK_URL
      script.async = true
      script.onload = () =>
        window.Cashfree ? resolve(window.Cashfree) : reject(new Error('Cashfree SDK did not initialise'))
      script.onerror = () => reject(new Error('Could not load the Cashfree checkout'))
      document.head.appendChild(script)
    }).catch((error: unknown) => {
      loading = null
      throw error
    })
  }
  return loading
}

/** Opens the Cashfree hosted checkout in the current tab. */
export async function openCashfreeCheckout(paymentSessionId: string, mode: 'sandbox' | 'production' = 'sandbox') {
  const factory = await loadSdk()
  await factory({ mode }).checkout({ paymentSessionId, redirectTarget: '_self' })
}
