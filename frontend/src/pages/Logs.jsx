import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

function badge(minutesLate) {
  if (minutesLate >= 60) return 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-200'
  if (minutesLate >= 15) return 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200'
  return 'border-[var(--border-subtle)] bg-[var(--bg-muted)] text-[var(--text-secondary)]'
}

export function Logs() {
  const { user } = useAuth()
  const userId = user?.uid || user?.email || 'demo'
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const lateSummary = useMemo(() => {
    const moderate = items.filter((x) => x.minutesLate >= 15 && x.minutesLate < 60).length
    const extreme = items.filter((x) => x.minutesLate >= 60).length
    return { moderate, extreme }
  }, [items])

  async function refresh() {
    const res = await api.entryExitMy(userId)
    setItems(res.items || [])
  }

  useEffect(() => {
    setLoading(true)
    void refresh().finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  async function add(kind) {
    setBusy(true)
    setError('')
    try {
      const now = new Date()
      const expected = new Date(now)
      expected.setMinutes(now.getMinutes() - 10) // demo: expected 10 mins earlier → shows small lateness
      await api.entryExitCreate(userId, {
        kind,
        expectedAt: expected.toISOString(),
        actualAt: now.toISOString(),
      })
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Entry / Exit logs"
        description="Late entries are highlighted: yellow (moderate), red (extreme)."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <p className="font-semibold text-[var(--text-primary)]">Quick add</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Demo buttons to create a log entry. In production, integrate with gate/QR scan.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => add('entry')} disabled={busy}>
              {busy ? 'Saving…' : 'Add Entry'}
            </Button>
            <Button variant="outline" onClick={() => add('exit')} disabled={busy}>
              {busy ? 'Saving…' : 'Add Exit'}
            </Button>
          </div>
          <div className="mt-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] p-4 text-sm">
            <p className="text-[var(--text-secondary)]">This month</p>
            <p className="mt-1 text-sm text-[var(--text-primary)]">
              Moderate late: <strong>{lateSummary.moderate}</strong>
            </p>
            <p className="text-sm text-[var(--text-primary)]">
              Extreme late: <strong>{lateSummary.extreme}</strong>
            </p>
          </div>
          {error && <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>}
        </Card>

        <Card className="p-0 lg:col-span-2">
          <div className="border-b border-[var(--border-subtle)] px-5 py-3 font-semibold text-[var(--text-primary)]">
            Recent logs
          </div>

          {/* Mobile-first: stacked cards; on desktop it still looks like a list */}
          <div className="divide-y divide-[var(--border-subtle)]">
            {loading && (
              <div className="px-5 py-6 text-sm text-[var(--text-secondary)]">Loading logs…</div>
            )}
            {items.slice(0, 30).map((x) => (
              <div key={x.id} className="px-5 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {x.kind?.toUpperCase()} · {x.minutesLate || 0} min late
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                      Expected: {x.expectedAt ? new Date(x.expectedAt).toLocaleString() : '—'} · Actual:{' '}
                      {x.actualAt ? new Date(x.actualAt).toLocaleString() : '—'}
                    </p>
                  </div>
                  <span className={`rounded-xl border px-3 py-1 text-xs font-medium ${badge(x.minutesLate || 0)}`}>
                    {x.minutesLate >= 60 ? 'Extremely late' : x.minutesLate >= 15 ? 'Moderately late' : 'On time'}
                  </span>
                </div>
              </div>
            ))}
            {!loading && !items.length && (
              <div className="px-5 py-6 text-sm text-[var(--text-secondary)]">No logs yet.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

