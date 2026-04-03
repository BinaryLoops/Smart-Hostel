import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { Card } from '../ui/Card'
import { api } from '../../services/api'

export function LaundryAnalyticsPanel() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    api
      .laundryAnalytics()
      .then((res) => alive && setData(res))
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'Failed to load analytics'))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  const week = data?.week || []
  const peak = data?.peakHour
  const suggestions = data?.suggestions || []

  const suggestionText = useMemo(() => {
    if (!suggestions.length) return 'No suggestions yet'
    return suggestions
      .map((s) => `${s.hour}:00 (${s.count})`)
      .join(' · ')
  }, [suggestions])

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-[var(--text-primary)]">Laundry usage analytics</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Weekly bookings, peak hours, and low-traffic slot suggestions.
            </p>
          </div>
        </div>
        {peak?.hour != null && (
          <span className="rounded-xl bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
            Peak: {peak.hour}:00 ({peak.count})
          </span>
        )}
      </div>

      {error && <div className="mt-3 text-sm text-[var(--danger)]">{error}</div>}
      {loading && <div className="mt-3 text-sm text-[var(--text-secondary)]">Loading…</div>}

      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={week} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="var(--accent)" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] p-3 text-xs text-[var(--text-secondary)]">
        <span className="font-medium text-[var(--text-primary)]">Suggested low-traffic hours:</span>{' '}
        {suggestionText}
      </div>
    </Card>
  )
}

