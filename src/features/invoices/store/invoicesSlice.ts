import { createEntityAdapter, createSlice, isAnyOf } from '@reduxjs/toolkit'
import { env } from '@/config/env'
import { invoicesApi } from '@/features/invoices/api/invoices.api'
import type {
  CheckoutInstruction,
  Earnings,
  Invoice,
  MockOutcome,
} from '@/features/invoices/types/invoice.types'
import { toApiError } from '@/lib/apiError'
import { openCashfreeCheckout } from '@/lib/cashfree'
import { createApiThunk } from '@/lib/createApiThunk'
import { browserLocation } from '@/lib/navigation'
import type { ApiError, AsyncStatus } from '@/types/api'

const adapter = createEntityAdapter<Invoice>()

export interface InvoicesState extends ReturnType<typeof adapter.getInitialState> {
  status: AsyncStatus
  error: ApiError | null
  detailStatus: Record<string, AsyncStatus>
  detailError: Record<string, ApiError | null>
  earnings: Earnings | null
  earningsStatus: AsyncStatus
  earningsError: ApiError | null
}

const initialState: InvoicesState = adapter.getInitialState({
  status: 'idle',
  error: null,
  detailStatus: {},
  detailError: {},
  earnings: null,
  earningsStatus: 'idle',
  earningsError: null,
})

/** Sends the browser to the provider: a redirect URL (mock) or the Cashfree JS SDK. */
async function openCheckout(checkout: CheckoutInstruction) {
  if (checkout.kind === 'redirect') {
    browserLocation.assign(checkout.url)
    return
  }
  if (env.PAYMENT_PROVIDER !== 'cashfree') {
    throw new Error('Online checkout is not configured in this app (set VITE_PAYMENT_PROVIDER=cashfree).')
  }
  await openCashfreeCheckout(checkout.sessionId)
}

export const fetchInvoice = createApiThunk('invoices/fetchOne', (id: string) => invoicesApi.get(id))
export const startCheckout = createApiThunk('invoices/startCheckout', async (invoiceId: string) => {
  const result = await invoicesApi.checkout(invoiceId)
  await openCheckout(result.checkout)
  return result
})
export const markPaidOffline = createApiThunk('invoices/markPaidOffline', async (id: string) => {
  await invoicesApi.markPaidOffline(id)
  return invoicesApi.get(id)
})
export const confirmOfflinePayment = createApiThunk('invoices/confirmOffline', async (id: string) => {
  await invoicesApi.confirmOffline(id)
  return invoicesApi.get(id)
})
export const fetchEarnings = createApiThunk('invoices/fetchEarnings', () => invoicesApi.earnings())
export const fetchMockOrder = createApiThunk('invoices/fetchMockOrder', (orderId: string) =>
  invoicesApi.mockOrder(orderId),
)
export const completeMockOrder = createApiThunk(
  'invoices/completeMockOrder',
  ({ orderId, outcome }: { orderId: string; outcome: MockOutcome }) =>
    invoicesApi.completeMockOrder(orderId, outcome),
)

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoice.pending, (state, action) => {
        // Keep showing the cached invoice while polling.
        if (!state.entities[action.meta.arg]) state.detailStatus[action.meta.arg] = 'loading'
        state.detailError[action.meta.arg] = null
      })
      .addCase(fetchInvoice.rejected, (state, action) => {
        state.detailStatus[action.meta.arg] = 'failed'
        state.detailError[action.meta.arg] = action.payload ?? toApiError(action.error)
      })
      .addCase(fetchEarnings.pending, (state) => {
        state.earningsStatus = 'loading'
        state.earningsError = null
      })
      .addCase(fetchEarnings.fulfilled, (state, action) => {
        state.earningsStatus = 'succeeded'
        state.earnings = action.payload
      })
      .addCase(fetchEarnings.rejected, (state, action) => {
        state.earningsStatus = 'failed'
        state.earningsError = action.payload ?? toApiError(action.error)
      })
      .addMatcher(
        isAnyOf(fetchInvoice.fulfilled, markPaidOffline.fulfilled, confirmOfflinePayment.fulfilled),
        (state, action) => {
          adapter.upsertOne(state, action.payload)
          state.detailStatus[action.payload.id] = 'succeeded'
          state.status = 'succeeded'
          // Earnings totals depend on invoice status; reload them next time.
          state.earningsStatus = 'idle'
        },
      )
  },
})

export const invoicesReducer = invoicesSlice.reducer

type WithInvoices = { invoices: InvoicesState }
const selectors = adapter.getSelectors((state: WithInvoices) => state.invoices)

export const selectInvoiceById = selectors.selectById
export const selectInvoiceDetailStatus = (state: WithInvoices, id: string) =>
  state.invoices.detailStatus[id] ?? 'idle'
export const selectInvoiceDetailError = (state: WithInvoices, id: string) =>
  state.invoices.detailError[id] ?? null
export const selectEarnings = (state: WithInvoices) => state.invoices.earnings
export const selectEarningsStatus = (state: WithInvoices) => state.invoices.earningsStatus
export const selectEarningsError = (state: WithInvoices) => state.invoices.earningsError
