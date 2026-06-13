import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Button, Card, Field, Input } from '../components/ui'

export function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState('alice@test.com')
  const [password, setPassword] = useState('password123')
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
    <div className="flex h-full items-center justify-center p-6">
      <Card className="w-full max-w-sm" title={`GodTasker — ${mode}`}>
        <form onSubmit={submit} className="flex flex-col gap-3">
          {mode === 'register' && (
            <Field label="user_name">
              <Input value={userName} onChange={e => setUserName(e.target.value)} required />
            </Field>
          )}
          <Field label="email">
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </Field>
          <Field label="password">
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
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
    </div>
  )
}
