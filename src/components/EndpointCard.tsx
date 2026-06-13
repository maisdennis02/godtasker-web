import { useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../auth/AuthContext'
import { localToISO } from '../lib/format'
import type { EndpointSpec } from '../api/endpoints'
import { Badge, Button, Field, Input, Textarea } from './ui'
import { DataResult } from './DataResult'

const methodColor: Record<string, string> = {
  GET: 'text-emerald-400',
  POST: 'text-sky-400',
  PUT: 'text-amber-400',
  DELETE: 'text-rose-400',
}

// Pre-fill defaults that depend on the logged-in identity.
function resolveDefault(def: string | undefined, email: string, id: number) {
  if (!def) return ''
  return def.replace('{email}', email).replace('{id}', String(id))
}

export function EndpointCard({ spec }: { spec: EndpointSpec }) {
  const { user } = useAuth()
  const email = user?.email ?? ''
  const id = user?.id ?? 0

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    spec.fields?.forEach(f => {
      init[f.name] = resolveDefault(f.default, email, id)
    })
    return init
  })
  const [result, setResult] = useState<unknown>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function set(name: string, value: string) {
    setValues(prev => ({ ...prev, [name]: value }))
  }

  async function run() {
    setLoading(true)
    setError(null)
    setResult(undefined)
    try {
      let path = spec.path
      const query: Record<string, string> = {}
      const body: Record<string, unknown> = {}

      spec.fields?.forEach(f => {
        const raw = values[f.name]
        if (raw === '' || raw === undefined) return
        const str = f.type === 'datetime' ? localToISO(raw) : String(raw)
        if (f.in === 'path') path = path.replace(`:${f.name}`, str)
        else if (f.in === 'query') query[f.name] = str
        else body[f.name] = f.type === 'number' ? Number(raw) : str
      })

      const { data } = await api.request({
        method: spec.method,
        url: path,
        params: query,
        data: ['POST', 'PUT'].includes(spec.method) ? body : undefined,
      })
      setResult(data)
    } catch (err) {
      const e = err as { response?: { status?: number; data?: unknown }; message?: string }
      setError(
        e.response
          ? `${e.response.status}: ${JSON.stringify(e.response.data)}`
          : e.message ?? 'Request failed'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-1 flex items-center gap-2">
        <span className={`font-mono text-xs font-bold ${methodColor[spec.method]}`}>
          {spec.method}
        </span>
        <Badge>{spec.path}</Badge>
      </div>
      <p className="mb-3 text-sm font-medium text-slate-200">{spec.label}</p>

      {spec.fields && spec.fields.length > 0 && (
        <div className="mb-3 grid gap-2 sm:grid-cols-2">
          {spec.fields.map(f => (
            <Field key={f.name} label={`${f.name} (${f.in})`}>
              {f.type === 'textarea' ? (
                <Textarea
                  rows={2}
                  value={values[f.name]}
                  placeholder={f.placeholder}
                  onChange={e => set(f.name, e.target.value)}
                />
              ) : f.type === 'datetime' ? (
                <Input
                  type="datetime-local"
                  className="[color-scheme:dark]"
                  value={values[f.name]}
                  onChange={e => set(f.name, e.target.value)}
                />
              ) : (
                <Input
                  type={f.type === 'number' ? 'number' : 'text'}
                  value={values[f.name]}
                  placeholder={f.placeholder}
                  onChange={e => set(f.name, e.target.value)}
                />
              )}
            </Field>
          ))}
        </div>
      )}

      <Button onClick={run} disabled={loading}>
        {loading ? 'Running…' : 'Send request'}
      </Button>

      {error && (
        <p className="mt-3 rounded-md border border-rose-900 bg-rose-950/50 p-2 text-xs text-rose-300">
          {error}
        </p>
      )}
      {result !== undefined && (
        <div className="mt-3">
          <DataResult data={result} />
        </div>
      )}
    </div>
  )
}
