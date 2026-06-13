import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuth } from '../auth/AuthContext'
import { Button, Card, Field, Input, Textarea } from '../components/ui'
import { DataResult } from '../components/DataResult'
import { localToISO, nowLocalInputValue } from '../lib/format'
import type { Task } from '../types'

type Tab = 'sent' | 'received'

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

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        <h2 className="mb-3 text-xl font-bold text-white">Tasks</h2>

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

        {tasksQuery.isLoading && <p className="text-slate-400">Loading…</p>}
        {tasksQuery.error && <p className="text-rose-400">Failed to load tasks.</p>}
        {tasksQuery.data && <DataResult data={tasksQuery.data} />}
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
          <Button onClick={() => createTask.mutate()} disabled={createTask.isPending}>
            {createTask.isPending ? 'Sending…' : 'Send task'}
          </Button>
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
