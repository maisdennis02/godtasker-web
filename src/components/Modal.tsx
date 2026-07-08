import { useEffect } from 'react'
import type { ReactNode } from 'react'

// General-purpose dialog for forms (create/edit task, offering…). Same
// overlay pattern as ConfirmDialog, which stays specialized (pending/error/
// tone) and paints above this at z-[60].
export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean
  title: ReactNode
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex w-full max-w-md flex-col rounded-lg border border-slate-700 bg-slate-900 shadow-xl"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-2.5">
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
              <path
                d="m3 3 10 10M13 3 3 13"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto p-4">{children}</div>
        {footer && (
          <div className="border-t border-slate-800 px-4 py-2.5">{footer}</div>
        )}
      </div>
    </div>
  )
}
