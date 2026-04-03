import { useEffect, useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { api } from '../../services/api'

const SLOTS = ['9–10 AM', '10–11 AM', '4–5 PM', '5–6 PM']

export function LaundryBookingPanel({ userId }) {
  const [slot, setSlot] = useState(SLOTS[0])
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function refresh() {
    const res = await api.laundryBookings(userId)
    setItems(res.items || [])
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  async function book() {
    setBusy(true)
    setError('')
    try {
      await api.createLaundryBooking(userId, { slot, time: new Date().toISOString() })
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create booking')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <CalendarPlus className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-[var(--text-primary)]">Book a slot</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Tracks bookings for analytics (demo backend store).
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="text-xs font-medium text-[var(--text-secondary)]">Slot</label>
        <select
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-3 py-2 text-sm"
          value={slot}
          onChange={(e) => setSlot(e.target.value)}
        >
          {SLOTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <Button className="ml-auto" variant="outline" onClick={book} disabled={busy}>
          {busy ? 'Booking…' : 'Book'}
        </Button>
      </div>

      {error && <div className="mt-3 text-sm text-[var(--danger)]">{error}</div>}

      <div className="mt-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
          Recent bookings
        </p>
        <ul className="mt-2 space-y-2">
          {items.slice(0, 6).map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-[var(--text-primary)]">{b.slot}</span>
              <span className="text-xs text-[var(--text-secondary)]">
                {b.time ? new Date(b.time).toLocaleString() : ''}
              </span>
            </li>
          ))}
          {!items.length && (
            <li className="text-sm text-[var(--text-secondary)]">No bookings yet.</li>
          )}
        </ul>
      </div>
    </Card>
  )
}

