import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Timer, CheckCircle2 } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { api } from '../../services/api'

function daysLeft(dateStr) {
  const target = new Date(dateStr).getTime()
  const now = Date.now()
  const d = Math.ceil((target - now) / (1000 * 60 * 60 * 24))
  return d
}

export function EventsBoard({ userId }) {
  const [items, setItems] = useState([])
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setError('')
    api
      .events()
      .then((res) => alive && setItems(res.items || []))
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'Failed to load events'))
    return () => {
      alive = false
    }
  }, [])

  const upcoming = useMemo(() => items.slice(0, 8), [items])

  async function rsvp(id) {
    setBusyId(id)
    setError('')
    try {
      await api.rsvpEvent(userId, id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'RSVP failed')
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {error && (
        <Card className="p-5 md:col-span-2">
          <p className="text-sm text-[var(--danger)]">{error}</p>
        </Card>
      )}

      {!upcoming.length && (
        <Card className="p-5 md:col-span-2">
          <p className="text-sm text-[var(--text-secondary)]">
            No events yet. (Admins can create events via `POST /api/events`.)
          </p>
        </Card>
      )}

      {upcoming.map((e) => {
        const left = daysLeft(e.date)
        return (
          <Card key={e.id} className="flex flex-col p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--text-primary)]">
                {e.title}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[var(--accent)]" />
                  {new Date(e.date).toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Timer className="h-4 w-4 text-[var(--accent)]" />
                  {left >= 0 ? `${left} days left` : 'Started'}
                </span>
              </div>
              {e.description && (
                <p className="mt-2 line-clamp-2 text-xs text-[var(--text-secondary)]">{e.description}</p>
              )}
            </div>
            <Button
              className="mt-4 sm:mt-0"
              variant="outline"
              onClick={() => rsvp(e.id)}
              disabled={busyId === e.id}
            >
              <CheckCircle2 className="h-4 w-4" />
              {busyId === e.id ? 'Saving…' : 'RSVP'}
            </Button>
          </Card>
        )
      })}
    </div>
  )
}

