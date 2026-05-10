// Suppresses the benign "ResizeObserver loop completed with undelivered
// notifications" warning that fires from Reka UI / Nuxt UI primitives
// (UTable, UDashboardSidebar, popovers, tooltips) in development.
//
// Background: Chrome surfaces this as a window error event even though the
// spec calls it a non-fatal notification. It does not impact rendering or
// production behaviour. We intercept it at the window level only — every
// other error continues to propagate untouched.
//
// References:
// - https://github.com/WICG/resize-observer/issues/38
// - https://stackoverflow.com/q/49384120

const RESIZE_OBSERVER_MESSAGE
  = 'ResizeObserver loop completed with undelivered notifications.'
const LEGACY_MESSAGE
  = 'ResizeObserver loop limit exceeded'

function isResizeObserverNoise(message: unknown): boolean {
  if (typeof message !== 'string') return false
  return (
    message.includes(RESIZE_OBSERVER_MESSAGE)
    || message.includes(LEGACY_MESSAGE)
  )
}

export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return

  // 1. Stop the warning from reaching the dev overlay / window.onerror chain.
  window.addEventListener(
    'error',
    (event) => {
      if (isResizeObserverNoise(event.message)) {
        event.stopImmediatePropagation()
        event.preventDefault()
      }
    },
    true, // capture phase, before any listener that would surface it
  )

  // 2. Some browsers route it through unhandledrejection — guard that too.
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    const message
      = typeof reason === 'string'
        ? reason
        : reason && typeof reason === 'object' && 'message' in reason
          ? (reason as { message: unknown }).message
          : undefined
    if (isResizeObserverNoise(message)) {
      event.stopImmediatePropagation()
      event.preventDefault()
    }
  })
})
