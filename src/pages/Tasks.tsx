import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuth } from '../auth/AuthContext'
import { Button, Card, Field, Input, Textarea } from '../components/ui'
import { formatDate, localToISO, nowLocalInputValue } from '../lib/format'
import type { Task, User } from '../types'

type Tab = 'sent' | 'received'

function peerLabel(u?: User, email?: string): string {
  if (u) {
    const full = [u.first_name, u.last_name].filter(Boolean).join(' ').trim()
    return u.user_name || full || u.email || email || 'someone'
  }
  return email || 'someone'
}

// Urgency chip derived from the due date — only for still-open tasks.
function dueState(task: Task): { label: string; cls: string } | null {
  if (task.end_date || task.canceled_at || !task.due_date) return null
  const due = new Date(task.due_date)
  if (Number.isNaN(due.getTime())) return null
  const ms = due.getTime() - Date.now()
  const day = 86_400_000
  if (ms < 0) return { label: 'Overdue', cls: 'bg-rose-500/15 text-rose-300' }
  if (ms < day) return { label: 'Due today', cls: 'bg-amber-500/15 text-amber-300' }
  if (ms < 2 * day)
    return { label: 'Due tomorrow', cls: 'bg-slate-700 text-slate-300' }
  return null
}

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

// The full set of task fields, shown when a card is expanded.
function TaskDetails({ task }: { task: Task }) {
  const requester = peerLabel(task.requester, task.requester_email)
  const assignee = peerLabel(task.assignee, task.assignee_email)
  const status = task.canceled_at
    ? 'Canceled'
    : task.end_date
    ? 'Completed'
    : task.initiated_at
    ? 'In progress'
    : 'Pending'

  return (
    <div className="mt-3 space-y-1.5 border-t border-slate-800 pt-3 text-xs">
      <DetailRow label="Status" value={status} />
      <DetailRow
        label="Requester"
        value={`${requester}${task.requester_email ? ` · ${task.requester_email}` : ''}`}
      />
      <DetailRow
        label="Assignee"
        value={`${assignee}${task.assignee_email ? ` · ${task.assignee_email}` : ''}`}
      />
      <DetailRow
        label="Start"
        value={task.start_date ? formatDate(task.start_date) : null}
      />
      <DetailRow
        label="Due"
        value={task.due_date ? formatDate(task.due_date) : null}
      />
      <DetailRow
        label="Started"
        value={task.initiated_at ? formatDate(task.initiated_at) : null}
      />
      <DetailRow
        label="Completed"
        value={task.end_date ? formatDate(task.end_date) : null}
      />
      <DetailRow
        label="Canceled"
        value={task.canceled_at ? formatDate(task.canceled_at) : null}
      />
      <DetailRow
        label="Points"
        value={task.points != null ? String(task.points) : null}
      />
      <DetailRow
        label="Price"
        value={task.price != null ? `$${task.price}` : null}
      />
      <DetailRow label="Task ID" value={`#${task.id}`} />
    </div>
  )
}

