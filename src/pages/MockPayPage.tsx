import { useParams } from 'react-router'
import { MockPayCheckout } from '@/features/invoices/components/MockPayCheckout'

export default function MockPayPage() {
  const { orderId = '' } = useParams()
  return <MockPayCheckout orderId={orderId} />
}
