import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../auth/AuthContext'
import { ChatWindow } from '../chat/ChatWindow'
import { useBlockedEmails } from '../lib/blocks'
import { Button, Input } from '../components/ui'
import type { Conversation } from '../types'

export function Chat() {
  const { user } = useAuth()
  const me = user?.email ?? ''
  const [params] = useSearchParams()
  const [selected, setSelected] = useState<string | null>(params.get('peer'))
  const [newEmail, setNewEmail] = useState('')
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

  return (
    <div className="grid h-[calc(100vh-3rem)] grid-cols-[260px_1fr] gap-4">
      <div className="flex flex-col rounded-lg border border-slate-800 bg-slate-900/60">
        <div className="border-b border-slate-800 p-3">
          <p className="mb-2 text-sm font-semibold text-slate-200">
            Conversations
          </p>
          <div className="flex gap-1.5">
            <Input
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="user email…"
            />
            <Button
              onClick={() => {
                if (newEmail.trim()) {
                  setSelected(newEmail.trim())
                  setNewEmail('')
                }
              }}
            >
              +
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-2">
          {counterparts.map(email => (
            <button
              key={email}
              onClick={() => setSelected(email)}
              className={`mb-1 block w-full truncate rounded-md px-3 py-2 text-left text-sm transition ${
                selected === email
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {email}
            </button>
          ))}
          {counterparts.length === 0 && (
            <p className="px-3 py-2 text-xs text-slate-500">
              No conversations yet. Add a user email above, or start one from
              the People page.
            </p>
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
    </div>
  )
}
