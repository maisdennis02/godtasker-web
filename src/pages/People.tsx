import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../auth/AuthContext'
import { Button, Input } from '../components/ui'
import { UserActionsMenu } from '../components/UserActionsMenu'
import { Avatar, displayName } from '../components/Avatar'
import type { User } from '../types'

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
        className="group inline-flex flex-1 items-center justify-center rounded-md bg-emerald-600/20 px-2 py-1 text-xs font-medium text-emerald-300 transition hover:bg-rose-600/20 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
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
      className="flex-1 bg-slate-700 px-2 py-1 text-xs hover:bg-slate-600"
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
  onOpen,
}: {
  person: User
  followed: boolean
  pending: boolean
  onToggleFollow: () => void
  onChat: () => void
  onOpen: () => void
}) {
  // Blocked people are filtered out of the list, so the menu here only ever
  // offers Block/Report — but pass the real flag in case that changes.
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
      <button
        type="button"
        onClick={onOpen}
        className="flex flex-col gap-1.5 text-left"
        aria-label={`View ${displayName(person)}'s profile`}
      >
        <div className="flex items-center gap-2.5">
          <Avatar user={person} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-100 hover:text-white">
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
              <p className="line-clamp-1 text-xs text-slate-500">{person.bio}</p>
            )}
          </div>
        )}
      </button>

      <div className="mt-auto flex items-stretch gap-1.5">
        <FollowButton
          followed={followed}
          pending={pending}
          onClick={onToggleFollow}
        />
        <Button className="flex-1 px-2 py-1 text-xs" onClick={onChat}>
          Chat
        </Button>
        <UserActionsMenu target={person} blocked={false} />
      </div>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="grid animate-pulse gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-24 rounded-lg border border-slate-800 bg-slate-900/60"
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

  // My own record carries blocked_list — hide anyone I've blocked.
  const myRecord = (data ?? []).find(u => u.id === user?.id)
  const blockedEmails = new Set(myRecord?.blocked_list ?? [])

  const visible = (data ?? []).filter(
    u => u.id !== user?.id && !blockedEmails.has(u.email)
  )

  const query = filter.trim().toLowerCase()
  const people = visible.filter(u => {
    if (!query) return true
    return (
      displayName(u).toLowerCase().includes(query) ||
      (u.email ?? '').toLowerCase().includes(query)
    )
  })

  const hasPeople = visible.length > 0

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-white">People</h2>
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

      <div className="relative mb-3 max-w-xs">
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
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
              onOpen={() => navigate(`/people/${p.id}`)}
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
