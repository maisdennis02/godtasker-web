import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../auth/AuthContext'
import { BLOCKS_KEY, useBlockedEmails } from '../lib/blocks'
import { Button, Card } from '../components/ui'
import { UserActionsMenu } from '../components/UserActionsMenu'
import type { Offering, User } from '../types'

// Deterministic avatar tint, matching the People list.
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
  return u.user_name || full || u.email || `user #${u.id}`
}

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function instagramUrl(handle: string): string {
  const h = handle.trim().replace(/^@/, '')
  return `https://instagram.com/${h}`
}

function externalUrl(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

function OfferingCard({
  offering,
  onRequest,
  requesting,
}: {
  offering: Offering
  onRequest: () => void
  requesting: boolean
}) {
  const steps = Array.isArray(offering.sub_task_list)
    ? offering.sub_task_list.length
    : 0
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 font-medium text-slate-100">
          {offering.name || `Offering #${offering.id}`}
        </p>
        {offering.price != null && (
          <span className="shrink-0 rounded bg-emerald-500/15 px-1.5 py-0.5 text-xs font-medium text-emerald-300">
            ${offering.price}
          </span>
        )}
      </div>

      {offering.description && (
        <p className="line-clamp-3 text-xs text-slate-400">
          {offering.description}
        </p>
      )}

      <div className="flex gap-3 text-xs text-slate-500">
        {offering.tenure != null && offering.tenure > 0 && (
          <span>
            {offering.tenure} day{offering.tenure === 1 ? '' : 's'}
          </span>
        )}
        {steps > 0 && (
          <span>
            {steps} step{steps === 1 ? '' : 's'}
          </span>
        )}
      </div>

      <Button
        className="mt-1 w-full"
        onClick={onRequest}
        disabled={requesting}
      >
        {requesting ? 'Requesting…' : 'Request'}
      </Button>
    </div>
  )
}

function OfferingsSkeleton() {
  return (
    <div className="grid animate-pulse gap-3 sm:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="h-32 rounded-lg border border-slate-800 bg-slate-900/60"
        />
      ))}
    </div>
  )
}

