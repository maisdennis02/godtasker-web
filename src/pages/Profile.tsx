import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuth } from '../auth/AuthContext'
import { Button, Card, Field, Input, Select, Textarea } from '../components/ui'
import type { User } from '../types'

const GENDERS = ['', 'female', 'male', 'non-binary', 'other', 'prefer not to say']

// The fields a user can edit here. Email is intentionally excluded — it is the
// login identity and tasks/messages/follows are keyed by it, so it stays read-only.
type FormState = {
  first_name: string
  last_name: string
  user_name: string
  phonenumber: string
  birth_date: string
  gender: string
  occupation: string
  instagram: string
  linkedin: string
  bio: string
}

const EMPTY: FormState = {
  first_name: '',
  last_name: '',
  user_name: '',
  phonenumber: '',
  birth_date: '',
  gender: '',
  occupation: '',
  instagram: '',
  linkedin: '',
  bio: '',
}

function toForm(u: User): FormState {
  return {
    first_name: u.first_name ?? '',
    last_name: u.last_name ?? '',
    user_name: u.user_name ?? '',
    phonenumber: u.phonenumber ?? '',
    birth_date: u.birth_date ?? '',
    gender: u.gender ?? '',
    occupation: u.occupation ?? '',
    instagram: u.instagram ?? '',
    linkedin: u.linkedin ?? '',
    bio: u.bio ?? '',
  }
}

function displayName(f: FormState, email: string): string {
  const full = [f.first_name, f.last_name].filter(Boolean).join(' ').trim()
  return f.user_name || full || email
}

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function Profile() {
  const { user, updateUser } = useAuth()
  const qc = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [seededFrom, setSeededFrom] = useState<User | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await api.get(`/users/${user!.id}`)
      return res.data as User
    },
  })

  // Re-seed the form whenever fresh data arrives (initial load + after saves).
  // Adjusting state during render — the documented alternative to a setState
  // effect — keeps the edited values in local state without an extra render pass.
  if (data && data !== seededFrom) {
    setSeededFrom(data)
    setForm(toForm(data))
  }

  const set =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))

  const saveProfile = useMutation({
    mutationFn: async () => {
      const res = await api.put('/users', form)
      return res.data as User
    },
    onSuccess: () => {
      updateUser({
        user_name: form.user_name,
        first_name: form.first_name,
        last_name: form.last_name,
      })
      qc.invalidateQueries({ queryKey: ['profile'] })
      qc.invalidateQueries({ queryKey: ['people'] })
    },
  })

  const uploadPhoto = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData()
      fd.append('profileImage', file)
      const up = await api.post('/files', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const fileId = up.data?.id
      if (!fileId) throw new Error(up.data?.error || 'Upload failed')
      const res = await api.put('/users', { avatar_id: fileId })
      return res.data as User
    },
    onSuccess: updated => {
      updateUser({ avatar: updated.avatar ?? null })
      qc.invalidateQueries({ queryKey: ['profile'] })
      qc.invalidateQueries({ queryKey: ['people'] })
    },
  })

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadPhoto.mutate(file)
    // Reset so picking the same file again still fires onChange.
    e.target.value = ''
  }

  if (!user) return null

  const email = data?.email ?? user.email
  const name = displayName(form, email)
  const avatarUrl = data?.avatar?.url

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-3">
        <h2 className="text-lg font-bold text-white">Profile</h2>
        <p className="text-xs text-slate-400">
          Update your details and profile photo.
        </p>
      </div>

      {isLoading && (
        <div className="h-64 animate-pulse rounded-lg border border-slate-800 bg-slate-900/60" />
      )}

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          Failed to load your profile. Make sure the server is running.
        </div>
      )}

      {data && (
        <div className="space-y-3">
          {/* Photo */}
          <Card>
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xl font-semibold text-indigo-300">
                  {initials(name)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-100">{name}</p>
                <p className="truncate text-xs text-slate-500">{email}</p>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={onPickFile}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    className="bg-slate-700 hover:bg-slate-600"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadPhoto.isPending}
                  >
                    {uploadPhoto.isPending ? 'Uploading…' : 'Change photo'}
                  </Button>
                  <span className="text-xs text-slate-500">
                    JPG, PNG or GIF, up to 5&nbsp;MB.
                  </span>
                </div>
                {uploadPhoto.isError && (
                  <p className="mt-2 text-xs text-rose-400">
                    {(uploadPhoto.error as Error).message}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Details */}
          <Card title="Your details">
            <form
              onSubmit={e => {
                e.preventDefault()
                saveProfile.mutate()
              }}
              className="space-y-3"
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <Field label="First name">
                  <Input value={form.first_name} onChange={set('first_name')} />
                </Field>
                <Field label="Last name">
                  <Input value={form.last_name} onChange={set('last_name')} />
                </Field>
                <Field label="Username">
                  <Input value={form.user_name} onChange={set('user_name')} />
                </Field>
                <Field label="Email (read-only)">
                  <Input value={email} disabled className="opacity-60" />
                </Field>
                <Field label="Phone number">
                  <Input
                    value={form.phonenumber}
                    onChange={set('phonenumber')}
                    inputMode="tel"
                  />
                </Field>
                <Field label="Birth date">
                  <Input
                    type="date"
                    value={form.birth_date}
                    onChange={set('birth_date')}
                  />
                </Field>
                <Field label="Gender">
                  <Select value={form.gender} onChange={set('gender')}>
                    {GENDERS.map(g => (
                      <option key={g} value={g}>
                        {g === '' ? '—' : g}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Occupation">
                  <Input value={form.occupation} onChange={set('occupation')} />
                </Field>
                <Field label="Instagram">
                  <Input
                    value={form.instagram}
                    onChange={set('instagram')}
                    placeholder="@handle"
                  />
                </Field>
                <Field label="LinkedIn">
                  <Input value={form.linkedin} onChange={set('linkedin')} />
                </Field>
              </div>

              <Field label="Bio">
                <Textarea
                  value={form.bio}
                  onChange={set('bio')}
                  rows={4}
                  maxLength={2200}
                  placeholder="Tell people a bit about yourself…"
                />
              </Field>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={saveProfile.isPending}>
                  {saveProfile.isPending ? 'Saving…' : 'Save changes'}
                </Button>
                {saveProfile.isSuccess && !saveProfile.isPending && (
                  <span className="text-xs text-emerald-400">Saved ✓</span>
                )}
                {saveProfile.isError && (
                  <span className="text-xs text-rose-400">
                    Couldn’t save. Please try again.
                  </span>
                )}
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
