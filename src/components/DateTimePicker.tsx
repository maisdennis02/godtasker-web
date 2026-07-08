import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import { formatDate, parseLocalInput, toLocalInput } from '../lib/format'

// Shrink the calendar from react-day-picker's roomy defaults (44px cells) to a
// more compact grid. v10 reads these custom properties off the calendar root.
const compactCalendar = {
  '--rdp-day-width': '2rem',
  '--rdp-day-height': '2rem',
  '--rdp-day_button-width': '2rem',
  '--rdp-day_button-height': '2rem',
  '--rdp-day_button-border-radius': '0.375rem',
  '--rdp-weekday-padding': '0.25rem 0',
  '--rdp-nav_button-width': '1.75rem',
  '--rdp-nav_button-height': '1.75rem',
  '--rdp-nav-height': '1.75rem',
  fontSize: '0.8rem',
} as CSSProperties

type Props = {
  // Local "YYYY-MM-DDTHH:mm" string (same contract as <input type="datetime-local">), or ''.
  value: string
  onChange: (value: string) => void
  // Earliest allowed value, as a local "YYYY-MM-DDTHH:mm" string. Days before it are disabled.
  min?: string
  placeholder?: string
}

// Default time-of-day when a date is picked before any time is set.
const DEFAULT_TIME = '09:00'

function timeOf(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function DateTimePicker({ value, onChange, min, placeholder }: Props) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const popRef = useRef<HTMLDivElement>(null)

  const selected = parseLocalInput(value) ?? undefined
  const minDate = parseLocalInput(min ?? '')
  // When a day is chosen the time comes from `value`; `pendingTime` only holds the
  // time a user sets *before* picking a day, so it survives until a day exists.
  const [pendingTime, setPendingTime] = useState(DEFAULT_TIME)
  const time = selected ? timeOf(selected) : pendingTime

  // Close the popover on outside click / Escape.
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        // Consume the key so an enclosing Modal doesn't close too.
        e.stopPropagation()
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Inside a scroll container (e.g. a Modal body) the popover can open past
  // the visible edge — bring it into view.
  useEffect(() => {
    if (open) popRef.current?.scrollIntoView({ block: 'nearest' })
  }, [open])

  function emit(day: Date, hhmm: string) {
    const [h, m] = hhmm.split(':').map(Number)
    const next = new Date(day)
    next.setHours(h || 0, m || 0, 0, 0)
    onChange(toLocalInput(next))
  }

  function handleSelectDay(day: Date | undefined) {
    if (!day) {
      onChange('')
      return
    }
    emit(day, time)
  }

  function handleTime(hhmm: string) {
    if (selected) emit(selected, hhmm)
    else setPendingTime(hhmm)
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-left text-sm text-slate-100 outline-none transition focus:border-indigo-500 hover:border-slate-600"
      >
        <span className={value ? '' : 'text-slate-500'}>
          {value ? formatDate(value) : (placeholder ?? 'Select date & time')}
        </span>
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0 text-slate-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </button>

      {open && (
        <div
          ref={popRef}
          className="absolute z-20 mt-1 rounded-lg border border-slate-700 bg-slate-900 p-2 shadow-xl"
        >
          <DayPicker
            mode="single"
            style={compactCalendar}
            selected={selected}
            onSelect={handleSelectDay}
            defaultMonth={selected ?? minDate ?? undefined}
            disabled={minDate ? { before: minDate } : undefined}
            showOutsideDays
          />
          <div className="mt-2 flex items-center gap-2 border-t border-slate-800 px-1 pt-2">
            <span className="text-xs font-medium text-slate-400">Time</span>
            <input
              type="time"
              value={time}
              onChange={e => handleTime(e.target.value)}
              className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100 outline-none focus:border-indigo-500 [color-scheme:dark]"
            />
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('')
                  setOpen(false)
                }}
                className="ml-auto text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
