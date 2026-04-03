import { useEffect, useMemo, useState } from 'react'
import { Pin, Megaphone } from 'lucide-react'
import { Card } from '../ui/Card'
import { api } from '../../services/api'

function priorityColor(p) {
  if (p >= 4) return 'bg-rose-500/10 text-rose-600 dark:text-rose-300'
  if (p >= 3) return 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
  return 'bg-[var(--accent-soft)] text-[var(--accent)]'
}

export function AnnouncementsPanel() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    api
      .announcements()
      .then((res) => {
        if (!alive) return
        setItems(res.items || [])
      })
      .catch((e) => {
        if (!alive) return
        setError(e instanceof Error ? e.message : 'Failed to load announcements')
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const pinned = useMemo(() => items.filter((a) => a.pinned), [items])
  const rest = useMemo(() => items.filter((a) => !a.pinned), [items])

  return (
    <Card className="p-0">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-5 py-3">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-[var(--accent)]" />
          <span className="font-semibold text-[var(--text-primary)]">Announcements</span>
        </div>
        <span className="text-xs text-[var(--text-secondary)]">
          {loading ? 'Loading…' : `${items.length} total`}
        </span>
      </div>

      <div className="divide-y divide-[var(--border-subtle)]">
        {error && <div className="px-5 py-3 text-sm text-[var(--danger)]">{error}</div>}

        {!loading && !items.length && (
          <div className="px-5 py-4 text-sm text-[var(--text-secondary)]">
            No announcements yet.
          </div>
        )}

        {[...pinned, ...rest].slice(0, 6).map((a) => (
          <div key={a.id} className="px-5 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {a.pinned && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-[var(--bg-muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-primary)]">
                      <Pin className="h-3 w-3" />
                      Pinned
                    </span>
                  )}
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priorityColor(
                      a.priority || 1
                    )}`}
                  >
                    Priority {a.priority || 1}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm font-medium text-[var(--text-primary)]">
                  {a.title}
                </p>
                {a.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-[var(--text-secondary)]">
                    {a.description}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-[10px] text-[var(--text-secondary)]">{a.date}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

