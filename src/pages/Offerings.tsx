import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuth } from '../auth/AuthContext'
import { Button, Card, Field, Input, Textarea } from '../components/ui'
import type { Offering, User } from '../types'

// A label/value row inside the expanded panel — skips empty values.
function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right text-slate-300">{value}</span>
    </div>
  )
}

// The full set of offering fields, shown when a card is expanded.
function OfferingDetails({ offering }: { offering: Offering }) {
  const creator = offering.creator
  const creatorLabel = creator
    ? creator.user_name ||
      [creator.first_name, creator.last_name].filter(Boolean).join(' ').trim() ||
      creator.email
    : null

  return (
    <div className="space-y-1.5 border-t border-slate-800 pt-2 text-xs">
      <DetailRow
        label="Price"
        value={offering.price != null ? `$${offering.price}` : null}
      />
      <DetailRow
        label="Tenure"
        value={
          offering.tenure != null && offering.tenure > 0
            ? `${offering.tenure} day${offering.tenure === 1 ? '' : 's'}`
            : null
        }
      />
      <DetailRow label="Creator" value={creatorLabel} />
      <DetailRow
        label="Photo confirmation"
        value={
          offering.confirm_photo_option != null
            ? offering.confirm_photo_option > 0
              ? 'Required'
              : 'Not required'
            : null
        }
      />
      <DetailRow
        label="Shown in profile"
        value={
          offering.display_in_profile != null
            ? offering.display_in_profile
              ? 'Yes'
              : 'No'
            : null
        }
      />
      <DetailRow label="Offering ID" value={`#${offering.id}`} />
    </div>
  )
}

function OfferingCard({
  offering,
  onRequest,
  requesting,
  onDelete,
  deleting,
}: {
  offering: Offering
  onRequest?: () => void
  requesting?: boolean
  onDelete?: () => void
  deleting?: boolean
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
        className="flex flex-col gap-2 text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 font-medium text-slate-100">
            {offering.name || `Offering #${offering.id}`}
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            {offering.price != null && (
              <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-xs font-medium text-emerald-300">
                ${offering.price}
              </span>
            )}
            <span
              className={`text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
              aria-hidden
            >
              ▾
            </span>
          </div>
        </div>

        {offering.description && (
          <p
            className={`text-xs text-slate-400 ${expanded ? 'whitespace-pre-wrap' : 'line-clamp-3'}`}
          >
            {offering.description}
          </p>
        )}

        {!expanded && offering.tenure != null && offering.tenure > 0 && (
          <p className="text-xs text-slate-500">
            {offering.tenure} day{offering.tenure === 1 ? '' : 's'}
          </p>
        )}
      </button>

      {expanded && <OfferingDetails offering={offering} />}

      {onRequest && (
        <Button
          className="mt-1 w-full"
          onClick={onRequest}
          disabled={requesting}
        >
          {requesting ? 'Requesting…' : 'Request'}
        </Button>
      )}

      {onDelete && (
        <button
          className="mt-1 inline-flex w-full items-center justify-center rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onDelete}
          disabled={deleting}
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      )}
    </div>
  )
}

function Skeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="grid animate-pulse gap-3 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-32 rounded-lg border border-slate-800 bg-slate-900/60"
        />
      ))}
    </div>
  )
}

export function Offerings() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [browseId, setBrowseId] = useState<string>('')
  const [requestingId, setRequestingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // My offerings
  const mine = useQuery({
    queryKey: ['offerings', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await api.get('/offerings', {
        params: { creator_id: user?.id },
      })
      return res.data as { offerings: Offering[]; displays: Offering[] }
    },
  })

  // People to browse
  const people = useQuery({
    queryKey: ['people'],
    queryFn: async () => (await api.get('/users')).data as User[],
  })

  // Selected person's offerings
  const browse = useQuery({
    queryKey: ['offerings', 'browse', browseId],
    enabled: !!browseId,
    queryFn: async () => {
      const res = await api.get('/offerings', {
        params: { creator_id: browseId },
      })
      return res.data as { offerings: Offering[] }
    },
  })

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')

  const create = useMutation({
    mutationFn: async () => {
      await api.post('/offerings', {
        name,
        description,
        price: price ? Number(price) : undefined,
        display_in_profile: true,
      })
    },
    onSuccess: () => {
      setName('')
      setDescription('')
      setPrice('')
      qc.invalidateQueries({ queryKey: ['offerings'] })
    },
  })

  const remove = useMutation({
    mutationFn: async (offeringId: number) => {
      setDeletingId(offeringId)
      await api.delete(`/offerings/${offeringId}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offerings'] }),
    onSettled: () => setDeletingId(null),
  })

  const request = useMutation({
    mutationFn: async (offeringId: number) => {
      setRequestingId(offeringId)
      await api.post(`/offerings/${offeringId}/request`, {})
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
    onSettled: () => setRequestingId(null),
  })

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div>
          <h2 className="mb-3 text-xl font-bold text-white">My offerings</h2>
          {mine.isLoading && <Skeleton />}
          {mine.error && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
              Failed to load your offerings.
            </div>
          )}
          {mine.data && mine.data.offerings.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {mine.data.offerings.map(o => (
                <OfferingCard
                  key={o.id}
                  offering={o}
                  deleting={deletingId === o.id}
                  onDelete={() => remove.mutate(o.id)}
                />
              ))}
            </div>
          )}
          {mine.data && mine.data.offerings.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-800 p-6 text-center text-sm text-slate-400">
              You have no offerings yet — create one on the right →
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-xl font-bold text-white">Browse & request</h2>
          <div className="mb-3 max-w-xs">
            <Field label="Whose offerings?">
              <select
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-sm text-slate-100"
                value={browseId}
                onChange={e => setBrowseId(e.target.value)}
              >
                <option value="">Select a person…</option>
                {people.data
                  ?.filter(p => p.id !== user?.id)
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.user_name ?? p.email}
                    </option>
                  ))}
              </select>
            </Field>
          </div>

          {browse.isLoading && <Skeleton />}
          {browse.data && browse.data.offerings.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {browse.data.offerings.map(o => (
                <OfferingCard
                  key={o.id}
                  offering={o}
                  requesting={requestingId === o.id}
                  onRequest={() => request.mutate(o.id)}
                />
              ))}
            </div>
          )}
          {!browseId && (
            <p className="text-sm text-slate-500">
              Pick someone above to see what they offer.
            </p>
          )}
          {browseId && browse.data && browse.data.offerings.length === 0 && (
            <p className="text-sm text-slate-500">This person has no offerings.</p>
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
      </div>

      <Card title="Create an offering">
        <div className="flex flex-col gap-3">
          <Field label="name">
            <Input value={name} onChange={e => setName(e.target.value)} />
          </Field>
          <Field label="description">
            <Textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </Field>
          <Field label="price">
            <Input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </Field>
          <Button
            onClick={() => create.mutate()}
            disabled={create.isPending || !name}
          >
            {create.isPending ? 'Creating…' : 'Create offering'}
          </Button>
          {create.isSuccess && (
            <p className="text-xs text-emerald-400">Offering created ✓</p>
          )}
          {create.error && (
            <p className="text-xs text-rose-400">
              {(create.error as Error).message}
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
