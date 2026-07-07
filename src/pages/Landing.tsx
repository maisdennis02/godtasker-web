import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import detectiveUrl from '../assets/detective.svg'
import { useLandingLocale } from '../i18n/landing'
import type { Locale, MessageKey } from '../i18n/landing'

type T = (key: MessageKey) => string

// Adds .is-visible once the element scrolls into view; index.css turns that
// into a fade/slide-in (staggered for .reveal-stagger children).
function Reveal({
  as: Tag = 'div',
  stagger = false,
  className = '',
  children,
}: {
  as?: 'div' | 'section'
  stagger?: boolean
  className?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          el.classList.add('is-visible')
          io.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <Tag
      ref={ref as never}
      className={`${stagger ? 'reveal-stagger' : 'reveal'} ${className}`}
    >
      {children}
    </Tag>
  )
}

// ── tiny inline icons (stroke style, heroicons-like) ─────────────────────────

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'h-6 w-6'}
      aria-hidden
    >
      <path d={d} />
    </svg>
  )
}

const ICONS = {
  send: 'M6 12 3.3 3.9a.4.4 0 0 1 .5-.5l16.9 8.2a.45.45 0 0 1 0 .8L3.8 20.6a.4.4 0 0 1-.5-.5L6 12Zm0 0h7',
  inbox:
    'M3 13h4l2 3h6l2-3h4M5 6h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm4.5 5 2 2 3.5-4',
  tag: 'M20.6 13.4 12 4.8A2 2 0 0 0 10.6 4H5a1 1 0 0 0-1 1v5.6c0 .5.2 1 .6 1.4l8.6 8.6a2 2 0 0 0 2.8 0l4.6-4.6a2 2 0 0 0 0-2.6ZM8 9h.01',
  chat: 'M8 10h8m-8 4h5m-9 6 2.8-2.8H18a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v13Z',
  chart: 'M4 20V10m6 10V4m6 16v-7m4 7H2',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0',
  home: 'M3 11.5 12 4l9 7.5M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9',
  brush:
    'M15 5.5 18.5 9m-14 9.5c1.8 0 3.5-1.5 3.5-3.5L18.5 4.5a2.1 2.1 0 0 1 3 3L11 18c0 2-1.7 3.5-3.5 3.5H4a.5.5 0 0 1-.5-.5l1-2.5Z',
  book: 'M12 6.5C10.5 5 8.4 4.5 6 4.5c-1 0-2 .1-3 .4v13.6c1-.3 2-.4 3-.4 2.4 0 4.5.5 6 2 1.5-1.5 3.6-2 6-2 1 0 2 .1 3 .4V4.9c-1-.3-2-.4-3-.4-2.4 0-4.5.5-6 2Zm0 0V20',
  briefcase:
    'M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-9 0h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm-2 5h16',
  heart:
    'M12 20s-7.5-4.6-9.3-9.1C1.5 7.7 3.6 4.5 6.8 4.5c2 0 3.7 1.1 4.6 2.8L12 8.6l.6-1.3c.9-1.7 2.6-2.8 4.6-2.8 3.2 0 5.3 3.2 4.1 6.4C19.5 15.4 12 20 12 20Z',
  dumbbell: 'M7 8v8M4 10v4m16-4v4m-3-6v8M7 12h10',
} as const

// ── shared bits ───────────────────────────────────────────────────────────────

function Wordmark() {
  return (
    <span className="flex items-center gap-2">
      <img src={detectiveUrl} alt="" className="h-7 w-7" />
      <span className="text-lg font-bold tracking-tight text-white">GodTasker</span>
    </span>
  )
}

