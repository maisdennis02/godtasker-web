import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import detectiveUrl from '../assets/detective.svg'
import { api } from '../lib/api'
import { useLandingLocale } from '../i18n/landing'
import type { Locale } from '../i18n/landing'

// Public account-deletion page — Google Play requires a web URL where users
// can request deletion without reinstalling the app (listed in the Data
// Safety form). Mirrors the in-app flow: sign in with email + password, then
// the owner-only DELETE /users/:id cascades conversations and follow rows.
// Styled after Privacy.tsx so the public pages read as one set.

type Copy = {
  title: string
  intro: string[]
  whatTitle: string
  what: string[]
  inAppTitle: string
  inApp: string
  formTitle: string
  email: string
  password: string
  submit: string
  deleting: string
  confirmPrompt: string
  doneTitle: string
  done: string
  failed: string
  badCredentials: string
  back: string
}

const CONTENT: Record<Locale, Copy> = {
  en: {
    title: 'Delete your account',
    intro: [
      'You can permanently delete your GodTasker account here, or from inside the app (Profile → Delete account). Both do exactly the same thing.',
    ],
    whatTitle: 'What gets deleted',
    what: [
      'Your account and profile (name, email, photo, bio, social links).',
      'Your conversations and chat messages.',
      'Your follow connections (followers and following).',
      'Deletion is immediate and cannot be undone. Tasks you exchanged with other people may remain visible to them, without your account attached.',
    ],
    inAppTitle: 'Delete from the app',
    inApp: 'Open GodTasker → Profile tab → Delete account, and confirm.',
    formTitle: 'Delete from this page',
    email: 'Email',
    password: 'Password',
    submit: 'Delete my account permanently',
    deleting: 'Deleting…',
    confirmPrompt:
      'This permanently deletes your account, conversations, and follow connections. This cannot be undone. Continue?',
    doneTitle: 'Account deleted',
    done: 'Your account and associated data have been deleted. Thank you for trying GodTasker.',
    failed: 'Something went wrong. Please try again.',
    badCredentials: 'Email or password is incorrect.',
    back: 'Back to home',
  },
  pt: {
    title: 'Excluir sua conta',
    intro: [
      'Você pode excluir sua conta do GodTasker permanentemente aqui, ou pelo aplicativo (Perfil → Excluir conta). As duas opções fazem exatamente a mesma coisa.',
    ],
    whatTitle: 'O que é excluído',
    what: [
      'Sua conta e perfil (nome, e-mail, foto, bio, redes sociais).',
      'Suas conversas e mensagens de chat.',
      'Suas conexões de seguir (seguidores e seguindo).',
      'A exclusão é imediata e não pode ser desfeita. Tarefas trocadas com outras pessoas podem continuar visíveis para elas, sem a sua conta vinculada.',
    ],
    inAppTitle: 'Excluir pelo aplicativo',
    inApp: 'Abra o GodTasker → aba Perfil → Excluir conta, e confirme.',
    formTitle: 'Excluir por esta página',
    email: 'E-mail',
    password: 'Senha',
    submit: 'Excluir minha conta permanentemente',
    deleting: 'Excluindo…',
    confirmPrompt:
      'Isso exclui permanentemente sua conta, conversas e conexões de seguir. Não pode ser desfeito. Continuar?',
    doneTitle: 'Conta excluída',
    done: 'Sua conta e os dados associados foram excluídos. Obrigado por experimentar o GodTasker.',
    failed: 'Algo deu errado. Tente novamente.',
    badCredentials: 'E-mail ou senha incorretos.',
    back: 'Voltar ao início',
  },
}

export function DeleteAccount() {
  const { locale, setLocale } = useLandingLocale()
  const c = CONTENT[locale]

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const prevTitle = document.title
    const prevLang = document.documentElement.lang
    document.title = `${c.title} · GodTasker`
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : 'en'
    return () => {
      document.title = prevTitle
      document.documentElement.lang = prevLang
    }
  }, [c.title, locale])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!window.confirm(c.confirmPrompt)) return
    setLoading(true)
    try {
      // Authenticate outside the app's AuthContext so this page never
      // creates a persisted session.
      const { data } = await api.post<{ user: { id: number }; token: string }>('/sessions', {
        email: email.trim(),
        password,
      })
      await api.delete(`/users/${data.user.id}`, {
        headers: { Authorization: `Bearer ${data.token}` },
      })
      setDone(true)
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status
      setError(status === 401 ? c.badCredentials : c.failed)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200">
      <header className="sticky top-0 z-20 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={detectiveUrl} alt="" className="h-7 w-7" />
            <span className="text-lg font-bold tracking-tight text-white">GodTasker</span>
          </Link>
          <div className="flex overflow-hidden rounded-full border border-slate-700 text-xs font-semibold">
            {(['en', 'pt'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLocale(l)}
                className={`px-2.5 py-1 transition ${
                  locale === l ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {l === 'en' ? 'EN' : 'PT'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">{c.title}</h1>

        <div className="mt-6 space-y-4">
          {c.intro.map((p, i) => (
            <p key={i} className="leading-relaxed text-slate-300">
              {p}
            </p>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white">{c.whatTitle}</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            {c.what.map((p, i) => (
              <li key={i} className="leading-relaxed text-slate-300">
                {p}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white">{c.inAppTitle}</h2>
          <p className="mt-2 leading-relaxed text-slate-300">{c.inApp}</p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white">{c.formTitle}</h2>
          {done ? (
            <div className="mt-4 rounded-lg border border-emerald-800/60 bg-emerald-950/40 p-4">
              <p className="font-semibold text-emerald-300">{c.doneTitle}</p>
              <p className="mt-1 text-sm text-emerald-200/80">{c.done}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-4 max-w-sm space-y-4">
              <label className="block">
                <span className="text-sm text-slate-400">{c.email}</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-indigo-500"
                />
              </label>
              <label className="block">
                <span className="text-sm text-slate-400">{c.password}</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-indigo-500"
                />
              </label>

              {error && <p className="text-sm text-rose-400">{error}</p>}

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full rounded-lg bg-rose-700 px-4 py-2 font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? c.deleting : c.submit}
              </button>
            </form>
          )}
        </section>

        <div className="mt-12 border-t border-slate-800/60 pt-6">
          <Link to="/" className="text-sm text-indigo-400 hover:text-indigo-300">
            ← {c.back}
          </Link>
        </div>
      </main>
    </div>
  )
}
