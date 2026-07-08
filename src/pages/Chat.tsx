import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../auth/AuthContext'
import { ChatWindow } from '../chat/ChatWindow'
import { useBlockedEmails } from '../lib/blocks'
import { Button, Input } from '../components/ui'
import { Avatar, displayName } from '../components/Avatar'
import { ConfirmDialog } from '../components/ConfirmDialog'
import type { Conversation, User } from '../types'

export function Chat() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const me = user?.email ?? ''
  const [params] = useSearchParams()
  const [selected, setSelected] = useState<string | null>(params.get('peer'))
  const [newEmail, setNewEmail] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<{ id: number; email: string } | null>(null)
  const blockedEmails = useBlockedEmails()

  const { data } = useQuery({
    queryKey: ['conversations', me],
    enabled: !!me,
    refetchInterval: 5000,
    queryFn: async () => {
      const res = await api.get('/messages', { params: { user_email: me } })
      return res.data as Conversation[]
    },
  })

  // People I follow — chat candidates even before any conversation exists.
  const following = useQuery({
    queryKey: ['following', user?.user_name],
    enabled: !!user?.user_name,
    queryFn: async () => {
      const res = await api.get('/users/following', {
        params: { contactName: user?.user_name, nameFilter: '' },
      })
      return res.data as User[]
    },
  })

  // Build a distinct list of counterpart emails from the conversation headers.
  const counterparts = useMemo(() => {
    const set = new Set<string>()
    data?.forEach(c => {
      const other = c.user_email === me ? c.worker_email : c.user_email
      if (other && !blockedEmails.has(other)) set.add(other)
    })
    // Keep an explicitly opened peer even if blocked, so the window still loads.
    if (selected) set.add(selected)
    return Array.from(set)
  }, [data, me, selected, blockedEmails])

  // Followed people without an open conversation yet — one click starts one.
  const followingToShow = useMemo(() => {
    const inChat = new Set(counterparts)
    return (following.data ?? []).filter(
      u => u.email && u.email !== me && !inChat.has(u.email) && !blockedEmails.has(u.email)
    )
  }, [following.data, counterparts, me, blockedEmails])

  // All users — validates the free-typed email before opening a chat.
  const people = useQuery({
    queryKey: ['people'],
    queryFn: async () => (await api.get('/users')).data as User[],
  })

  // Conversation-header id per counterpart, for deleting.
  const convByEmail = useMemo(() => {
    const map = new Map<string, number>()
    data?.forEach(c => {
      const other = c.user_email === me ? c.worker_email : c.user_email
      if (other && !map.has(other)) map.set(other, c.id)
    })
    return map
  }, [data, me])

  const deleteConv = useMutation({
    mutationFn: async (conv: { id: number; email: string }) => {
      await api.delete(`/messages/${conv.id}`)
    },
    onSuccess: (_res, conv) => {
      if (selected === conv.email) setSelected(null)
      setToDelete(null)
      qc.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  function startChatWithTyped() {
    const typed = newEmail.trim()
    if (!typed) return
    // If the user list is loaded, only accept a known account (with its
    // canonical casing). The server rejects unknown emails too — this just
    // catches the typo before a window opens.
    const match = people.data?.find(
      u => u.email?.toLowerCase() === typed.toLowerCase()
    )
    if (people.data && !match) {
      setAddError(`No user with email ${typed}`)
      return
    }
    setAddError(null)
    setSelected(match?.email ?? typed)
    setNewEmail('')
  }

  return (
    // 2rem = the main area's p-4 top+bottom padding.
    <div className="grid h-[calc(100vh-2rem)] grid-cols-[260px_1fr] gap-4">
      <div className="flex flex-col rounded-lg border border-slate-800 bg-slate-900/60">
        <div className="border-b border-slate-800 p-3">
          <p className="mb-2 text-sm font-semibold text-slate-200">
            Conversations
          </p>
          <div className="flex gap-1.5">
            <Input
              value={newEmail}
              onChange={e => {
                setNewEmail(e.target.value)
                setAddError(null)
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') startChatWithTyped()
              }}
              placeholder="user email…"
            />
            <Button onClick={startChatWithTyped}>+</Button>
          </div>
          {addError && <p className="mt-1.5 text-xs text-rose-400">{addError}</p>}
        </div>
        <div className="flex-1 overflow-auto p-2">
          {counterparts.map(email => (
            <div key={email} className="group mb-1 flex items-center gap-1">
              <button
                onClick={() => setSelected(email)}
                className={`min-w-0 flex-1 truncate rounded-md px-2.5 py-1.5 text-left text-sm transition ${
                  selected === email
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {email}
              </button>
              {convByEmail.has(email) && (
                <button
                  onClick={() =>
                    setToDelete({ id: convByEmail.get(email)!, email })
                  }
                  aria-label={`Delete conversation with ${email}`}
                  className="shrink-0 rounded p-1 text-xs text-slate-600 opacity-0 transition hover:bg-slate-800 hover:text-rose-300 focus:opacity-100 group-hover:opacity-100"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {counterparts.length === 0 && (
            <p className="px-2.5 py-1.5 text-xs text-slate-500">
              No conversations yet — pick someone below, or add an email above.
            </p>
          )}

          {followingToShow.length > 0 && (
            <>
              <p className="mt-2 mb-1 px-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Following
              </p>
              {followingToShow.map(person => (
                <button
                  key={person.id}
                  onClick={() => setSelected(person.email)}
                  className="mb-1 flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-slate-300 transition hover:bg-slate-800"
                >
                  <Avatar user={person} size="sm" />
                  <span className="min-w-0">
                    <span className="block truncate">{displayName(person)}</span>
                    <span className="block truncate text-xs text-slate-500">
                      {person.email}
                    </span>
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/60">
        {selected ? (
          <ChatWindow key={selected} me={me} counterpart={selected} />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500">
            Select or start a conversation.
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete conversation?"
        message={
          toDelete
            ? `The conversation with ${toDelete.email} and all its messages will be deleted.`
            : undefined
        }
        confirmLabel="Delete"
        tone="danger"
        pending={deleteConv.isPending}
        error={deleteConv.error ? (deleteConv.error as Error).message : undefined}
        onConfirm={() => toDelete && deleteConv.mutate(toDelete)}
        onCancel={() => {
          setToDelete(null)
          deleteConv.reset()
        }}
      />
    </div>
  )
}
