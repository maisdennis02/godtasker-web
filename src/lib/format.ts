// Human-friendly date helpers. App code runs in the browser, so `new Date()` is fine.

const ISO_RE =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/

export function looksLikeDate(value: unknown): value is string {
  return typeof value === 'string' && ISO_RE.test(value)
}

// "Jun 25, 2026, 10:00 AM" (or date-only when the value has no time component).
export function formatDate(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const hasTime = value.includes('T')
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    ...(hasTime ? { timeStyle: 'short' as const } : {}),
  }).format(d)
}

// "10:42 AM" — for compact chat timestamps.
export function formatTime(value?: string): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(d)
}

// A <input type="datetime-local"> value (local time) -> ISO 8601 for the API.
export function localToISO(local: string): string {
  if (!local) return ''
  const d = new Date(local)
  return Number.isNaN(d.getTime()) ? local : d.toISOString()
}

// A Date -> local "YYYY-MM-DDTHH:mm" string (the datetime-local / API-bound shape).
export function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Current local time formatted for a datetime-local input's `min`/`value`.
export function nowLocalInputValue(): string {
  return toLocalInput(new Date())
}

// Parse a local "YYYY-MM-DDTHH:mm" string into a Date (local time). null when blank/invalid.
export function parseLocalInput(local: string): Date | null {
  if (!local) return null
  const d = new Date(local)
  return Number.isNaN(d.getTime()) ? null : d
}
