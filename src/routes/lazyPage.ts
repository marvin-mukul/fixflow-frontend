import type { ComponentType } from 'react'

/** `lazy` for a route whose module default-exports its page component. */
export const lazyPage = (load: () => Promise<{ default: ComponentType }>) => () =>
  load().then((m) => ({ Component: m.default }))
