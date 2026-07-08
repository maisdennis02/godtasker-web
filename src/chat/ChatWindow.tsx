import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import { getSocket } from './socket'
import { formatTime } from '../lib/format'
import { Button, Input } from '../components/ui'
import type { ChatMessage } from '../types'

export function ChatWindow({
  me,
  counterpart,
}: {
  me: string
  counterpart: string
}) {
  const [chatId, setChatId] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Resolve the conversation + load history. The parent remounts this component
  // (via key=counterpart) when the counterpart changes, so state starts fresh.
  useEffect(() => {
    let active = true

    async function open() {
      try {
        const start = await api.post('/messages/start', {
          user_email: me,
          worker_email: counterpart,
        })
        const id = start.data.chat_id as number
        if (!active) return
        setChatId(id)
        const thread = await api.get(`/messages/${id}/thread`)
        if (!active) return
        setMessages(thread.data as ChatMessage[])
      } catch (err) {
        const e = err as { response?: { data?: { error?: string } } }
        if (active)
          setError(e.response?.data?.error ?? 'Could not open conversation.')
      }
    }
    open()
    return () => {
      active = false
    }
  }, [me, counterpart])

  // Join the socket room and stream incoming messages live.
  useEffect(() => {
    if (chatId === null) return
    const socket = getSocket()
    socket.emit('chat:join', chatId)

    function onMessage(msg: ChatMessage) {
      if (msg.chat_id !== chatId) return
      setMessages(prev =>
        prev.some(m => m.id === msg.id) ? prev : [...prev, msg]
      )
    }
    socket.on('chat:message', onMessage)

    return () => {
      socket.emit('chat:leave', chatId)
      socket.off('chat:message', onMessage)
    }
  }, [chatId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    if (!draft.trim() || chatId === null) return
    const body = draft.trim()
    setDraft('')
    try {
      // The new message arrives back via the socket room, so we don't append here.
      await api.post(`/messages/${chatId}/send`, {
        sender_email: me,
        recipient_email: counterpart,
        body,
      })
    } catch {
      setError('Failed to send.')
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-800 px-4 py-3">
        <p className="font-medium text-slate-100">{counterpart}</p>
        <p className="text-xs text-slate-500">
          {chatId ? `chat #${chatId}` : 'connecting…'}
        </p>
      </div>

      <div className="flex-1 space-y-2 overflow-auto p-4">
        {error && <p className="text-sm text-rose-400">{error}</p>}
        {messages.map(m => {
          const mine = m.sender_email === me
          return (
            <div
              key={m.id}
              className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  mine
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-100'
                }`}
              >
                <span>{m.body}</span>
                <span
                  className={`ml-2 align-bottom text-[10px] ${
                    mine ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  {formatTime(m.createdAt ?? m.created_at)}
                </span>
              </div>
            </div>
          )
        })}
        {messages.length === 0 && !error && (
          <p className="text-sm text-slate-500">
            No messages yet — say hello.
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 border-t border-slate-800 p-3">
        <Input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type a message…"
        />
        <Button onClick={send} disabled={chatId === null}>
          Send
        </Button>
      </div>
    </div>
  )
}
