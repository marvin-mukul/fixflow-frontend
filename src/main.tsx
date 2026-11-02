import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router'
import './index.css'
import { Loader } from '@/components/common/Loader'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { refreshSession } from '@/features/auth/store/authSlice'
import { setNavigator } from '@/lib/navigation'
import { router } from '@/routes/router'
import { store } from '@/store/index'

const root = createRoot(document.getElementById('root')!)
root.render(<Loader fullScreen label="Starting FixFlow…" />)

setNavigator((to, options) => {
  void router.navigate(to, options)
})

// Restore the session from the refresh cookie before the first real render,
// so guards see the final auth state. A 401 here just means "logged out".
await store.dispatch(refreshSession())

root.render(
  <StrictMode>
    <Provider store={store}>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
      <Toaster richColors position="top-right" />
    </Provider>
  </StrictMode>,
)
