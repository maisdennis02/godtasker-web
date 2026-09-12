import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLandingLocale } from '../i18n/landing'
import { BetaSteps, LangToggle, Wordmark } from '../components/landing-shared'

// Standalone closed-testing page: the "link in bio" target for reels and the
// URL we hand to anyone who wants to try the Android beta. Same steps as the
// #beta section on the landing page.
export function Beta() {
  const { locale, setLocale, t, switching } = useLandingLocale()

  useEffect(() => {
    const prevLang = document.documentElement.lang
    const prevTitle = document.title
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : 'en'
    document.title = `${t('betaTitle')} — LalaTask`
    return () => {
      document.documentElement.lang = prevLang
      document.title = prevTitle
    }
  }, [locale, t])

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200">
      <header className="border-b border-slate-800/60">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/">
            <Wordmark />
          </Link>
          <LangToggle locale={locale} setLocale={setLocale} />
        </div>
      </header>
      <main className={`locale-fade mx-auto max-w-4xl px-4 py-12 sm:px-6 ${switching ? 'is-switching' : ''}`}>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {t('statusPill')}
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {t('betaTitle')}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-400">{t('betaSubtitle')}</p>
        <div className="mt-10">
          <BetaSteps t={t} />
        </div>
        <p className="mt-12 text-sm">
          <Link to="/" className="text-indigo-400 hover:text-indigo-300">
            ← {t('betaBack')}
          </Link>
        </p>
      </main>
    </div>
  )
}
