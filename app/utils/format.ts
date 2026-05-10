// Money & date formatters used across Works pages.

const currencyCache = new Map<string, Intl.NumberFormat>()

function nf(currency: string) {
  let f = currencyCache.get(currency)
  if (!f) {
    f = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    })
    currencyCache.set(currency, f)
  }
  return f
}

export function formatMoney(value: number | string | null | undefined, currency = 'USD'): string {
  if (value === null || value === undefined) return '—'
  const n = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(n)) return '—'
  return nf(currency).format(n)
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatShortDate(value: string | Date | null | undefined): string {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatTime(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function daysUntil(value: string | Date | null | undefined): number | null {
  if (!value) return null
  const d = typeof value === 'string' ? new Date(value) : value
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(d)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

export function relativeDeadline(value: string | Date | null | undefined): string {
  const d = daysUntil(value)
  if (d === null) return 'No deadline'
  if (d === 0) return 'Today'
  if (d === 1) return 'Tomorrow'
  if (d === -1) return 'Yesterday'
  if (d > 0) return `In ${d} days`
  return `${Math.abs(d)} days overdue`
}

export function statusColor(status: string): 'success' | 'info' | 'warning' | 'error' | 'neutral' {
  switch (status) {
    case 'active':
    case 'done':
    case 'subscribed':
      return 'success'
    case 'in_progress':
    case 'review':
    case 'trial':
      return 'info'
    case 'paused':
    case 'planned':
    case 'prospect':
      return 'warning'
    case 'blocked':
    case 'cancelled':
    case 'bounced':
      return 'error'
    default:
      return 'neutral'
  }
}

export function statusLabel(status: string): string {
  return status.replace(/_/g, ' ')
}