function TaskCard({
  task,
  tab,
  onStart,
  onDone,
  pending,
}: {
  task: Task
  tab: Tab
  onStart?: () => void
  onDone?: () => void
  pending?: 'start' | 'done' | null
}) {
  // On the "sent" tab the relevant peer is the assignee; on "received", the requester.
  const peer =
    tab === 'sent'
      ? peerLabel(task.assignee, task.assignee_email)
      : peerLabel(task.requester, task.requester_email)
  const due = dueState(task)
  const inProgress = !!task.initiated_at && !task.end_date && !task.canceled_at
  const showActions = tab === 'received'
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 font-medium text-slate-100">
            {task.name || `Task #${task.id}`}
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            {inProgress && (
              <span className="rounded bg-indigo-500/15 px-1.5 py-0.5 text-[11px] font-medium text-indigo-300">
                In progress
              </span>
            )}
            {due && (
              <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${due.cls}`}>
                {due.label}
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

        {task.description && (
          <p
            className={`mt-1 text-xs text-slate-400 ${expanded ? 'whitespace-pre-wrap' : 'line-clamp-2'}`}
          >
            {task.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span>
            {tab === 'sent' ? 'To ' : 'From '}
            <span className="text-slate-300">{peer}</span>
          </span>
          {task.due_date && (
            <span>
              Due <span className="text-slate-300">{formatDate(task.due_date)}</span>
            </span>
          )}
          {task.points != null && <span>{task.points} pts</span>}
          {task.price != null && (
            <span className="text-emerald-400">${task.price}</span>
          )}
        </div>
      </button>

      {expanded && <TaskDetails task={task} />}

      {showActions && (
        <div className="mt-3 flex gap-2">
          {!task.initiated_at && (
            <Button
              className="flex-1 bg-slate-700 hover:bg-slate-600"
              onClick={onStart}
              disabled={!!pending}
            >
              {pending === 'start' ? 'Starting…' : 'Start'}
            </Button>
          )}
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-500"
            onClick={onDone}
            disabled={!!pending}
          >
            {pending === 'done' ? 'Finishing…' : 'Done'}
          </Button>
        </div>
      )}
    </div>
  )
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-24 rounded-lg border border-slate-800 bg-slate-900/60"
        />
      ))}
    </div>
  )
}

export function Tasks() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('sent')

  const tasksQuery = useQuery({
    queryKey: ['tasks', tab, user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (tab === 'sent') {
        const res = await api.get('/tasks/user/unfinished', {
          params: { requesterID: user?.id, nameFilter: '', assigneeNameFilter: '' },
        })
        return res.data as Task[]
      }
      const res = await api.get('/tasks/unfinished', {
        params: { assigneeID: user?.id, nameFilter: '' },
      })
      return res.data as Task[]
    },
  })

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [assigneeEmail, setAssigneeEmail] = useState('')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')

  // Per-task action state so only the clicked card shows a spinner.
  const [pending, setPending] = useState<{ id: number; action: 'start' | 'done' } | null>(
    null
  )

  // Start = accept the task: stamp initiated_at and notify the requester.
  const startTask = useMutation({
    mutationFn: async (task: Task) => {
      setPending({ id: task.id, action: 'start' })
      await api.put(`/tasks/${task.id}/notification/worker`, {
        status: { status: 2, comment: `Started "${task.name ?? `task #${task.id}`}"` },
        initiated_at: new Date().toISOString(),
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
    onSettled: () => setPending(null),
  })

  // Done = confirm the task; the server stamps end_date and it leaves the open list.
  const doneTask = useMutation({
    mutationFn: async (task: Task) => {
      setPending({ id: task.id, action: 'done' })
      await api.put(`/tasks/confirm/${task.id}`, {
        messageTitle: 'Task completed',
        messageMessage: `"${task.name ?? `task #${task.id}`}" was marked done`,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onSettled: () => setPending(null),
  })

  const createTask = useMutation({
    mutationFn: async () => {
      const res = await api.post('/tasks', {
        assignee_email: assigneeEmail,
        name,
        description,
        start_date: localToISO(startDate),
        due_date: localToISO(dueDate),
      })
      return res.data
    },
    onSuccess: () => {
      setName('')
      setDescription('')
      qc.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const tasks = tasksQuery.data ?? []

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-xl font-bold text-white">Tasks</h2>
          {tasksQuery.data && (
            <span className="text-xs text-slate-500">
              {tasks.length} open
            </span>
          )}
        </div>

        <div className="mb-4 flex gap-2">
          {(['sent', 'received'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1 text-sm capitalize transition ${
                t === tab
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tasksQuery.isLoading && <Skeleton />}
        {tasksQuery.error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            Failed to load tasks. Make sure the server is running.
          </div>
        )}

        {tasksQuery.data && (
          <div className="space-y-3">
            {tasks.map(t => (
              <TaskCard
                key={t.id}
                task={t}
                tab={tab}
                onStart={() => startTask.mutate(t)}
                onDone={() => doneTask.mutate(t)}
                pending={pending?.id === t.id ? pending.action : null}
              />
            ))}
          </div>
        )}

        {tasksQuery.data && tasks.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-800 p-8 text-center text-sm text-slate-400">
            {tab === 'sent'
              ? 'You have no open tasks. Send one using the form →'
              : 'Nothing on your plate — no open tasks assigned to you.'}
          </div>
        )}
      </div>

      <Card title="Send a task">
        <div className="flex flex-col gap-3">
          <Field label="assignee email">
            <Input
              value={assigneeEmail}
              onChange={e => setAssigneeEmail(e.target.value)}
              placeholder="bob@test.com"
            />
          </Field>
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
          <Field label="Start date">
            <Input
              type="datetime-local"
              className="[color-scheme:dark]"
              value={startDate}
              min={nowLocalInputValue()}
              onChange={e => setStartDate(e.target.value)}
            />
          </Field>
          <Field label="Due date">
            <Input
              type="datetime-local"
              className="[color-scheme:dark]"
              value={dueDate}
              min={startDate || nowLocalInputValue()}
              onChange={e => setDueDate(e.target.value)}
            />
          </Field>
          <Button
            onClick={() => createTask.mutate()}
            disabled={createTask.isPending || !assigneeEmail || !name}
          >
            {createTask.isPending ? 'Sending…' : 'Send task'}
          </Button>
          {createTask.isSuccess && (
            <p className="text-xs text-emerald-400">Task sent ✓</p>
          )}
          {createTask.error && (
            <p className="text-xs text-rose-400">
              {(createTask.error as Error).message}
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
