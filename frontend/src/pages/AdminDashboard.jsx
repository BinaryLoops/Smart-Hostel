import { useEffect, useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { listMessFeedback } from '../services/messService'
import { summarizeMessFeedback } from '../services/gemini'
import { Sparkles, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { StudentsPanel } from '../components/admin/StudentsPanel'
import { ActivityLogsPanel } from '../components/admin/ActivityLogsPanel'
import { AlertTriangle } from 'lucide-react'

const complaintTrend = [
  { week: 'W1', open: 12, resolved: 8 },
  { week: 'W2', open: 9, resolved: 11 },
  { week: 'W3', open: 14, resolved: 10 },
  { week: 'W4', open: 7, resolved: 13 },
]

const attendanceSeries = [
  { day: 'Mon', pct: 92 },
  { day: 'Tue', pct: 88 },
  { day: 'Wed', pct: 95 },
  { day: 'Thu', pct: 90 },
  { day: 'Fri', pct: 93 },
  { day: 'Sat', pct: 85 },
  { day: 'Sun', pct: 82 },
]

export function AdminDashboard() {
  const { user, profile } = useAuth()
  const userId = user?.uid || user?.email || 'demo'
  const role = profile?.role || 'student'
  const [items, setItems] = useState([])
  const [summary, setSummary] = useState('')
  const [loadingAi, setLoadingAi] = useState(false)
  const [redAlerts, setRedAlerts] = useState([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [list, entryRes] = await Promise.all([
         listMessFeedback(),
         api.adminListEntryExitLogs(userId, role).catch(() => ({items:[]}))
      ])
      if (!cancelled) {
         setItems(list)
         const alerts = (entryRes.items || []).filter(l => l.isRedAlert)
         setRedAlerts(alerts)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userId, role])

  const foodStats = useMemo(() => {
    const map = {}
    for (const f of items) {
      const dish = f.comment?.split(' ').slice(0, 2).join(' ') || 'General'
      const key = dish.length > 24 ? dish.slice(0, 24) + '…' : dish
      if (!map[key]) map[key] = { likes: 0, dislikes: 0 }
      if (Number(f.rating) >= 4) map[key].likes += 1
      else map[key].dislikes += 1
    }
    return Object.entries(map).map(([name, v]) => ({ name, ...v }))
  }, [items])

  const ratingTrend = useMemo(() => {
    const byDay = {}
    for (const f of items) {
      const day = (f.submittedAt || '').slice(0, 10) || 'unknown'
      if (!byDay[day]) byDay[day] = { day, sum: 0, n: 0 }
      byDay[day].sum += Number(f.rating) || 0
      byDay[day].n += 1
    }
    return Object.values(byDay)
      .map((d) => ({ day: d.day, avg: d.n ? Math.round((d.sum / d.n) * 10) / 10 : 0 }))
      .slice(0, 14)
  }, [items])

  async function runAi() {
    setLoadingAi(true)
    try {
      const text = await summarizeMessFeedback(items)
      setSummary(text)
    } finally {
      setLoadingAi(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Admin console"
        description="Complaints pipeline, mess analytics, attendance — charts update from feedback data where available."
        action={
          <Button variant="outline" onClick={runAi} disabled={loadingAi}>
            <Sparkles className="h-4 w-4" />
            {loadingAi ? 'Summarizing…' : 'AI summary'}
          </Button>
        }
      />

      {redAlerts.length > 0 && (
        <Card className="mb-6 border border-[var(--danger)]/50 bg-[var(--danger)]/10 p-4">
           <div className="flex items-center gap-2 text-[var(--danger)]">
             <AlertTriangle className="h-5 w-5" />
             <h3 className="font-semibold">CRITICAL CODE OF CONDUCT BREACHES ({redAlerts.length})</h3>
           </div>
           <div className="mt-3 grid gap-2">
             {redAlerts.slice(0, 5).map((alert, i) => (
                <div key={i} className="rounded-xl border border-[var(--danger)]/20 bg-[var(--bg-elevated)] p-3 text-sm">
                   <p className="font-semibold text-[var(--text-primary)]">{alert.studentName} ({alert.studentBlock})</p>
                   <p className="text-[var(--danger)] mt-1">{alert.alertReason}</p>
                   <p className="text-[10px] text-[var(--text-secondary)] mt-1">{new Date(alert.actualAt).toLocaleString()}</p>
                </div>
             ))}
           </div>
        </Card>
      )}

      {summary && (
        <Card className="mb-6 border-[var(--accent)]/30 bg-[var(--accent-soft)]/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            AI / heuristic insight
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--text-primary)]">{summary}</p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-[family-name:var(--font-display)] font-semibold text-[var(--text-primary)]">
              Complaints vs resolved
            </h3>
            <RefreshCw className="h-4 w-4 text-[var(--text-secondary)]" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complaintTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="week" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                  }}
                />
                <Legend />
                <Bar dataKey="open" fill="var(--chart-3)" name="Open" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="var(--chart-1)" name="Resolved" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="mb-4 font-[family-name:var(--font-display)] font-semibold text-[var(--text-primary)]">
            Attendance % (weekly mock)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis domain={[70, 100]} stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="pct"
                  name="% present"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4 lg:col-span-2">
          <h3 className="mb-4 font-[family-name:var(--font-display)] font-semibold text-[var(--text-primary)]">
            Mess feedback — likes vs dislikes (from comments heuristic)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={foodStats.length ? foodStats : [{ name: 'No data', likes: 0, dislikes: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                  }}
                />
                <Legend />
                <Bar dataKey="likes" fill="var(--chart-1)" name="High ratings (4–5★)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="dislikes" fill="var(--danger)" name="Low ratings (≤3★)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4 lg:col-span-2">
          <h3 className="mb-4 font-[family-name:var(--font-display)] font-semibold text-[var(--text-primary)]">
            Average rating trend (from stored feedback)
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ratingTrend.length ? ratingTrend : [{ day: '—', avg: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis domain={[0, 5]} stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                  }}
                />
                <Line type="monotone" dataKey="avg" stroke="var(--chart-4)" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6">
        <StudentsPanel userId={userId} role={role} />
        <ActivityLogsPanel userId={userId} role={role} />
      </div>
    </div>
  )
}
