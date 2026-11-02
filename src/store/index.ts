import { combineReducers, configureStore, isAnyOf } from '@reduxjs/toolkit'
import {
  authReducer,
  logout,
  refreshSession,
  sessionCleared,
} from '@/features/auth/store/authSlice'
import { adminReducer } from '@/features/admin/store/adminSlice'
import { invoicesReducer } from '@/features/invoices/store/invoicesSlice'
import { jobsReducer } from '@/features/jobs/store/jobsSlice'
import { notificationsReducer } from '@/features/notifications/store/notificationsSlice'
import { propertiesReducer } from '@/features/properties/store/propertiesSlice'
import { quotesReducer } from '@/features/quotes/store/quotesSlice'
import { reviewsReducer } from '@/features/reviews/store/reviewsSlice'
import { requestsReducer } from '@/features/requests/store/requestsSlice'
import { workerReducer } from '@/features/worker/store/workerSlice'
import { setAuthHandlers } from '@/lib/axios'

const appReducer = combineReducers({
  auth: authReducer,
  properties: propertiesReducer,
  requests: requestsReducer,
  notifications: notificationsReducer,
  quotes: quotesReducer,
  worker: workerReducer,
  jobs: jobsReducer,
  invoices: invoicesReducer,
  reviews: reviewsReducer,
  admin: adminReducer,
})

export type RootState = ReturnType<typeof appReducer>

const isSessionEnd = isAnyOf(logout.fulfilled, logout.rejected, sessionCleared)

/** Drops every feature slice when the session ends so the next user starts clean. */
const rootReducer: typeof appReducer = (state, action) =>
  appReducer(
    isSessionEnd(action) && state ? ({ auth: state.auth } as Partial<RootState> as RootState) : state,
    action,
  )

export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({ reducer: rootReducer, preloadedState })
}

export type AppStore = ReturnType<typeof makeStore>
export type AppDispatch = AppStore['dispatch']

/** Wires the axios instance to a store (token header, refresh, expiry). */
export function connectApiToStore(target: AppStore) {
  setAuthHandlers({
    getAccessToken: () => target.getState().auth.accessToken,
    refreshSession: async () => {
      const { accessToken } = await target.dispatch(refreshSession()).unwrap()
      return accessToken
    },
    onSessionExpired: () => {
      target.dispatch(sessionCleared())
    },
  })
}

export const store = makeStore()
connectApiToStore(store)
