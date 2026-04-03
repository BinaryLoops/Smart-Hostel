import { useEffect, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { api } from '../../services/api'

export function ActivityLogsPanel({ userId, role }) {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [filterStudentId, setFilterStudentId] = useState('')

  async function refresh() {
    const params = {}
    if (filterType) params.type = filterType
    if (filterStudentId) params.studentId = filterStudentId
    const res = await api.adminListActivityLogs(userId, role, params)
    setItems(res.items || [])
  }

  useEffect(() => {
    let alive = true
    setError('')
    api
      .adminListActivityLogs(userId, role, {})
      .then((res) => alive && setItems(res.items || []))
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'Failed to load logs'))
    return () => {
      alive = false
    }
  }, [role, userId])

  async function apply() {
    setBusy(true)
    setError('')
    try {
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Filter failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-[var(--text-primary)]">Late entry / activity logs</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Admin view across hostel; students submit their own entries.
            </p>
          </div>
        </div>
        <span className="text-xs text-[var(--text-secondary)]">{items.length} logs</span>
      </div>

      {error && <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-3 py-2 text-sm"
          placeholder="Filter studentId"
          value={filterStudentId}
          onChange={(e) => setFilterStudentId(e.target.value)}
        />
        <select
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-3 py-2 text-sm"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All types</option>
          <option value="late_entry">late_entry</option>
          <option value="activity">activity</option>
        </select>
        <Button className="ml-auto" variant="outline" onClick={apply} disabled={busy}>
          {busy ? 'Applying…' : 'Apply'}
        </Button>
      </div>

      <div className="mt-4 overflow-auto rounded-2xl border border-[var(--border-subtle)]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[var(--bg-muted)] text-[var(--text-secondary)]">
            <tr>
              <th className="px-4 py-2 font-medium">When</th>
              <th className="px-4 py-2 font-medium">Student</th>
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 20).map((l) => (
              <tr key={l.id} className="border-t border-[var(--border-subtle)]/60">
                <td className="px-4 py-2 text-[var(--text-secondary)]">
                  {l.at ? new Date(l.at).toLocaleString() : ''}
                </td>
                <td className="px-4 py-2 font-mono text-[var(--text-primary)]">{l.studentId}</td>
                <td className="px-4 py-2 text-[var(--text-secondary)]">{l.type}</td>
                <td className="px-4 py-2 text-[var(--text-secondary)]">{l.note}</td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td className="px-4 py-3 text-[var(--text-secondary)]" colSpan={4}>
                  No logs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

