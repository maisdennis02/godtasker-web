import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuth } from '../auth/AuthContext'
import { Button, Card, Field, Input, Textarea } from '../components/ui'
import type { Offering, User } from '../types'

function OfferingCard({
  offering,
  onRequest,
  requesting,
}: {
  offering: Offering
  onRequest?: () => void
  requesting?: boolean
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-slate-100">{offering.name}</p>
          <p className="text-xs text-slate-400">{offering.description}</p>
          {offering.price != null && (
            <p className="mt-1 text-xs text-emerald-400">${offering.price}</p>
          )}
        </div>
        {onRequest && (
          <Button onClick={onRequest} disabled={requesting}>
            {requesting ? '…' : 'Request'}
          </Button>
        )}
      </div>
    </div>
  )
}

export function Offerings() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [browseId, setBrowseId] = useState<string>('')

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

  const request = useMutation({
    mutationFn: async (offeringId: number) => {
      await api.post(`/offerings/${offeringId}/request`, {})
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div>
          <h2 className="mb-3 text-xl font-bold text-white">My offerings</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {mine.data?.offerings?.map(o => (
              <OfferingCard key={o.id} offering={o} />
            ))}
          </div>
          {mine.data && mine.data.offerings.length === 0 && (
            <p className="text-slate-500">
              You have no offerings yet — create one on the right.
            </p>
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
          <div className="grid gap-3 sm:grid-cols-2">
            {browse.data?.offerings?.map(o => (
              <OfferingCard
                key={o.id}
                offering={o}
                requesting={request.isPending}
                onRequest={() => request.mutate(o.id)}
              />
            ))}
          </div>
          {browseId && browse.data && browse.data.offerings.length === 0 && (
            <p className="text-slate-500">This person has no offerings.</p>
          )}
          {request.isSuccess && (
            <p className="mt-2 text-sm text-emerald-400">
              Requested — a task was created and now appears in your Sent tasks.
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
          <Button onClick={() => create.mutate()} disabled={create.isPending}>
            {create.isPending ? 'Creating…' : 'Create offering'}
          </Button>
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
