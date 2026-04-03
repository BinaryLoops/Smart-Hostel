import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { QrCode, Clock, UtensilsCrossed, Star, Send } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { submitMessFeedback } from '../services/messService'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

const TIMINGS = [
  { meal: 'Breakfast', window: '7:00 – 9:30 AM', hall: 'Main Mess' },
  { meal: 'Lunch', window: '12:00 – 2:30 PM', hall: 'Main Mess' },
  { meal: 'Snacks', window: '4:30 – 5:30 PM', hall: 'Cafeteria' },
  { meal: 'Dinner', window: '7:30 – 9:30 PM', hall: 'Main Mess' },
]

const MENU_TODAY = {
  breakfast: ['Idli & sambar', 'Boiled eggs', 'Tea & coffee', 'Fruit'],
  lunch: ['Rajma chawal', 'Seasonal veg', 'Salad', 'Curd'],
  dinner: ['Paneer curry', 'Roti', 'Dal', 'Sweet — Gulab jamun'],
}

/** Feedback allowed only after lunch window start (demo: after 12:00 local) — simplified */
function canSubmitFeedback() {
  const h = new Date().getHours()
  return h >= 12
}

export function Mess() {
  const { user } = useAuth()
  const userId = user?.uid || user?.email || 'demo'
  const [rating, setRating] = useState(4)
  const [comment, setComment] = useState('')
  const [meal, setMeal] = useState('lunch')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [attendanceDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [attendanceMsg, setAttendanceMsg] = useState('')
  const [roomServiceNote, setRoomServiceNote] = useState('')
  const [roomServiceMsg, setRoomServiceMsg] = useState('')
  const [attendanceBusy, setAttendanceBusy] = useState(false)
  const [roomServiceBusy, setRoomServiceBusy] = useState(false)

  const qrPayload = useMemo(
    () => `SHP|MESS|${new Date().toISOString().slice(0, 10)}|STU|DEMO`,
    []
  )

  async function handleFeedback(e) {
    e.preventDefault()
    if (!canSubmitFeedback()) {
      setErr('Feedback opens after lunch hours (demo rule).')
      return
    }
    setErr('')
    setBusy(true)
    try {
      await submitMessFeedback({
        meal,
        rating,
        comment,
        submittedAt: new Date().toISOString(),
      })
      setSent(true)
      setComment('')
    } catch (e2) {
      setErr(e2.message || 'Could not save feedback')
    } finally {
      setBusy(false)
    }
  }

  async function markAttendance(attended, mealKey) {
    setAttendanceMsg('')
    setAttendanceBusy(true)
    try {
      await api.messAttendanceMark(userId, { date: attendanceDate, meal: mealKey, attended })
      setAttendanceMsg(`Marked ${mealKey} as ${attended ? 'attended' : 'missed'}.`)
    } catch (e2) {
      setAttendanceMsg(e2 instanceof Error ? e2.message : 'Failed')
    } finally {
      setAttendanceBusy(false)
    }
  }

  async function notifyParent() {
    setAttendanceMsg('')
    setAttendanceBusy(true)
    try {
      const res = await api.messNotifyParent(userId, attendanceDate)
      setAttendanceMsg(`Parent notification queued. Missed meals: ${res.missedMeals?.join(', ') || 'none'}.`)
    } catch (e2) {
      setAttendanceMsg(e2 instanceof Error ? e2.message : 'Failed')
    } finally {
      setAttendanceBusy(false)
    }
  }

  async function requestRoomService() {
    setRoomServiceMsg('')
    setRoomServiceBusy(true)
    try {
      await api.roomServiceRequest(userId, roomServiceNote || 'Not well')
      setRoomServiceMsg('Room service request submitted.')
      setRoomServiceNote('')
    } catch (e2) {
      setRoomServiceMsg(e2 instanceof Error ? e2.message : 'Failed')
    } finally {
      setRoomServiceBusy(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Mess"
        description="QR entry (simulated), today’s menu, timings, and optional meal feedback."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-1"
        >
          <Card className="flex flex-col items-center p-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <QrCode className="h-7 w-7" />
            </div>
            <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--text-primary)]">
              Scan to enter
            </p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Show this at the mess counter (demo QR pattern).
            </p>
            <div className="mt-6 grid h-40 w-40 place-items-center rounded-2xl border-2 border-dashed border-[var(--border-subtle)] bg-[var(--bg-muted)] p-2">
              <div className="grid h-full w-full grid-cols-8 gap-0.5 opacity-90">
                {Array.from({ length: 64 }).map((_, i) => (
                  <span
                    key={i}
                    className={`rounded-sm ${i % 7 === 0 || i % 11 === 0 ? 'bg-[var(--text-primary)]' : 'bg-transparent'}`}
                  />
                ))}
              </div>
            </div>
            <p className="mt-4 max-w-[220px] break-all font-mono text-[10px] text-[var(--text-secondary)]">
              {qrPayload}
            </p>
          </Card>
        </motion.div>

        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-[var(--accent)]" />
              <h3 className="font-[family-name:var(--font-display)] font-semibold text-[var(--text-primary)]">
                Today’s menu
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {['breakfast', 'lunch', 'dinner'].map((key) => (
                <div
                  key={key}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)]/60 p-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                    {key}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-[var(--text-primary)]">
                    {MENU_TODAY[key].map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-[var(--accent)]" />
              <h3 className="font-[family-name:var(--font-display)] font-semibold text-[var(--text-primary)]">
                Meal timings
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
                    <th className="pb-2 pr-4 font-medium">Meal</th>
                    <th className="pb-2 pr-4 font-medium">Window</th>
                    <th className="pb-2 font-medium">Venue</th>
                  </tr>
                </thead>
                <tbody>
                  {TIMINGS.map((t) => (
                    <tr key={t.meal} className="border-b border-[var(--border-subtle)]/60">
                      <td className="py-2.5 font-medium text-[var(--text-primary)]">{t.meal}</td>
                      <td className="py-2.5 text-[var(--text-secondary)]">{t.window}</td>
                      <td className="py-2.5 text-[var(--text-secondary)]">{t.hall}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-[family-name:var(--font-display)] font-semibold text-[var(--text-primary)]">
              Meal feedback
            </h3>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Optional — opens after lunch (demo). Stored in Firestore or local demo storage.
            </p>
            <form onSubmit={handleFeedback} className="mt-4 space-y-4">
              <div className="flex flex-wrap gap-3">
                <label className="text-xs font-medium text-[var(--text-secondary)]">Meal</label>
                <select
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-3 py-2 text-sm sm:max-w-xs"
                  value={meal}
                  onChange={(e) => setMeal(e.target.value)}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="snacks">Snacks</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
                  <Star className="h-3.5 w-3.5 text-amber-500" />
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className={`h-10 w-10 rounded-xl text-sm font-semibold transition ${
                        rating >= n
                          ? 'bg-[var(--accent)] text-white'
                          : 'bg-[var(--bg-muted)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                  Comment (optional)
                </label>
                <textarea
                  className="min-h-[88px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-3 py-2 text-sm"
                  placeholder="Portion size, spice level, hygiene…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              {err && <p className="text-sm text-[var(--danger)]">{err}</p>}
              {sent && (
                <p className="text-sm text-[var(--accent)]">Thanks — feedback saved.</p>
              )}
              <Button type="submit" disabled={busy}>
                <Send className="h-4 w-4" />
                {busy ? 'Sending…' : 'Submit feedback'}
              </Button>
            </form>
          </Card>

          <Card className="p-5">
            <h3 className="font-[family-name:var(--font-display)] font-semibold text-[var(--text-primary)]">
              Mess attendance
            </h3>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Track missed meals and notify parents.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {['breakfast', 'lunch', 'dinner'].map((m) => (
                <div key={m} className="rounded-xl border border-[var(--border-subtle)] p-3">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{m}</p>
                  <div className="mt-2 flex gap-2">
                    <Button variant="outline" onClick={() => markAttendance(true, m)}>
                      {attendanceBusy ? 'Saving…' : 'Attended'}
                    </Button>
                    <Button variant="ghost" onClick={() => markAttendance(false, m)} disabled={attendanceBusy}>
                      {attendanceBusy ? 'Saving…' : 'Missed'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={notifyParent} disabled={attendanceBusy}>
                {attendanceBusy ? 'Sending…' : 'Send missed meal details to parent'}
              </Button>
              {attendanceMsg && <span className="text-sm text-[var(--text-secondary)]">{attendanceMsg}</span>}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-[family-name:var(--font-display)] font-semibold text-[var(--text-primary)]">
              Room service (not well)
            </h3>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              If unwell, request meal delivery to your room.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-3 py-2 text-sm"
                value={roomServiceNote}
                onChange={(e) => setRoomServiceNote(e.target.value)}
                placeholder="Reason / health note"
              />
              <Button variant="outline" onClick={requestRoomService} disabled={roomServiceBusy}>
                {roomServiceBusy ? 'Requesting…' : 'Request'}
              </Button>
            </div>
            {roomServiceMsg && <p className="mt-2 text-sm text-[var(--text-secondary)]">{roomServiceMsg}</p>}
          </Card>
        </div>
      </div>
    </div>
  )
}
