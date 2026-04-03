import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '../ui/Card'
import { api } from '../../services/api'

export function ComplaintAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    api
      .complaintAnalytics()
      .then((res) => {
        if (!alive) return
        setData(res)
      })
      .catch((e) => {
        if (!alive) return
        setError(e instanceof Error ? e.message : 'Failed to load analytics')
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const chart = useMemo(() => {
    const counts = data?.counts || {}
    return Object.entries(counts).map(([category, count]) => ({ category, count }))
  }, [data])

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-[var(--text-primary)]">Complaint heatmap</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Category distribution (electrical, plumbing, wifi, cleaning).
          </p>
        </div>
        {data?.mostFrequent?.category && (
          <span className="rounded-xl bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
            Most frequent: {data.mostFrequent.category} ({data.mostFrequent.count})
          </span>
        )}
      </div>

      {error && <div className="mt-3 text-sm text-[var(--danger)]">{error}</div>}
      {loading && <div className="mt-3 text-sm text-[var(--text-secondary)]">Loading…</div>}

      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chart} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <XAxis dataKey="category" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="var(--accent)" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

