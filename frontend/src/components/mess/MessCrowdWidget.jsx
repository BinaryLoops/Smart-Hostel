import { useEffect, useMemo, useState } from 'react'
import { Users, UtensilsCrossed } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { api } from '../../services/api'

function tone(label) {
  if (label === 'Crowded') return 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-200'
  if (label === 'Moderate') return 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200'
  return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
}

export function MessCrowdWidget({ userId }) {
  const [slot, setSlot] = useState('dinner')
  const [status, setStatus] = useState({ label: 'Free', count: 0 })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    api
      .messCrowd(slot)
      .then((res) => alive && setStatus(res))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [slot])

  const badge = useMemo(() => tone(status.label), [status.label])

  async function markGoing() {
    setBusy(true)
    try {
      await api.markGoingToMess(userId, slot)
      const res = await api.messCrowd(slot)
      setStatus(res)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-[var(--text-primary)]">Mess crowd prediction</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Students mark intent; we show a simple crowd label per slot.
            </p>
          </div>
        </div>
        <span className={`rounded-xl border px-3 py-1 text-xs font-medium ${badge}`}>
          {status.label}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="text-xs font-medium text-[var(--text-secondary)]">Time slot</label>
        <select
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-3 py-2 text-sm"
          value={slot}
          onChange={(e) => setSlot(e.target.value)}
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="snacks">Snacks</option>
          <option value="dinner">Dinner</option>
        </select>
        <div className="ml-auto inline-flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <Users className="h-4 w-4" />
          {status.count} going
        </div>
      </div>

      <Button className="mt-4" variant="outline" onClick={markGoing} disabled={busy}>
        {busy ? 'Saving…' : 'Going to mess'}
      </Button>
    </Card>
  )
}