export function PersonProfile() {
  const { id } = useParams()
  const personId = Number(id)
  const { user } = useAuth()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [requestingId, setRequestingId] = useState<number | null>(null)
  const [followPending, setFollowPending] = useState(false)

  const personQ = useQuery({
    queryKey: ['person', personId],
    enabled: Number.isFinite(personId),
    queryFn: async () =>
      (await api.get(`/users/${personId}`)).data as User,
  })

  // Reuses the same cache key as the Offerings browse panel.
  const offeringsQ = useQuery({
    queryKey: ['offerings', 'browse', String(personId)],
    enabled: Number.isFinite(personId),
    queryFn: async () =>
      (
        await api.get('/offerings', { params: { creator_id: personId } })
      ).data as { offerings: Offering[]; displays: Offering[] },
  })

  // Who I follow — drives the Follow/Unfollow button state.
  const followingQ = useQuery({
    queryKey: ['following', user?.user_name],
    enabled: !!user?.user_name,
    queryFn: async () => {
      const res = await api.get('/users/following', {
        params: { contactName: user?.user_name, nameFilter: '' },
      })
      return res.data as User[]
    },
  })
  const followed = new Set((followingQ.data ?? []).map(u => u.id)).has(personId)

  const toggleFollow = useMutation({
    mutationFn: async () => {
      setFollowPending(true)
      const body = { user_email: user?.email, target_email: personQ.data?.email }
      if (followed) await api.put('/users/following', body)
      else await api.post('/users/following', body)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['following'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onSettled: () => setFollowPending(false),
  })

  const request = useMutation({
    mutationFn: async (offeringId: number) => {
      setRequestingId(offeringId)
      await api.post(`/offerings/${offeringId}/request`, {})
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
    onSettled: () => setRequestingId(null),
  })

  const blockedEmails = useBlockedEmails()

  const unblock = useMutation({
    mutationFn: async (email: string) => {
      await api.put('/users/unblock', {
        email: user?.email,
        unblocker_email: email,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BLOCKS_KEY })
      qc.invalidateQueries({ queryKey: ['people'] })
    },
  })

  // Viewing your own card → send to the editable profile instead.
  if (user && personId === user.id) return <Navigate to="/profile" replace />

  if (!Number.isFinite(personId)) return <Navigate to="/people" replace />

  const person = personQ.data
  const offerings = offeringsQ.data?.displays ?? []
  const blocked = !!person && blockedEmails.has(person.email)

  return (
    <div className="mx-auto max-w-2xl">
      <button
        type="button"
        onClick={() => navigate('/people')}
        className="mb-4 text-sm text-slate-400 transition hover:text-slate-200"
      >
        ← Back to people
      </button>

      {personQ.isLoading && (
        <div className="h-48 animate-pulse rounded-lg border border-slate-800 bg-slate-900/60" />
      )}

      {personQ.error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          Failed to load this profile. Make sure the server is running.
        </div>
      )}

      {person && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-start gap-4">
              {person.avatar?.url ? (
                <img
                  src={person.avatar.url}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div
                  className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-xl font-semibold ${
                    AVATAR_TINTS[person.id % AVATAR_TINTS.length]
                  }`}
                >
                  {initials(displayName(person))}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-slate-100">
                      {displayName(person)}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {person.email}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {typeof person.points === 'number' && (
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] font-medium text-amber-300">
                        {person.points} pts
                      </span>
                    )}
                    {!blocked && (
                      <UserActionsMenu target={person} blocked={false} />
                    )}
                  </div>
                </div>
                {person.occupation && (
                  <p className="mt-1 text-sm font-medium text-slate-400">
                    {person.occupation}
                  </p>
                )}
                <div className={`mt-3 flex gap-2 ${blocked ? 'hidden' : ''}`}>
                  {followed ? (
                    <button
                      onClick={() => toggleFollow.mutate()}
                      disabled={followPending}
                      className="group inline-flex items-center justify-center rounded-md bg-emerald-600/20 px-3 py-1.5 text-sm font-medium text-emerald-300 transition hover:bg-rose-600/20 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {followPending ? (
                        'Working…'
                      ) : (
                        <>
                          <span className="group-hover:hidden">Following ✓</span>
                          <span className="hidden group-hover:inline">
                            Unfollow
                          </span>
                        </>
                      )}
                    </button>
                  ) : (
                    <Button
                      className="bg-slate-700 hover:bg-slate-600"
                      onClick={() => toggleFollow.mutate()}
                      disabled={followPending}
                    >
                      {followPending ? 'Following…' : 'Follow'}
                    </Button>
                  )}
                  <Button
                    onClick={() =>
                      navigate(`/chat?peer=${encodeURIComponent(person.email)}`)
                    }
                  >
                    Chat
                  </Button>
                </div>
              </div>
            </div>

            {blocked && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
                <span>
                  You’ve blocked this person. They’re hidden from your lists.
                </span>
                <button
                  type="button"
                  onClick={() => unblock.mutate(person.email)}
                  disabled={unblock.isPending}
                  className="rounded-md border border-rose-500/40 px-3 py-1 text-xs font-medium text-rose-200 transition hover:bg-rose-500/20 disabled:opacity-50"
                >
                  {unblock.isPending ? 'Unblocking…' : 'Unblock'}
                </button>
              </div>
            )}

            {!blocked && person.bio && (
              <p className="mt-4 whitespace-pre-wrap border-t border-slate-800 pt-3 text-sm text-slate-300">
                {person.bio}
              </p>
            )}

            {!blocked && (person.instagram || person.linkedin) && (
              <div className="mt-3 space-y-1.5 border-t border-slate-800 pt-3 text-xs">
                {person.instagram && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Instagram</span>
                    <a
                      href={instagramUrl(person.instagram)}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-indigo-400 hover:text-indigo-300"
                    >
                      {person.instagram}
                    </a>
                  </div>
                )}
                {person.linkedin && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">LinkedIn</span>
                    <a
                      href={externalUrl(person.linkedin)}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-indigo-400 hover:text-indigo-300"
                    >
                      {person.linkedin}
                    </a>
                  </div>
                )}
              </div>
            )}
          </Card>

          {!blocked && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-200">
              Offerings
            </h3>
            {offeringsQ.isLoading && <OfferingsSkeleton />}
            {offerings.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {offerings.map(o => (
                  <OfferingCard
                    key={o.id}
                    offering={o}
                    requesting={requestingId === o.id}
                    onRequest={() => request.mutate(o.id)}
                  />
                ))}
              </div>
            )}
            {offeringsQ.data && offerings.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-800 p-6 text-center text-sm text-slate-400">
                {displayName(person)} has no offerings yet.
              </div>
            )}
            {request.isSuccess && (
              <p className="mt-2 text-sm text-emerald-400">
                Requested — a task was created and now appears in your Sent tasks.
              </p>
            )}
            {request.error && (
              <p className="mt-2 text-sm text-rose-400">
                {(request.error as Error).message}
              </p>
            )}
          </div>
          )}
        </div>
      )}
    </div>
  )
}
