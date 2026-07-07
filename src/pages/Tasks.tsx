import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuth } from '../auth/AuthContext'
import { Button, Card, Field, Input, Textarea } from '../components/ui'
import { DateTimePicker } from '../components/DateTimePicker'
import { formatDate, localToISO, nowLocalInputValue, toLocalInput } from '../lib/format'
import type { SubTask, Task, User } from '../types'

type Tab = 'sent' | 'received'

// Progress over a task's subtask checklist. No subtasks => allDone (nothing gates
// completion), mirroring the backend gate in TaskConfirmController.
function subtaskStats(list?: SubTask[] | null) {
  const items = list ?? []
  const total = items.length
  const done = items.filter(s => s.complete).length
  const pct = total === 0 ? 0 : (done / total) * 100
  return { total, done, pct, allDone: total === 0 || done === total }
}

// Checklist shown in the expanded card. Editable only for the assignee on an open
// task; otherwise rendered read-only for the requester to watch progress.
function SubtaskList({
  list,
  editable,
  onToggle,
  busy,
}: {
  list: SubTask[]
  editable: boolean
  onToggle?: (index: number) => void
  busy?: boolean
}) {
  return (
    <div className="mt-3 space-y-1.5 border-t border-slate-800 pt-3">
      <p className="text-xs font-medium text-slate-400">Subtasks</p>
      {list.map((s, i) => (
        <label
          key={s.id ?? i}
          className={`flex items-center gap-2 text-xs ${
            editable ? 'cursor-pointer' : 'cursor-default'
          }`}
        >
          <input
            type="checkbox"
            checked={!!s.complete}
            disabled={!editable || busy}
            onChange={() => onToggle?.(i)}
            className="h-3.5 w-3.5 shrink-0 rounded border-slate-600 accent-emerald-500 disabled:opacity-60"
          />
          <span className={s.complete ? 'text-slate-500 line-through' : 'text-slate-300'}>
            {s.description || `Item ${i + 1}`}
          </span>
        </label>
      ))}
    </div>
  )
}

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
  onEdit,
  onDelete,
  onToggleSubtask,
  pending,
  subtaskBusy,
  deleting,
  doneError,
}: {
  task: Task
  tab: Tab
  onStart?: () => void
  onDone?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onToggleSubtask?: (index: number) => void
  pending?: 'start' | 'done' | null
  subtaskBusy?: boolean
  deleting?: boolean
  doneError?: string | null
}) {
  // On the "sent" tab the relevant peer is the assignee; on "received", the requester.
  const peer =
    tab === 'sent'
      ? peerLabel(task.assignee, task.assignee_email)
      : peerLabel(task.requester, task.requester_email)
  const due = dueState(task)
  const inProgress = !!task.initiated_at && !task.end_date && !task.canceled_at
  const notStarted = !task.initiated_at && !task.end_date && !task.canceled_at
  const showActions = tab === 'received'
  const stats = subtaskStats(task.sub_task_list)
  // The assignee ticks off subtasks on an open received task; the requester only watches.
  const editable = tab === 'received' && !task.end_date && !task.canceled_at
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

        {stats.total > 0 && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[11px] text-slate-500">
              <span>Subtasks</span>
              <span>
                {stats.done}/{stats.total}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${stats.pct}%` }}
              />
            </div>
          </div>
        )}
      </button>

      {expanded && (
        <>
          <TaskDetails task={task} />
          {stats.total > 0 && (
            <SubtaskList
              list={task.sub_task_list ?? []}
              editable={editable}
              onToggle={onToggleSubtask}
              busy={subtaskBusy}
            />
          )}
        </>
      )}

      {showActions && (
        <>
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
              disabled={!!pending || !stats.allDone}
              title={
                stats.allDone ? undefined : 'Complete all subtasks to finish this task'
              }
            >
              {pending === 'done' ? 'Finishing…' : 'Done'}
            </Button>
          </div>
          {!stats.allDone && (
            <p className="mt-2 text-[11px] text-slate-500">
              {stats.done}/{stats.total} subtasks done — finish them all to complete
              this task.
            </p>
          )}
          {doneError && (
            <p className="mt-2 text-[11px] text-rose-400">{doneError}</p>
          )}
        </>
      )}

      {/* The requester can edit or delete a task they sent until the assignee starts it. */}
      {(onEdit || onDelete) && notStarted && (
        <div className="mt-3 flex gap-2">
          {onEdit && (
            <button
              className="flex-1 inline-flex items-center justify-center rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
              onClick={onEdit}
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              className="flex-1 inline-flex items-center justify-center rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={onDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
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

// Looks like an email address — used to accept a free-typed email that isn't in
// the user list as a valid assignee.
const EMAIL_RE = /^\S+@\S+\.\S+$/

// Type a name or email; pick from matching users, or just type any email.
// `query` is what's shown; `email` is the resolved address submitted with the task.
function AssigneePicker({
  users,
  query,
  email,
  onChange,
}: {
  users: User[]
  query: string
  email: string
  onChange: (next: { query: string; email: string }) => void
}) {
  const [open, setOpen] = useState(false)

  const q = query.trim().toLowerCase()
  const matches = (
    q
      ? users.filter(u =>
          [u.user_name, u.first_name, u.last_name, u.email]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(q)
        )
      : users
  ).slice(0, 8)

  const handleType = (text: string) =>
    onChange({ query: text, email: EMAIL_RE.test(text.trim()) ? text.trim() : '' })

  const pick = (u: User) => {
    onChange({ query: peerLabel(u), email: u.email })
    setOpen(false)
  }

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={e => {
          handleType(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        placeholder="Name or email"
        // Browsers ignore autoComplete="off" for contact-like fields and show their
        // saved name/email overlay; "new-password" reliably suppresses that overlay
        // on a plain text input. The data-* attrs opt out of password-manager
        // overlays (Bitwarden, 1Password, LastPass, Dashlane), which also ignore "off".
        autoComplete="new-password"
        data-bwignore="true"
        data-1p-ignore="true"
        data-lpignore="true"
        data-form-type="other"
      />
      {open && matches.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-700 bg-slate-900 py-1 shadow-lg">
          {matches.map(u => {
            const selected = !!email && u.email === email
            return (
              <li key={u.id}>
                <button
                  type="button"
                  // Fire before the input's blur so the click registers.
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => pick(u)}
                  className={`flex w-full flex-col items-start px-2.5 py-1.5 text-left text-sm transition hover:bg-slate-800 ${
                    selected ? 'bg-slate-800' : ''
                  }`}
                >
                  <span className="text-slate-100">{peerLabel(u)}</span>
                  <span className="text-xs text-slate-500">{u.email}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
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

  // Only people the current user follows are suggested as assignees.
  const people = useQuery({
    queryKey: ['following', user?.user_name],
    enabled: !!user?.user_name,
    queryFn: async () =>
      (
        await api.get('/users/following', {
          params: { contactName: user?.user_name, nameFilter: '' },
        })
      ).data as User[],
  })

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [assigneeQuery, setAssigneeQuery] = useState('')
  const [assigneeEmail, setAssigneeEmail] = useState('')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [subtasks, setSubtasks] = useState<string[]>([])
  // When set, the form edits this already-sent (not yet accepted) task instead of
  // creating a new one. The "Send a task" card doubles as the edit form.
  const [editingId, setEditingId] = useState<number | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

  // Per-task action state so only the clicked card shows a spinner.
  const [pending, setPending] = useState<{ id: number; action: 'start' | 'done' } | null>(
    null
  )
  // Server-side reason a confirm was rejected (e.g. subtasks still open), per task.
  const [doneError, setDoneError] = useState<{ id: number; message: string } | null>(
    null
  )
  // Which task currently has a subtask toggle in flight.
  const [togglingId, setTogglingId] = useState<number | null>(null)
  // Which task currently has a delete in flight.
  const [deletingId, setDeletingId] = useState<number | null>(null)

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
  // The server rejects this with 400 until every subtask is complete.
  const doneTask = useMutation({
    mutationFn: async (task: Task) => {
      setPending({ id: task.id, action: 'done' })
      setDoneError(null)
      await api.put(`/tasks/confirm/${task.id}`, {
        messageTitle: 'Task completed',
        messageMessage: `"${task.name ?? `task #${task.id}`}" was marked done`,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (err, task) => {
      const e = err as { response?: { data?: { error?: string } }; message?: string }
      setDoneError({
        id: task.id,
        message: e.response?.data?.error ?? e.message ?? 'Failed to complete task',
      })
    },
    onSettled: () => setPending(null),
  })

  // Toggle one subtask's complete flag. Optimistically flips the cached task, then
  // posts the full updated list to the existing subtask-notification endpoint.
  const toggleSubtask = useMutation({
    mutationFn: async ({ task, index }: { task: Task; index: number }) => {
      const list = (task.sub_task_list ?? []).map((s, i) =>
        i === index ? { ...s, complete: !s.complete } : s
      )
      await api.put(`/tasks/${task.id}/notification/worker/subtask`, {
        position: index,
        text: ['Subtask', 'completed', '·', 'reopened'],
        sub_task_list: list,
      })
    },
    onMutate: async ({ task, index }) => {
      setTogglingId(task.id)
      const key = ['tasks', tab, user?.id]
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<Task[]>(key)
      qc.setQueryData<Task[]>(key, old =>
        (old ?? []).map(t =>
          t.id === task.id
            ? {
                ...t,
                sub_task_list: (t.sub_task_list ?? []).map((s, i) =>
                  i === index ? { ...s, complete: !s.complete } : s
                ),
              }
            : t
        )
      )
      return { prev, key }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev)
    },
    onSettled: () => {
      setTogglingId(null)
      qc.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  // Delete = drop a task the requester sent before it's been started. The server
  // hard-deletes; we only surface this for not-started tasks on the sent tab.
  const deleteTask = useMutation({
    mutationFn: async (task: Task) => {
      setDeletingId(task.id)
      await api.delete(`/tasks/${task.id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
    onSettled: () => setDeletingId(null),
  })

  const createTask = useMutation({
    mutationFn: async () => {
      const cleaned = subtasks.map(s => s.trim()).filter(Boolean)
      const res = await api.post('/tasks', {
        assignee_email: assigneeEmail,
        name,
        description,
        sub_task_list: cleaned.length
          ? cleaned.map((d, i) => ({
              id: i + 1,
              description: d,
              complete: false,
              order: i,
            }))
          : undefined,
        start_date: localToISO(startDate),
        due_date: localToISO(dueDate),
      })
      return res.data
    },
    onSuccess: () => {
      setName('')
      setDescription('')
      setSubtasks([])
      setAssigneeQuery('')
      setAssigneeEmail('')
      qc.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  // Clear the form and leave edit mode.
  function resetForm() {
    setEditingId(null)
    setName('')
    setDescription('')
    setSubtasks([])
    setAssigneeQuery('')
    setAssigneeEmail('')
    setStartDate('')
    setDueDate('')
  }

  // Edit = save changes to an already-sent task. The update endpoint only touches
  // the task's own fields (not the assignee), so the assignee stays locked.
  const updateTask = useMutation({
    mutationFn: async () => {
      if (editingId == null) return
      const cleaned = subtasks.map(s => s.trim()).filter(Boolean)
      const res = await api.put(`/tasks/${editingId}`, {
        name,
        description,
        sub_task_list: cleaned.map((d, i) => ({
          id: i + 1,
          description: d,
          complete: false,
          order: i,
        })),
        start_date: localToISO(startDate),
        due_date: localToISO(dueDate),
      })
      return res.data
    },
    onSuccess: () => {
      resetForm()
      qc.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  // Load a sent task into the form for editing and scroll the form into view.
  function startEdit(task: Task) {
    setEditingId(task.id)
    setName(task.name ?? '')
    setDescription(task.description ?? '')
    setSubtasks((task.sub_task_list ?? []).map(s => s.description ?? ''))
    setAssigneeQuery(peerLabel(task.assignee, task.assignee_email))
    setAssigneeEmail(task.assignee_email ?? '')
    setStartDate(task.start_date ? toLocalInput(new Date(task.start_date)) : '')
    setDueDate(task.due_date ? toLocalInput(new Date(task.due_date)) : '')
    createTask.reset()
    updateTask.reset()
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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
                onEdit={tab === 'sent' ? () => startEdit(t) : undefined}
                onDelete={tab === 'sent' ? () => deleteTask.mutate(t) : undefined}
                onToggleSubtask={index => toggleSubtask.mutate({ task: t, index })}
                pending={pending?.id === t.id ? pending.action : null}
                subtaskBusy={togglingId === t.id}
                deleting={deletingId === t.id}
                doneError={doneError?.id === t.id ? doneError.message : null}
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

      <div ref={formRef}>
      <Card
        title={
          <div className="flex items-center justify-between">
            <span>{editingId ? 'Edit task' : 'Send a task'}</span>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
            )}
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <Field label="assignee (name or email)">
            {editingId ? (
              <>
                <Input value={assigneeQuery} disabled />
                <p className="mt-1 text-[11px] text-slate-500">
                  The assignee can't be changed after a task is sent.
                </p>
              </>
            ) : (
              <AssigneePicker
                users={people.data ?? []}
                query={assigneeQuery}
                email={assigneeEmail}
                onChange={next => {
                  setAssigneeQuery(next.query)
                  setAssigneeEmail(next.email)
                }}
              />
            )}
          </Field>
          <Field label="title">
            <Input value={name} onChange={e => setName(e.target.value)} />
          </Field>
          <Field label="description">
            <Textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
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
          <Field label="Start date">
            <DateTimePicker
              value={startDate}
              min={nowLocalInputValue()}
              onChange={setStartDate}
              placeholder="Pick a start date"
            />
          </Field>
          <Field label="Due date">
            <DateTimePicker
              value={dueDate}
              min={startDate || nowLocalInputValue()}
              onChange={setDueDate}
              placeholder="Pick a due date"
            />
          </Field>
          {editingId ? (
            <Button
              onClick={() => updateTask.mutate()}
              disabled={updateTask.isPending || !name}
            >
              {updateTask.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          ) : (
            <Button
              onClick={() => createTask.mutate()}
              disabled={createTask.isPending || !assigneeEmail || !name}
            >
              {createTask.isPending ? 'Sending…' : 'Send task'}
            </Button>
          )}
          {!editingId && createTask.isSuccess && (
            <p className="text-xs text-emerald-400">Task sent ✓</p>
          )}
          {!editingId && createTask.error && (
            <p className="text-xs text-rose-400">
              {(createTask.error as Error).message}
            </p>
          )}
          {editingId && updateTask.error && (
            <p className="text-xs text-rose-400">
              {(updateTask.error as Error).message}
            </p>
          )}
        </div>
      </Card>
      </div>
    </div>
  )
}
