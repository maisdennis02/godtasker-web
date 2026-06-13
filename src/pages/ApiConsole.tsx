import { useState } from 'react'
import { ENDPOINTS, GROUPS } from '../api/endpoints'
import { EndpointCard } from '../components/EndpointCard'

export function ApiConsole() {
  const [group, setGroup] = useState<string>(GROUPS[0])
  const endpoints = ENDPOINTS.filter(e => e.group === group)

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-white">API Console</h2>
      <p className="mb-4 text-sm text-slate-400">
        Every endpoint the service exposes ({ENDPOINTS.length} total). Token is
        attached automatically.
      </p>

      <div className="mb-5 flex flex-wrap gap-2">
        {GROUPS.map(g => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            className={`rounded-full px-3 py-1 text-sm transition ${
              g === group
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {endpoints.map(spec => (
          <EndpointCard key={`${spec.method} ${spec.path}`} spec={spec} />
        ))}
      </div>
    </div>
  )
}
