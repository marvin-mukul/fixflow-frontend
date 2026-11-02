import { combineReducers, configureStore } from '@reduxjs/toolkit'
import {
  authReducer,
  refreshSession,
  sessionCleared,
} from '@/features/auth/store/authSlice'
import { notificationsReducer } from '@/features/notifications/store/notificationsSlice'
import { propertiesReducer } from '@/features/properties/store/propertiesSlice'
import { requestsReducer } from '@/features/requests/store/requestsSlice'
import { setAuthHandlers } from '@/lib/axios'

const rootReducer = combineReducers({
  auth: authReducer,
  properties: propertiesReducer,
  requests: requestsReducer,
  notifications: notificationsReducer,
})

export type RootState = ReturnType<typeof rootReducer>

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
