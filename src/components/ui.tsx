import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

export function Button({
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md bg-indigo-600 px-2.5 py-1 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
}

export function Input({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-500 ${className}`}
      {...props}
    />
  )
}

export function Textarea({
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-500 ${className}`}
      {...props}
    />
  )
}

export function Select({
  className = '',
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100 outline-none focus:border-indigo-500 ${className}`}
      {...props}
    />
  )
}

export function Card({
  title,
  children,
  className = '',
}: {
  title?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-lg border border-slate-800 bg-slate-900/60 p-3 ${className}`}
    >
      {title && (
        <h3 className="mb-2 text-sm font-semibold text-slate-200">{title}</h3>
      )}
      {children}
    </div>
  )
}

export function Field({
  label,
  inline = false,
  children,
}: {
  label: string
  inline?: boolean
  children: ReactNode
}) {
  if (inline) {
    return (
      <label className="flex items-center gap-2">
        <span className="w-24 shrink-0 text-xs font-medium text-slate-400">
          {label}
        </span>
        {children}
      </label>
    )
  }
  return (
    <label className="block">
      <span className="mb-0.5 block text-xs font-medium text-slate-400">
        {label}
      </span>
      {children}
    </label>
  )
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[11px] text-slate-300">
      {children}
    </span>
  )
}

// Label/value line used by expandable task and offering details — skips empty values.
export function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-3 text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="text-right text-slate-300">{value}</span>
    </div>
  )
}
