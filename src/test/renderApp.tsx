import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { setNavigator } from '@/lib/navigation'
import { appRoutes } from '@/routes/appRoutes'
import { connectApiToStore, makeStore, type RootState } from '@/store/index'

interface RenderAppOptions {
  path?: string
  preloadedState?: Partial<RootState>
  routes?: RouteObject[]
}

/** Renders the real route tree in a memory router with a fresh store wired to axios. */
export function renderApp({ path = '/', preloadedState, routes = appRoutes }: RenderAppOptions = {}) {
  const store = makeStore(preloadedState)
  connectApiToStore(store)
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  setNavigator((to, options) => {
    void router.navigate(to, options)
  })
  const utils = render(
    <Provider store={store}>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </Provider>,
  )
  return { ...utils, store, router }
}

export function authedState(user: RootState['auth']['user'], accessToken = 'access_1'): Partial<RootState> {
  return {
    auth: { user, accessToken, status: 'succeeded', error: null, initialized: true },
  }
}
