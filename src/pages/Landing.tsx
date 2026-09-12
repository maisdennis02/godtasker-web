import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useLandingLocale } from '../i18n/landing'
import type { Locale, MessageKey } from '../i18n/landing'
import {
  BetaSteps,
  FadeImg,
  LangToggle,
  PhoneFrame,
  Wordmark,
  type T,
} from '../components/landing-shared'
import enSent from '../assets/shots/en-sent.webp'
import enSentOpen from '../assets/shots/en-sent-open.webp'
import enReceived0 from '../assets/shots/en-received-0.webp'
import enReceived1 from '../assets/shots/en-received-1.webp'
import enReceived2 from '../assets/shots/en-received-2.webp'
import enReceived from '../assets/shots/en-received.webp'
import enForm from '../assets/shots/en-form.webp'
import ptSent from '../assets/shots/pt-sent.webp'
import ptSentOpen from '../assets/shots/pt-sent-open.webp'
import ptReceived0 from '../assets/shots/pt-received-0.webp'
import ptReceived1 from '../assets/shots/pt-received-1.webp'
import ptReceived2 from '../assets/shots/pt-received-2.webp'
import ptReceived from '../assets/shots/pt-received.webp'
import ptForm from '../assets/shots/pt-form.webp'

// Real captures of the Android app (see godtasker-mobile/store), one set per
// language so the screenshots match the copy around them. The hero plays them
// as a short story: your sent task (collapsed → tapped open), what the other
// person sees, then the form — and loops.
type ScreenId = 'sent' | 'received' | 'form'
type FrameId =
  | 'sentCollapsed'
  | 'sentExpanded'
  | 'received0'
  | 'received1'
  | 'received2'
  | 'received3'
  | 'form'
const SHOTS: Record<Locale, Record<FrameId, string>> = {
  en: {
    sentCollapsed: enSent,
    sentExpanded: enSentOpen,
    received0: enReceived0,
    received1: enReceived1,
    received2: enReceived2,
    received3: enReceived,
    form: enForm,
  },
  pt: {
    sentCollapsed: ptSent,
    sentExpanded: ptSentOpen,
    received0: ptReceived0,
    received1: ptReceived1,
    received2: ptReceived2,
    received3: ptReceived,
    form: ptForm,
  },
}
const SCREENS: { id: ScreenId; tab: MessageKey; caption: MessageKey; alt: MessageKey }[] = [
  { id: 'sent', tab: 'screenTabYou', caption: 'screenCapYou', alt: 'shotSentAlt' },
  { id: 'received', tab: 'screenTabThem', caption: 'screenCapThem', alt: 'shotReceivedAlt' },
  { id: 'form', tab: 'screenTabForm', caption: 'screenCapForm', alt: 'shotFormAlt' },
]
// Playback order and how long each frame holds. `fast` frames are the
// subtask ticks — they snap (short crossfade) instead of dissolving.
const FRAMES: { id: FrameId; tab: ScreenId; ms: number; fast?: boolean }[] = [
  { id: 'sentCollapsed', tab: 'sent', ms: 2400 },
  { id: 'sentExpanded', tab: 'sent', ms: 3600 },
  { id: 'received0', tab: 'received', ms: 1100 },
  { id: 'received1', tab: 'received', ms: 850, fast: true },
  { id: 'received2', tab: 'received', ms: 850, fast: true },
  { id: 'received3', tab: 'received', ms: 2200, fast: true },
  { id: 'form', tab: 'form', ms: 3800 },
]

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

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
    <Tag ref={ref as never} className={`${stagger ? 'reveal-stagger' : 'reveal'} ${className}`}>
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
  checklist: 'M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v5l3 2',
  camera:
    'M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Zm8 9a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
  approve: 'M12 3l7 3v6c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6l7-3Zm-3 9 2 2 4-4',
  chat: 'M8 10h8m-8 4h5m-9 6 2.8-2.8H18a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v13Z',
  tag: 'M20.6 13.4 12 4.8A2 2 0 0 0 10.6 4H5a1 1 0 0 0-1 1v5.6c0 .5.2 1 .6 1.4l8.6 8.6a2 2 0 0 0 2.8 0l4.6-4.6a2 2 0 0 0 0-2.6ZM8 9h.01',
  home: 'M3 11.5 12 4l9 7.5M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9',
  brush:
    'M15 5.5 18.5 9m-14 9.5c1.8 0 3.5-1.5 3.5-3.5L18.5 4.5a2.1 2.1 0 0 1 3 3L11 18c0 2-1.7 3.5-3.5 3.5H4a.5.5 0 0 1-.5-.5l1-2.5Z',
  book: 'M12 6.5C10.5 5 8.4 4.5 6 4.5c-1 0-2 .1-3 .4v13.6c1-.3 2-.4 3-.4 2.4 0 4.5.5 6 2 1.5-1.5 3.6-2 6-2 1 0 2 .1 3 .4V4.9c-1-.3-2-.4-3-.4-2.4 0-4.5.5-6 2Zm0 0V20',
  briefcase:
    'M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-9 0h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm-2 5h16',
  heart:
    'M12 20s-7.5-4.6-9.3-9.1C1.5 7.7 3.6 4.5 6.8 4.5c2 0 3.7 1.1 4.6 2.8L12 8.6l.6-1.3c.9-1.7 2.6-2.8 4.6-2.8 3.2 0 5.3 3.2 4.1 6.4C19.5 15.4 12 20 12 20Z',
  dumbbell: 'M7 8v8M4 10v4m16-4v4m-3-6v8M7 12h10',
  zoom: 'M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm10 16-5.5-5.5M10 7v6m-3-3h6',
  close: 'M6 6l12 12M18 6 6 18',
} as const

