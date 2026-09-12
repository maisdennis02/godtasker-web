import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import appIconUrl from '../assets/app-icon.png'
import type { Locale, MessageKey } from '../i18n/landing'
import { BETA_LINKS } from '../lib/betaLinks'

export type T = (key: MessageKey) => string

export function Wordmark() {
  return (
    <span className="flex items-center gap-2">
      <img src={appIconUrl} alt="" className="h-7 w-7 rounded-lg" />
      <span className="text-lg font-bold tracking-tight text-white">LalaTask</span>
    </span>
  )
}

// EN/PT pill with a highlight that slides between the two options.
export function LangToggle({
  locale,
  setLocale,
}: {
  locale: Locale
  setLocale: (l: Locale) => void
}) {
  return (
    <div
      role="group"
      aria-label="Language"
      className="relative flex overflow-hidden rounded-full border border-slate-700 bg-slate-900/60 text-xs font-semibold"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-indigo-600 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: locale === 'pt' ? 'translateX(100%)' : 'translateX(0)' }}
      />
      {(['en', 'pt'] as const).map(l => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={`relative z-10 w-9 py-1 text-center transition-colors duration-300 ${
            locale === l ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

// The three closed-testing steps. Rendered inside the landing page (#beta) and
// standalone at /beta — the latter is the "link in bio" for the reels.
export function BetaSteps({ t }: { t: T }) {
  const steps: { title: MessageKey; body: MessageKey; cta: MessageKey; href: string }[] = [
    { title: 'betaStep1Title', body: 'betaStep1Body', cta: 'betaStep1Cta', href: BETA_LINKS.group },
    { title: 'betaStep2Title', body: 'betaStep2Body', cta: 'betaStep2Cta', href: BETA_LINKS.optIn },
    {
      title: 'betaStep3Title',
      body: 'betaStep3Body',
      cta: 'betaStep3Cta',
      href: BETA_LINKS.install,
    },
  ]
  return (
    <div>
      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className="relative flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-6 pt-8 transition duration-300 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-950/40"
          >
            <span className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-950/60">
              {i + 1}
            </span>
            <h3 className="font-semibold text-white">{t(s.title)}</h3>
            <p className="mt-1.5 grow text-sm leading-relaxed text-slate-400">{t(s.body)}</p>
            <a
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className={`mt-5 inline-block rounded-lg px-4 py-2 text-center text-sm font-semibold transition duration-200 motion-safe:hover:-translate-y-0.5 ${
                i === 0
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50 hover:bg-indigo-500'
                  : 'border border-indigo-500/40 text-indigo-300 hover:border-indigo-400 hover:bg-indigo-500/10 hover:text-white'
              }`}
            >
              {t(s.cta)} ↗
            </a>
          </li>
        ))}
      </ol>
      <p className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        {t('betaNote')}
      </p>
      <div className="mt-4 flex flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {t('betaIphone')}{' '}
          <Link to="/login?mode=register" className="font-medium text-indigo-400 hover:text-indigo-300">
            lalatask.com/login →
          </Link>
        </p>
        <p>
          {t('betaFeedback')}{' '}
          <a
            href={`mailto:${BETA_LINKS.supportEmail}`}
            className="font-medium text-indigo-400 hover:text-indigo-300"
          >
            {BETA_LINKS.supportEmail}
          </a>
        </p>
      </div>
    </div>
  )
}

// An <img> that fades in once decoded (cached images are shown immediately).
export function FadeImg({
  src,
  alt,
  className = '',
  eager = false,
}: {
  src: string
  alt: string
  className?: string
  eager?: boolean
}) {
  const ref = useRef<HTMLImageElement | null>(null)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (el?.complete && el.naturalWidth > 0) setLoaded(true)
  }, [src])
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      onLoad={() => setLoaded(true)}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={`img-fade ${loaded ? 'is-loaded' : ''} ${className}`}
    />
  )
}

// A phone-shaped frame. Children are the screen(s): 540px-wide webp captures
// with the status bar removed, so the frame supplies the bezel.
export function PhoneFrame({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`overflow-hidden rounded-[2.25rem] border-[7px] border-slate-800 bg-slate-950 shadow-2xl shadow-indigo-950/60 ring-1 ring-slate-700/60 ${className}`}
    >
      {children}
    </div>
  )
}
