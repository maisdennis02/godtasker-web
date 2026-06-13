import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuth } from '../auth/AuthContext'
import { Card } from '../components/ui'

function Stat({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-2xl font-bold text-white">{String(value ?? 0)}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  )
}

export function Dashboard() {
  const { user } = useAuth()
  const id = user?.id

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/dashboard/${id}`, {
        params: { user_id: id, worker_id: id },
      })
      return res.data as Record<string, unknown>
    },
  })

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-white">Dashboard</h2>
      <p className="mb-5 text-sm text-slate-400">
        Aggregated counts for {user?.email}
      </p>

      {isLoading && <p className="text-slate-400">Loading…</p>}
      {error && (
        <p className="text-rose-400">
          Failed to load dashboard. Make sure the server is running.
        </p>
      )}

      {data && (
        <>
          <div className="mb-4 flex gap-6">
            <Card title="Following">
              <p className="text-3xl font-bold text-white">
                {String(data.countFollowing ?? 0)}
              </p>
            </Card>
            <Card title="Followers">
              <p className="text-3xl font-bold text-white">
                {String(data.countFollowers ?? 0)}
              </p>
            </Card>
          </div>

          <h3 className="mb-2 mt-6 text-sm font-semibold text-slate-300">
            Tasks you sent
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Sent" value={data.userCountSent} />
            <Stat label="Initiated" value={data.userCountInitiated} />
            <Stat label="Finished" value={data.userCountFinished} />
            <Stat label="Canceled" value={data.userCountCanceled} />
            <Stat label="Overdue" value={data.userCountOverDue} />
            <Stat label="Due today" value={data.userCountTodayDue} />
            <Stat label="Due tomorrow" value={data.userCountTomorrowDue} />
            <Stat label="Due this week" value={data.userCountThisWeekDue} />
          </div>

          <h3 className="mb-2 mt-6 text-sm font-semibold text-slate-300">
            Tasks you received
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Received" value={data.workerCountReceived} />
            <Stat label="Initiated" value={data.workerCountInitiated} />
            <Stat label="Finished" value={data.workerCountFinished} />
            <Stat label="Canceled" value={data.workerCountCanceled} />
            <Stat label="Overdue" value={data.workerCountOverDue} />
            <Stat label="Due today" value={data.workerCountTodayDue} />
            <Stat label="Due tomorrow" value={data.workerCountTomorrowDue} />
            <Stat label="Due this week" value={data.workerCountThisWeekDue} />
          </div>
        </>
      )}
    </div>
  )
}
