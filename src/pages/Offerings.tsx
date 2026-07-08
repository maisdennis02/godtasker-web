import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuth } from '../auth/AuthContext'
import { Button, Field, Input, Select, Textarea } from '../components/ui'
import { Modal } from '../components/Modal'
import { OfferingCard } from '../components/OfferingCard'
import type { Offering, User } from '../types'

function Skeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid animate-pulse gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-24 rounded-lg border border-slate-800 bg-slate-900/60"
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
  const [subtasks, setSubtasks] = useState<string[]>([])
  // When set, the form edits this offering instead of creating a new one.
  const [editing, setEditing] = useState<Offering | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  // Build the sub_task_list payload from the form's text rows.
  const subtaskPayload = () =>
    subtasks
      .map(s => s.trim())
      .filter(Boolean)
      .map((d, i) => ({ id: i + 1, description: d, complete: false, order: i }))

  function resetForm() {
    setEditing(null)
    setName('')
    setDescription('')
    setPrice('')
    setSubtasks([])
  }

  function closeForm() {
    setFormOpen(false)
    resetForm()
  }

  const create = useMutation({
    mutationFn: async () => {
      const list = subtaskPayload()
      await api.post('/offerings', {
        name,
        description,
        price: price ? Number(price) : undefined,
        // Stored on the offering and copied onto the spawned task when requested.
        sub_task_list: list.length ? list : undefined,
        display_in_profile: true,
      })
    },
    onSuccess: () => {
      resetForm()
      setFormOpen(false)
      qc.invalidateQueries({ queryKey: ['offerings'] })
    },
  })

  // Edit = save changes to an existing offering. Fields the form doesn't expose
  // (tenure, photo confirmation, etc.) are preserved from the edited offering.
  const update = useMutation({
    mutationFn: async () => {
      if (!editing) return
      await api.put(`/offerings/${editing.id}`, {
        name,
        description,
        price: price ? Number(price) : null,
        sub_task_list: subtaskPayload(),
        task_attributes: editing.task_attributes,
        confirm_photo_option: editing.confirm_photo_option,
        tenure: editing.tenure,
        display_in_profile: editing.display_in_profile,
      })
    },
    onSuccess: () => {
      resetForm()
      setFormOpen(false)
      qc.invalidateQueries({ queryKey: ['offerings'] })
    },
  })

  // Load an offering into the form and open the modal in edit mode.
  function startEdit(offering: Offering) {
    setEditing(offering)
    setName(offering.name ?? '')
    setDescription(offering.description ?? '')
    setPrice(offering.price != null ? String(offering.price) : '')
    setSubtasks((offering.sub_task_list ?? []).map(s => s.description ?? ''))
    create.reset()
    update.reset()
    setFormOpen(true)
  }

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
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          <h2 className="text-lg font-bold text-white">My offerings</h2>
          <Button
            className="ml-auto"
            onClick={() => {
              create.reset()
              update.reset()
              setFormOpen(true)
            }}
          >
            + New offering
          </Button>
        </div>
        {mine.isLoading && <Skeleton />}
        {mine.error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            Failed to load your offerings.
          </div>
        )}
        {mine.data && mine.data.offerings.length > 0 && (
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mine.data.offerings.map(o => (
              <OfferingCard
                key={o.id}
                offering={o}
                editing={editing?.id === o.id}
                onEdit={() => startEdit(o)}
                deleting={deletingId === o.id}
                onDelete={() => remove.mutate(o.id)}
              />
            ))}
          </div>
        )}
        {mine.data && mine.data.offerings.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-800 p-6 text-center text-sm text-slate-400">
            You have no offerings yet — create one with + New offering.
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-lg font-bold text-white">Browse & request</h2>
        <div className="mb-3 max-w-xs">
          <Field label="Whose offerings?">
            <Select value={browseId} onChange={e => setBrowseId(e.target.value)}>
              <option value="">Select a person…</option>
              {people.data
                ?.filter(p => p.id !== user?.id)
                .map(p => (
                  <option key={p.id} value={p.id}>
                    {p.user_name ?? p.email}
                  </option>
                ))}
            </Select>
          </Field>
        </div>

        {browse.isLoading && <Skeleton />}
        {browse.data && browse.data.offerings.length > 0 && (
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

      <Modal
        open={formOpen}
        title={editing ? 'Edit offering' : 'Create an offering'}
        onClose={closeForm}
      >
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
          <Field label="subtasks">
            <div className="flex flex-col gap-2">
              {subtasks.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={s}
                    placeholder={`Step ${i + 1}`}
                    onChange={e =>
                      setSubtasks(prev =>
                        prev.map((v, j) => (j === i ? e.target.value : v))
                      )
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSubtasks(prev => prev.filter((_, j) => j !== i))
                    }
                    aria-label={`Remove subtask ${i + 1}`}
                    className="shrink-0 rounded-md border border-slate-700 px-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setSubtasks(prev => [...prev, ''])}
                className="self-start text-xs font-medium text-indigo-400 hover:text-indigo-300"
              >
                + Add subtask
              </button>
            </div>
          </Field>
          {editing ? (
            <Button
              onClick={() => update.mutate()}
              disabled={update.isPending || !name}
            >
              {update.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          ) : (
            <Button
              onClick={() => create.mutate()}
              disabled={create.isPending || !name}
            >
              {create.isPending ? 'Creating…' : 'Create offering'}
            </Button>
          )}
          {!editing && create.error && (
            <p className="text-xs text-rose-400">
              {(create.error as Error).message}
            </p>
          )}
          {editing && update.error && (
            <p className="text-xs text-rose-400">
              {(update.error as Error).message}
            </p>
          )}
        </div>
      </Modal>
    </div>
  )
}