function LangToggle({
  locale,
  setLocale,
}: {
  locale: Locale
  setLocale: (l: Locale) => void
}) {
  return (
    <div className="flex overflow-hidden rounded-full border border-slate-700 text-xs font-semibold">
      {(['en', 'pt'] as const).map(l => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`px-2.5 py-1 transition ${
            locale === l ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

// The hero visual: a mock task card that plays itself — subtasks tick off one
// by one and the progress bar fills, then it loops. A tiny product demo, no
// screenshots or video.
function MockTaskCard({ t }: { t: T }) {
  const [done, setDone] = useState(1)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setDone(d => (d >= 3 ? 1 : d + 1)), 2200)
    return () => clearInterval(id)
  }, [])

  const items = [t('mockItem1'), t('mockItem2'), t('mockItem3')]
  return (
    <div className="w-full max-w-sm rounded-2xl border border-slate-700/80 bg-slate-900/90 p-5 shadow-2xl shadow-indigo-950/50 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{t('mockTitle')}</p>
          <p className="text-xs text-slate-500">{t('mockFrom')}</p>
        </div>
        <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300">
          {t('mockDue')}
        </span>
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {items.map((label, i) => {
          const checked = i < done
          return (
            <li key={label} className="flex items-center gap-2.5 text-sm">
              <span
                className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-colors duration-300 ${
                  checked
                    ? 'border-indigo-500 bg-indigo-600 text-white'
                    : 'border-slate-600 bg-slate-800'
                }`}
              >
                {checked && (
                  <svg
                    viewBox="0 0 12 12"
                    className="animate-check-pop h-3 w-3"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M2.5 6.5 5 9l4.5-6"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span
                className={`transition-colors duration-300 ${
                  checked ? 'text-slate-500 line-through' : 'text-slate-200'
                }`}
              >
                {label}
              </span>
            </li>
          )
        })}
      </ul>
      <div className="mt-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-700 ease-out"
            style={{ width: `${(done / 3) * 100}%` }}
          />
        </div>
        <p className="mt-1.5 text-right text-[11px] text-slate-500">
          {t('mockProgress').replace('{n}', String(done))}
        </p>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-950/40">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300">
        <Icon d={icon} className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-400">{body}</p>
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export function Landing() {
  const { locale, setLocale, t } = useLandingLocale()

  useEffect(() => {
    const prev = document.documentElement.lang
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : 'en'
    return () => {
      document.documentElement.lang = prev
    }
  }, [locale])

  const features: { icon: string; title: MessageKey; body: MessageKey }[] = [
    { icon: ICONS.send, title: 'featDelegateTitle', body: 'featDelegateBody' },
    { icon: ICONS.inbox, title: 'featReceiveTitle', body: 'featReceiveBody' },
    { icon: ICONS.tag, title: 'featOfferTitle', body: 'featOfferBody' },
    { icon: ICONS.chat, title: 'featChatTitle', body: 'featChatBody' },
    { icon: ICONS.chart, title: 'featTrackTitle', body: 'featTrackBody' },
    { icon: ICONS.user, title: 'featProfileTitle', body: 'featProfileBody' },
  ]

  const sectors: { icon: string; title: MessageKey; body: MessageKey }[] = [
    { icon: ICONS.home, title: 'sectorHouseholdTitle', body: 'sectorHouseholdBody' },
    { icon: ICONS.brush, title: 'sectorFreelanceTitle', body: 'sectorFreelanceBody' },
    { icon: ICONS.book, title: 'sectorTutoringTitle', body: 'sectorTutoringBody' },
    { icon: ICONS.briefcase, title: 'sectorBusinessTitle', body: 'sectorBusinessBody' },
    { icon: ICONS.heart, title: 'sectorFamilyTitle', body: 'sectorFamilyBody' },
    { icon: ICONS.dumbbell, title: 'sectorFitnessTitle', body: 'sectorFitnessBody' },
  ]

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200">
      {/* nav */}
      <header className="sticky top-0 z-20 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="#top" className="shrink-0">
            <Wordmark />
          </a>
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#features" className="hover:text-white">
              {t('navFeatures')}
            </a>
            <a href="#use-cases" className="hover:text-white">
              {t('navUseCases')}
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <LangToggle locale={locale} setLocale={setLocale} />
            <Link
              to="/login"
              className="hidden rounded-md px-3 py-1.5 text-sm text-slate-300 transition hover:text-white sm:block"
            >
              {t('navLogIn')}
            </Link>
            <Link
              to="/login?mode=register"
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              {t('navSignUp')}
            </Link>
          </div>
        </div>
      </header>

      {/* hero */}
      <section id="top" className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[32rem] w-[42rem] -translate-x-1/2"
          aria-hidden
        >
          <div className="animate-glow h-full w-full rounded-full bg-indigo-600/20 blur-3xl" />
        </div>
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div>
            <h1 className="animate-enter text-shimmer text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {t('heroTitle')}
            </h1>
            <p
              className="animate-enter mt-4 max-w-xl text-lg text-slate-400"
              style={{ animationDelay: '0.15s' }}
            >
              {t('heroSubtitle')}
            </p>
            <div
              className="animate-enter mt-8 flex flex-wrap items-center gap-4"
              style={{ animationDelay: '0.3s' }}
            >
              <Link
                to="/login?mode=register"
                className="rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-950/60 transition hover:scale-[1.04] hover:bg-indigo-500 active:scale-[0.98]"
              >
                {t('heroCta')}
              </Link>
              <a
                href="#features"
                className="group text-sm font-medium text-indigo-400 hover:text-indigo-300"
              >
                {t('heroSecondary')}{' '}
                <span className="inline-block transition-transform group-hover:translate-x-1">
                  →
                </span>
              </a>
            </div>
          </div>
          <div
            className="animate-enter flex justify-center md:justify-end"
            style={{ animationDelay: '0.45s' }}
          >
            <div className="animate-float relative mt-10 sm:mt-0">
              {/* Mascot peeking over the card's top corner. */}
              <img
                src={detectiveUrl}
                alt=""
                className="animate-bob absolute -top-16 -left-8 hidden h-20 w-20 -rotate-12 sm:block"
              />
              <MockTaskCard t={t} />
            </div>
          </div>
        </div>
      </section>

      {/* features */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-16 sm:px-6">
        <Reveal>
          <h2 className="text-center text-3xl font-bold tracking-tight text-white">
            {t('featuresTitle')}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-slate-400">
            {t('featuresSubtitle')}
          </p>
        </Reveal>
        <Reveal stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(f => (
            <FeatureCard key={f.title} icon={f.icon} title={t(f.title)} body={t(f.body)} />
          ))}
        </Reveal>
      </section>

      {/* use cases */}
      <section
        id="use-cases"
        className="scroll-mt-16 border-y border-slate-800/60 bg-slate-950/60 py-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <h2 className="text-center text-3xl font-bold tracking-tight text-white">
              {t('useCasesTitle')}
            </h2>
            <p className="mt-2 text-center text-slate-400">{t('useCasesSubtitle')}</p>
          </Reveal>
          <Reveal stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sectors.map(s => (
              <div
                key={s.title}
                className="flex gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-950/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300">
                  <Icon d={s.icon} className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{t(s.title)}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">{t(s.body)}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <Reveal className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/80 to-slate-900 px-6 py-14">
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2"
            aria-hidden
          >
            <div className="animate-glow h-full w-full rounded-full bg-indigo-500/20 blur-3xl" />
          </div>
          <h2 className="relative mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white">
            {t('ctaTitle')}
          </h2>
          <Link
            to="/login?mode=register"
            className="relative mt-8 inline-block rounded-lg bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-950/60 transition hover:scale-[1.04] hover:bg-indigo-500 active:scale-[0.98]"
          >
            {t('ctaButton')}
          </Link>
        </Reveal>
      </section>

      {/* footer */}
      <footer className="border-t border-slate-800/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <Wordmark />
          <p className="text-xs text-slate-500">
            © 2026 GodTasker — {t('footerTagline')}
          </p>
          <LangToggle locale={locale} setLocale={setLocale} />
        </div>
      </footer>
    </div>
  )
}