function StatusPill({ t }: { t: T }) {
  return (
    <a
      href="#beta"
      className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 transition duration-200 hover:border-emerald-400 hover:bg-emerald-500/15"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:hidden" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>
      {t('statusPill')}
    </a>
  )
}

// ── hero: one big phone, three screens ───────────────────────────────────────
//
// The screenshots are the product, so they get one large frame (readable text)
// instead of a stack of small ones. Tabs switch the screen; it auto-advances
// until the visitor touches it; the phone opens full-size in a lightbox.
function ScreenSwitcher({ t, locale }: { t: T; locale: Locale }) {
  const [frame, setFrame] = useState(0)
  const [paused, setPaused] = useState(false)
  // Once the visitor picks a tab we stop hopping between tabs, but still
  // finish that tab's own sequence (collapsed → open), so the demo stays alive.
  const [manual, setManual] = useState(false)
  const [open, setOpen] = useState(false)
  const shots = SHOTS[locale]
  const current = FRAMES[frame]
  const activeTab = SCREENS.findIndex(s => s.id === current.tab)
  const screen = SCREENS[activeTab]

  useEffect(() => {
    if (paused || open || prefersReducedMotion()) return
    const next = (frame + 1) % FRAMES.length
    if (manual && FRAMES[next].tab !== current.tab) return
    const id = window.setTimeout(() => setFrame(next), current.ms)
    return () => window.clearTimeout(id)
  }, [frame, paused, open, manual, current])

  const pick = useCallback((tabIndex: number) => {
    const first = FRAMES.findIndex(f => f.tab === SCREENS[tabIndex].id)
    setFrame(first)
    setManual(true)
  }, [])

  function onTabKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = (activeTab + (e.key === 'ArrowRight' ? 1 : -1) + SCREENS.length) % SCREENS.length
    pick(next)
    ;(e.currentTarget.children[next] as HTMLElement | undefined)?.focus()
  }

  // Lightbox: Escape closes, body scroll locks while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  const stack = (className: string, eager: boolean) => (
    <div className={`relative aspect-[540/1135] ${className}`}>
      {FRAMES.map((f, i) => (
        <div
          key={f.id}
          className={`screen absolute inset-0 ${f.fast ? 'screen-fast' : ''} ${
            i === frame ? 'is-active' : 'pointer-events-none'
          }`}
          aria-hidden={i !== frame}
        >
          <FadeImg
            src={shots[f.id]}
            alt={t(SCREENS.find(s => s.id === f.tab)!.alt)}
            eager={eager}
            className="block h-full w-full object-cover object-top"
          />
        </div>
      ))}
    </div>
  )

  return (
    <div
      className="flex w-full flex-col items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* tabs */}
      <div
        role="tablist"
        aria-label="App screens"
        onKeyDown={onTabKey}
        className="flex w-full max-w-[420px] rounded-full border border-slate-800 bg-slate-900/70 p-1 text-xs font-semibold sm:text-sm"
      >
        {SCREENS.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            type="button"
            aria-selected={i === activeTab}
            tabIndex={i === activeTab ? 0 : -1}
            onClick={() => pick(i)}
            className={`flex-1 rounded-full px-2 py-1.5 transition-colors duration-300 ${
              i === activeTab
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t(s.tab)}
          </button>
        ))}
      </div>

      {/* the phone */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('screenZoom')}
        className="group relative mt-6 w-[min(82vw,340px)] rounded-[2.25rem] text-left lg:w-[360px]"
      >
        <PhoneFrame className="animate-float transition-transform duration-500 motion-safe:group-hover:scale-[1.015]">
          {stack('', true)}
        </PhoneFrame>
        <span className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-slate-950/80 px-3 py-1.5 text-xs font-medium text-slate-200 opacity-0 shadow-lg ring-1 ring-slate-700 transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <Icon d={ICONS.zoom} className="h-3.5 w-3.5" />
          {t('screenZoom')}
        </span>
      </button>

      {/* caption + progress dots (one per tab) */}
      <p
        key={`${screen.id}-${locale}`}
        className="animate-enter mt-5 max-w-[360px] text-center text-sm text-slate-400"
        style={{ animationDuration: '0.5s' }}
      >
        {t(screen.caption)}
      </p>
      <div className="mt-3 flex gap-1.5" aria-hidden>
        {SCREENS.map((s, i) => (
          <span
            key={s.id}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === activeTab ? 'w-6 bg-indigo-400' : 'w-1.5 bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* lightbox — portaled to <body>: the hero's entrance animation would
          otherwise become the containing block for position:fixed */}
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t(screen.alt)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div className="animate-pop relative w-[min(90vw,440px)]" onClick={e => e.stopPropagation()}>
              <PhoneFrame>{stack('max-h-[86vh]', true)}</PhoneFrame>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white shadow-lg ring-1 ring-slate-600 transition hover:bg-slate-700"
                aria-label={t('screenClose')}
              >
                <Icon d={ICONS.close} className="h-5 w-5" />
              </button>
              <div className="mt-3 flex justify-center gap-2">
                {SCREENS.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => pick(i)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      i === activeTab ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {t(s.tab)}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

function FeatureCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition duration-300 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-950/40 motion-safe:hover:-translate-y-1">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300">
        <Icon d={icon} className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-400">{body}</p>
    </div>
  )
}

// Nav link with an underline that grows in on hover.
function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="relative py-1 text-slate-300 transition-colors hover:text-white after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-indigo-400 after:transition-transform after:duration-300 hover:after:scale-x-100"
    >
      {children}
    </a>
  )
}

const PRIMARY_BTN =
  'inline-block rounded-lg bg-indigo-600 font-semibold text-white shadow-lg shadow-indigo-950/60 transition duration-200 hover:bg-indigo-500 motion-safe:hover:scale-[1.03] motion-safe:active:scale-[0.98]'

// ── page ──────────────────────────────────────────────────────────────────────

export function Landing() {
  const { locale, setLocale, t, switching } = useLandingLocale()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const prev = document.documentElement.lang
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : 'en'
    return () => {
      document.documentElement.lang = prev
    }
  }, [locale])

  // Header picks up a shadow once the hero scrolls under it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const features: { icon: string; title: MessageKey; body: MessageKey }[] = [
    {
      icon: ICONS.checklist,
      title: 'featChecklistTitle',
      body: 'featChecklistBody',
    },
    { icon: ICONS.clock, title: 'featDeadlineTitle', body: 'featDeadlineBody' },
    { icon: ICONS.camera, title: 'featPhotoTitle', body: 'featPhotoBody' },
    {
      icon: ICONS.approve,
      title: 'featApprovalTitle',
      body: 'featApprovalBody',
    },
    { icon: ICONS.chat, title: 'featChatTitle', body: 'featChatBody' },
    { icon: ICONS.tag, title: 'featOfferTitle', body: 'featOfferBody' },
  ]

  const sectors: { icon: string; title: MessageKey; body: MessageKey }[] = [
    {
      icon: ICONS.home,
      title: 'sectorHouseholdTitle',
      body: 'sectorHouseholdBody',
    },
    { icon: ICONS.heart, title: 'sectorFamilyTitle', body: 'sectorFamilyBody' },
    {
      icon: ICONS.briefcase,
      title: 'sectorBusinessTitle',
      body: 'sectorBusinessBody',
    },
    {
      icon: ICONS.brush,
      title: 'sectorFreelanceTitle',
      body: 'sectorFreelanceBody',
    },
    {
      icon: ICONS.book,
      title: 'sectorTutoringTitle',
      body: 'sectorTutoringBody',
    },
    {
      icon: ICONS.dumbbell,
      title: 'sectorFitnessTitle',
      body: 'sectorFitnessBody',
    },
  ]

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200">
      {/* nav */}
      <header
        className={`sticky top-0 z-20 border-b bg-slate-950/80 backdrop-blur transition-shadow duration-300 ${
          scrolled ? 'border-slate-800 shadow-lg shadow-black/30' : 'border-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a href="#top" className="shrink-0">
            <Wordmark />
          </a>
          <nav
            className={`locale-fade hidden items-center gap-6 text-sm md:flex ${switching ? 'is-switching' : ''}`}
          >
            <NavLink href="#how">{t('navHow')}</NavLink>
            <NavLink href="#features">{t('navFeatures')}</NavLink>
            <NavLink href="#use-cases">{t('navUseCases')}</NavLink>
            <NavLink href="#beta">{t('navBeta')}</NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <LangToggle locale={locale} setLocale={setLocale} />
            <div
              className={`locale-fade flex items-center gap-3 ${switching ? 'is-switching' : ''}`}
            >
              <Link
                to="/login"
                className="hidden rounded-md px-3 py-1.5 text-sm text-slate-300 transition hover:text-white sm:block"
              >
                {t('navLogIn')}
              </Link>
              <a href="#beta" className={`${PRIMARY_BTN} px-3 py-1.5 text-sm shadow-md`}>
                {t('navSignUp')}
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className={`locale-fade ${switching ? 'is-switching' : ''}`}>
        {/* hero */}
        <section id="top" className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute -top-40 left-1/2 h-[32rem] w-[42rem] -translate-x-1/2"
            aria-hidden
          >
            <div className="animate-glow h-full w-full rounded-full bg-indigo-600/20 blur-3xl" />
          </div>
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 md:grid-cols-[1.05fr_1fr] md:py-20 lg:gap-16">
            <div>
              <div className="animate-enter">
                <StatusPill t={t} />
              </div>
              <h1
                className="animate-enter text-shimmer mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
                style={{ animationDelay: '0.1s' }}
              >
                {t('heroTitle')}
              </h1>
              <p
                className="animate-enter mt-4 max-w-xl text-lg text-slate-400"
                style={{ animationDelay: '0.2s' }}
              >
                {t('heroSubtitle')}
              </p>
              <div
                className="animate-enter mt-8 flex flex-wrap items-center gap-4"
                style={{ animationDelay: '0.3s' }}
              >
                <a href="#beta" className={`${PRIMARY_BTN} px-6 py-3 text-base`}>
                  {t('heroCta')}
                </a>
                <Link
                  to="/login?mode=register"
                  className="group text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                >
                  {t('heroSecondary')}{' '}
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
              <p
                className="animate-enter mt-5 text-xs text-slate-500"
                style={{ animationDelay: '0.4s' }}
              >
                {t('heroNote')}
              </p>
            </div>

            <div className="animate-enter" style={{ animationDelay: '0.35s' }}>
              <ScreenSwitcher t={t} locale={locale} />
            </div>
          </div>
        </section>

        {/* how it works — the send-to-someone-else loop, spelled out */}
        <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
          <Reveal>
            <h2 className="text-center text-3xl font-bold tracking-tight text-white">
              {t('howTitle')}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-center text-lg text-indigo-300">
              {t('howSubtitle')}
            </p>
          </Reveal>
          <Reveal stagger className="mt-10 grid gap-4 md:grid-cols-3">
            {(
              [
                ['1', 'howStep1Title', 'howStep1Body'],
                ['2', 'howStep2Title', 'howStep2Body'],
                ['3', 'howStep3Title', 'howStep3Body'],
              ] as [string, MessageKey, MessageKey][]
            ).map(([n, title, body]) => (
              <div
                key={n}
                className="relative rounded-xl border border-slate-800 bg-slate-900/60 p-6 pt-8 transition duration-300 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-950/40 motion-safe:hover:-translate-y-1"
              >
                <span className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-950/60">
                  {n}
                </span>
                <h3 className="font-semibold text-white">{t(title)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{t(body)}</p>
              </div>
            ))}
          </Reveal>
        </section>

        {/* features */}
        <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
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

        {/* beta — the closed-testing steps, right on the page */}
        <section
          id="beta"
          className="scroll-mt-20 border-y border-slate-800/60 bg-slate-950/60 py-16"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <div className="text-center">
                <StatusPill t={t} />
              </div>
              <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-white">
                {t('betaTitle')}
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-center text-slate-400">
                {t('betaSubtitle')}
              </p>
            </Reveal>
            <Reveal className="mt-12">
              <BetaSteps t={t} />
            </Reveal>
          </div>
        </section>

        {/* use cases */}
        <section id="use-cases" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
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
                className="flex gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition duration-300 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-950/40 motion-safe:hover:-translate-y-1"
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
            <p className="relative mx-auto mt-3 max-w-xl text-slate-400">{t('ctaBody')}</p>
            <a href="#beta" className={`${PRIMARY_BTN} relative mt-8 px-8 py-3 text-base`}>
              {t('ctaButton')}
            </a>
          </Reveal>
        </section>

        {/* footer */}
        <footer className="border-t border-slate-800/60">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
            <Wordmark />
            <p className="text-xs text-slate-500">© 2026 LalaTask — {t('footerTagline')}</p>
            <div className="flex items-center gap-4">
              <Link
                to="/privacy"
                className="text-xs text-slate-400 transition-colors hover:text-white"
              >
                {t('footerPrivacy')}
              </Link>
              <Link
                to="/terms"
                className="text-xs text-slate-400 transition-colors hover:text-white"
              >
                {t('footerTerms')}
              </Link>
              <Link
                to="/delete-account"
                className="text-xs text-slate-400 transition-colors hover:text-white"
              >
                {t('footerDeleteAccount')}
              </Link>
              <LangToggle locale={locale} setLocale={setLocale} />
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
