export interface NavigateOptions {
  replace?: boolean
  state?: unknown
}

type NavigateFn = (to: string, options?: NavigateOptions) => void

let navigator: NavigateFn | null = null

/** Registered once by `main.tsx` with `router.navigate`, so non-React code can navigate. */
export function setNavigator(fn: NavigateFn | null) {
  navigator = fn
}

export function navigateTo(to: string, options?: NavigateOptions) {
  if (navigator) {
    navigator(to, options)
    return
  }
  window.location.assign(to)
}
