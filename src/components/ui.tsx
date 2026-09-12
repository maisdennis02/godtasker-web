import { useState } from 'react'
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

// Password field with a show/hide toggle. Defaults to the shared <Input> look;
// pass `inputClassName` to take over the input's classes entirely (public pages
// use bigger fields), and `wrapperClassName` for margins around the whole thing.
export function PasswordInput({
  className = '',
  inputClassName,
  wrapperClassName = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  inputClassName?: string
  wrapperClassName?: string
}) {
  const [visible, setVisible] = useState(false)
  const type = visible ? 'text' : 'password'
  return (
    <div className={`relative ${wrapperClassName}`}>
      {inputClassName ? (
        <input {...props} type={type} className={`${inputClassName} pr-9`} />
      ) : (
        <Input {...props} type={type} className={`pr-9 ${className}`} />
      )}
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 transition hover:text-slate-300"
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  )
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
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
