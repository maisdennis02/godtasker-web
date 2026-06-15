import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../auth/AuthContext'
import { Button, Input } from '../components/ui'
import type { User } from '../types'

// Deterministic avatar tint so each person keeps the same color across renders.
const AVATAR_TINTS = [
  'bg-indigo-500/20 text-indigo-300',
  'bg-emerald-500/20 text-emerald-300',
  'bg-amber-500/20 text-amber-300',
  'bg-rose-500/20 text-rose-300',
  'bg-sky-500/20 text-sky-300',
  'bg-violet-500/20 text-violet-300',
]

function displayName(u: User): string {
  const full = [u.first_name, u.last_name].filter(Boolean).join(' ').trim()
  return u.user_name || full || `user #${u.id}`
}

function initials(u: User): string {
  const name = displayName(u)
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function Avatar({ person }: { person: User }) {
  const tint = AVATAR_TINTS[person.id % AVATAR_TINTS.length]
  if (person.avatar?.url) {
    return (
      <img
        src={person.avatar.url}
        alt=""
        className="h-10 w-10 shrink-0 rounded-full object-cover"
      />
    )
  }
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${tint}`}
    >
      {initials(person)}
    </div>
  )
}

function FollowButton({
  followed,
  pending,
  onClick,
}: {
  followed: boolean
  pending: boolean
  onClick: () => void
}) {
  if (followed) {
    // Shows "Following ✓" at rest, swaps to a rose "Unfollow" on hover/focus.
    return (
      <button
        onClick={onClick}
        disabled={pending}
        className="group inline-flex flex-1 items-center justify-center rounded-md bg-emerald-600/20 px-3 py-1.5 text-sm font-medium text-emerald-300 transition hover:bg-rose-600/20 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? (
          'Working…'
        ) : (
          <>
            <span className="group-hover:hidden">Following ✓</span>
            <span className="hidden group-hover:inline">Unfollow</span>
          </>
        )}
      </button>
    )
  }
  return (
    <Button
      className="flex-1 bg-slate-700 hover:bg-slate-600"
      onClick={onClick}
      disabled={pending}
    >
      {pending ? 'Following…' : 'Follow'}
    </Button>
  )
}

function PersonCard({
  person,
  followed,
  pending,
  onToggleFollow,
  onChat,
}: {
  person: User
  followed: boolean
  pending: boolean
  onToggleFollow: () => void
  onChat: () => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center gap-3">
        <Avatar person={person} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-slate-100">
            {displayName(person)}
          </p>
          <p className="truncate text-xs text-slate-500">{person.email}</p>
        </div>
        {typeof person.points === 'number' && (
          <span className="shrink-0 rounded bg-slate-800 px-1.5 py-0.5 text-[11px] font-medium text-amber-300">
            {person.points} pts
          </span>
        )}
      </div>

      {(person.occupation || person.bio) && (
        <div className="min-w-0">
          {person.occupation && (
            <p className="truncate text-xs font-medium text-slate-400">
              {person.occupation}
            </p>
          )}
          {person.bio && (
            <p className="line-clamp-2 text-xs text-slate-500">{person.bio}</p>
          )}
        </div>
      )}

      <div className="mt-auto flex gap-1.5">
        <FollowButton
          followed={followed}
          pending={pending}
          onClick={onToggleFollow}
        />
        <Button className="flex-1" onClick={onChat}>
          Chat
        </Button>
      </div>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="grid animate-pulse gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-36 rounded-lg border border-slate-800 bg-slate-900/60"
        />
      ))}
    </div>
  )
}

export function People() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('')
  const [pendingId, setPendingId] = useState<number | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['people'],
    queryFn: async () => {
      const res = await api.get('/users')
      return res.data as User[]
    },
  })

  // Who I currently follow — the source of truth for each card's Follow/Unfollow state.
  const followingQuery = useQuery({
    queryKey: ['following', user?.user_name],
    enabled: !!user?.user_name,
    queryFn: async () => {
      const res = await api.get('/users/following', {
        params: { contactName: user?.user_name, nameFilter: '' },
      })
      return res.data as User[]
    },
  })
  const followedIds = new Set((followingQuery.data ?? []).map(u => u.id))

  const toggleFollow = useMutation({
    mutationFn: async ({ target, following }: { target: User; following: boolean }) => {
      setPendingId(target.id)
      const body = { user_email: user?.email, target_email: target.email }
      // POST = follow, PUT = unfollow (see UserFollowingController).
      if (following) await api.put('/users/following', body)
      else await api.post('/users/following', body)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['following'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onSettled: () => setPendingId(null),
  })

  const query = filter.trim().toLowerCase()
  const people = (data ?? [])
    .filter(u => u.id !== user?.id)
    .filter(u => {
      if (!query) return true
      return (
        displayName(u).toLowerCase().includes(query) ||
        (u.email ?? '').toLowerCase().includes(query)
      )
    })

  const hasPeople = (data ?? []).filter(u => u.id !== user?.id).length > 0

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-white">People</h2>
          <p className="mt-1 text-sm text-slate-400">
            Everyone is a peer — follow people, chat, or send them a task.
          </p>
        </div>
        {data && (
          <span className="text-xs text-slate-500">
            {people.length} {people.length === 1 ? 'person' : 'people'}
            {query && ' matched'}
          </span>
        )}
      </div>

      <div className="relative mb-4 max-w-xs">
        <Input
          placeholder="Search by name or email…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        {filter && (
          <button
            onClick={() => setFilter('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {isLoading && <Skeleton />}
      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          Failed to load people. Make sure the server is running.
        </div>
      )}

      {data && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {people.map(p => (
            <PersonCard
              key={p.id}
              person={p}
              followed={followedIds.has(p.id)}
              pending={pendingId === p.id}
              onToggleFollow={() =>
                toggleFollow.mutate({
                  target: p,
                  following: followedIds.has(p.id),
                })
              }
              onChat={() =>
                navigate(`/chat?peer=${encodeURIComponent(p.email)}`)
              }
            />
          ))}
        </div>
      )}

      {data && people.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-800 p-8 text-center">
          <p className="text-sm text-slate-400">
            {!hasPeople
              ? 'No one else is here yet.'
              : `No people match "${filter}".`}
          </p>
          {query && hasPeople && (
            <button
              onClick={() => setFilter('')}
              className="mt-2 text-xs font-medium text-indigo-400 hover:text-indigo-300"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  )
}
