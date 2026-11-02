import type {
  CheckoutResult,
  Earnings,
  Invoice,
  MockCompleteResult,
  MockOrder,
  MockOutcome,
  OfflinePaymentResult,
} from '@/features/invoices/types/invoice.types'
import { api } from '@/lib/axios'

export const invoicesApi = {
  async get(id: string) {
    const { data } = await api.get<Invoice>(`/invoices/${id}`)
    return data
  },
  async checkout(id: string) {
    const { data } = await api.post<CheckoutResult>(`/invoices/${id}/checkout`)
    return data
  },
  async markPaidOffline(id: string) {
    const { data } = await api.post<OfflinePaymentResult>(`/invoices/${id}/mark-paid-offline`)
    return data
  },
  async confirmOffline(id: string) {
    const { data } = await api.post<OfflinePaymentResult>(`/invoices/${id}/confirm-offline`)
    return data
  },
  async earnings() {
    const { data } = await api.get<Earnings>('/worker/earnings')
    return data
  },
  async mockOrder(orderId: string) {
    const { data } = await api.get<MockOrder>(`/payments/mock/${orderId}`)
    return data
  },
  async completeMockOrder(orderId: string, outcome: MockOutcome) {
    const { data } = await api.post<MockCompleteResult>(`/payments/mock/${orderId}/complete`, { outcome })
    return data
  },
}
