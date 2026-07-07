import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Button, Card, Field, Input } from '../components/ui'

export function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  // The landing page's "Sign up" CTAs deep-link to /login?mode=register.
  const [mode, setMode] = useState<'login' | 'register'>(
    params.get('mode') === 'register' ? 'register' : 'login'
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userName, setUserName] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register({
          user_name: userName,
          email,
          password,
        })
      }
      navigate('/')
    } catch (err) {
      const e2 = err as { response?: { data?: { error?: string } }; message?: string }
      setError(e2.response?.data?.error ?? e2.message ?? 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
      <Card
        className="w-full max-w-sm"
        title={mode === 'login' ? 'Welcome back' : 'Create your account'}
      >
        <form onSubmit={submit} className="flex flex-col gap-3">
          {mode === 'register' && (
            <Field label="Username">
              <Input
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="how people will see you"
                required
              />
            </Field>
          )}
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </Field>

          {error && (
            <p className="rounded-md border border-rose-900 bg-rose-950/50 p-2 text-xs text-rose-300">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </Button>
        </form>
        <button
          className="mt-3 text-xs text-indigo-400 hover:text-indigo-300"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setError(null)
          }}
        >
          {mode === 'login'
            ? 'Need an account? Register'
            : 'Have an account? Log in'}
        </button>
      </Card>
      <Link to="/" className="text-xs text-slate-500 hover:text-slate-300">
        ← Back to home
      </Link>
    </div>
  )
}
