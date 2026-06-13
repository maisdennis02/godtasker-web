import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../auth/AuthContext'
import { Button, Input } from '../components/ui'
import type { User } from '../types'

export function People() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['people'],
    queryFn: async () => {
      const res = await api.get('/users')
      return res.data as User[]
    },
  })

  const follow = useMutation({
    mutationFn: async (target: User) => {
      await api.post('/users/following', {
        user_email: user?.email,
        target_email: target.email,
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dashboard'] }),
  })

  const people = (data ?? [])
    .filter(u => u.id !== user?.id)
    .filter(u =>
      (u.user_name ?? '').toLowerCase().includes(filter.toLowerCase())
    )

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-white">People</h2>
      <p className="mb-4 text-sm text-slate-400">
        Everyone is a peer — follow people, chat, or send them a task.
      </p>
      <div className="mb-4 max-w-xs">
        <Input
          placeholder="Search people by name…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>

      {isLoading && <p className="text-slate-400">Loading…</p>}
      {error && <p className="text-rose-400">Failed to load people.</p>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {people.map(p => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 p-3"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-100">
                {p.user_name ?? `user #${p.id}`}
              </p>
              <p className="truncate text-xs text-slate-500">{p.email}</p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Button
                className="bg-slate-700 hover:bg-slate-600"
                onClick={() => follow.mutate(p)}
                disabled={follow.isPending}
              >
                Follow
              </Button>
              <Button
                onClick={() =>
                  navigate(`/chat?peer=${encodeURIComponent(p.email)}`)
                }
              >
                Chat
              </Button>
            </div>
          </div>
        ))}
      </div>

      {data && people.length === 0 && (
        <p className="text-slate-500">No people found.</p>
      )}
    </div>
  )
}
