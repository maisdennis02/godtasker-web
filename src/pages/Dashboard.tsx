import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../auth/AuthContext'

type Tone = 'default' | 'urgent' | 'warning' | 'good'

const TONE: Record<Tone, { value: string; chip: string }> = {
  default: { value: 'text-white', chip: 'bg-slate-800 text-slate-300' },
  urgent: { value: 'text-rose-300', chip: 'bg-rose-500/15 text-rose-300' },
  warning: { value: 'text-amber-300', chip: 'bg-amber-500/15 text-amber-300' },
  good: { value: 'text-emerald-300', chip: 'bg-emerald-500/15 text-emerald-300' },
}

function num(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function Stat({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: unknown
  tone?: Tone
}) {
  const n = num(value)
  const dimmed = n === 0 && tone !== 'default'
  const t = dimmed ? TONE.default : TONE[tone]
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <p className={`text-2xl font-bold ${t.value}`}>{n}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  )
}

// A highlighted card for things that need attention right now.
function AttentionCard({
  label,
  value,
  tone,
  hint,
}: {
  label: string
  value: number
  tone: Tone
  hint: string
}) {
  const active = value > 0
  const t = active ? TONE[tone] : TONE.default
  return (
    <Link
      to="/tasks"
      className={`flex flex-col rounded-lg border p-4 transition hover:border-slate-600 ${
        active ? 'border-slate-700 bg-slate-900' : 'border-slate-800 bg-slate-900/40'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${t.chip}`}>
          {active ? 'needs action' : 'all clear'}
        </span>
      </div>
      <p className={`mt-2 text-3xl font-bold ${t.value}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </Link>
  )
}

// Sent / received summary: headline total, a finished-progress bar, and the breakdown.
function RoleSection({
  title,
  cta,
  total,
  initiated,
  finished,
  canceled,
  overdue,
  todayDue,
  tomorrowDue,
  weekDue,
}: {
  title: string
  cta: string
  total: number
  initiated: number
  finished: number
  canceled: number
  overdue: number
  todayDue: number
  tomorrowDue: number
  weekDue: number
}) {
  const pct = total > 0 ? Math.round((finished / total) * 100) : 0
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
          <p className="mt-1 text-3xl font-bold text-white">{total}</p>
        </div>
        <Link
          to="/tasks"
          className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
        >
          {cta} →
        </Link>
      </div>

      <div className="mb-4">
        <div className="mb-1 flex justify-between text-xs text-slate-400">
          <span>{finished} finished</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="In progress" value={initiated} />
        <Stat label="Finished" value={finished} tone="good" />
        <Stat label="Canceled" value={canceled} />
        <Stat label="Overdue" value={overdue} tone="urgent" />
        <Stat label="Due today" value={todayDue} tone="warning" />
        <Stat label="Due tomorrow" value={tomorrowDue} />
        <Stat label="Due this week" value={weekDue} />
        <Stat label="Total" value={total} />
      </div>
    </section>
  )
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-lg border border-slate-800 bg-slate-900/60" />
        ))}
      </div>
      <div className="h-56 rounded-xl border border-slate-800 bg-slate-900/40" />
      <div className="h-56 rounded-xl border border-slate-800 bg-slate-900/40" />
    </div>
  )
}

export function Dashboard() {
  const { user } = useAuth()
  const id = user?.id

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['dashboard', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/dashboard/${id}`, {
        params: { user_id: id, worker_id: id },
      })
      return res.data as Record<string, unknown>
    },
  })

  const name = user?.user_name || user?.email?.split('@')[0] || 'there'

  const totalOverdue =
    data ? num(data.userCountOverDue) + num(data.workerCountOverDue) : 0
  const totalDueToday =
    data ? num(data.userCountTodayDue) + num(data.workerCountTodayDue) : 0
  const totalDueTomorrow =
    data ? num(data.userCountTomorrowDue) + num(data.workerCountTomorrowDue) : 0
  const totalInProgress =
    data ? num(data.userCountInitiated) + num(data.workerCountInitiated) : 0

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            {greeting()}, {name} 👋
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Here's what's on your plate today.
          </p>
        </div>
        {data && (
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </button>
        )}
      </div>

      {isLoading && <Skeleton />}

      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4">
          <p className="text-sm font-medium text-rose-300">
            Couldn't load your dashboard.
          </p>
          <p className="mt-1 text-xs text-rose-400/80">
            Make sure the server is running, then{' '}
            <button onClick={() => refetch()} className="underline hover:text-rose-200">
              try again
            </button>
            .
          </p>
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Attention row — surfaces what's urgent across both roles. */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <AttentionCard
              label="Overdue"
              value={totalOverdue}
              tone="urgent"
              hint="Past their due date"
            />
            <AttentionCard
              label="Due today"
              value={totalDueToday}
              tone="warning"
              hint="Wrap these up today"
            />
            <AttentionCard
              label="Due tomorrow"
              value={totalDueTomorrow}
              tone="default"
              hint="Coming up next"
            />
            <AttentionCard
              label="In progress"
              value={totalInProgress}
              tone="default"
              hint="Currently active"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-400">
            <span>
              <span className="font-semibold text-white">
                {num(data.countFollowing)}
              </span>{' '}
              following
            </span>
            <span className="text-slate-700">·</span>
            <span>
              <span className="font-semibold text-white">
                {num(data.countFollowers)}
              </span>{' '}
              followers
            </span>
            <Link
              to="/people"
              className="ml-auto text-xs font-medium text-indigo-400 hover:text-indigo-300"
            >
              Manage people →
            </Link>
          </div>

          <RoleSection
            title="Tasks you sent"
            cta="View sent"
            total={num(data.userCountSent)}
            initiated={num(data.userCountInitiated)}
            finished={num(data.userCountFinished)}
            canceled={num(data.userCountCanceled)}
            overdue={num(data.userCountOverDue)}
            todayDue={num(data.userCountTodayDue)}
            tomorrowDue={num(data.userCountTomorrowDue)}
            weekDue={num(data.userCountThisWeekDue)}
          />

          <RoleSection
            title="Tasks you received"
            cta="View received"
            total={num(data.workerCountReceived)}
            initiated={num(data.workerCountInitiated)}
            finished={num(data.workerCountFinished)}
            canceled={num(data.workerCountCanceled)}
            overdue={num(data.workerCountOverDue)}
            todayDue={num(data.workerCountTodayDue)}
            tomorrowDue={num(data.workerCountTomorrowDue)}
            weekDue={num(data.workerCountThisWeekDue)}
          />
        </div>
      )}
    </div>
  )
}
