import { useMemo, useState } from 'react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { GatePassModal } from '../components/gatepass/GatePassModal'
import { useAuth } from '../context/AuthContext'

const MOCK = [
  { id: 1, from: '2026-04-05', to: '2026-04-07', reason: 'Home visit', status: 'Pending' },
]

export function Leave() {
  const { user, profile } = useAuth()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [reason, setReason] = useState('')
  const [gatePassOpen, setGatePassOpen] = useState(false)

  const studentId = useMemo(() => user?.uid || user?.email || 'demo-student', [user])
  const roomNumber = useMemo(() => profile?.roomNumber || 'B-204', [profile])
  const timeOut = useMemo(() => new Date().toISOString(), [])

  function submit(e) {
    e.preventDefault()
    alert('Leave request submitted (wire to API/Firestore later).')
  }

  return (
    <div>
      <PageHeader
        title="Leave & outing"
        description="Submit requests; admins approve or reject with status tracking."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-semibold text-[var(--text-primary)]">New request</h3>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <label className="text-xs text-[var(--text-secondary)]">From</label>
            <input
              type="date"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-3 py-2 text-sm"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              required
            />
            <label className="text-xs text-[var(--text-secondary)]">To</label>
            <input
              type="date"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-3 py-2 text-sm"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />
            <textarea
              className="min-h-[88px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-3 py-2 text-sm"
              placeholder="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
            <Button type="submit">Submit</Button>
          </form>

          <div className="mt-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] p-4">
            <p className="text-sm font-semibold text-[var(--text-primary)]">QR gate pass</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Generate a QR outing pass without storing any credentials.
            </p>
            <Button className="mt-3" variant="outline" onClick={() => setGatePassOpen(true)}>
              Generate Gate Pass
            </Button>
          </div>
        </Card>
        <Card className="p-0">
          <div className="border-b border-[var(--border-subtle)] px-5 py-3 font-semibold">History (mock)</div>
          {MOCK.map((r) => (
            <div key={r.id} className="border-b border-[var(--border-subtle)] px-5 py-3 text-sm last:border-0">
              <p className="font-medium text-[var(--text-primary)]">
                {r.from} → {r.to}
              </p>
              <p className="text-[var(--text-secondary)]">{r.reason}</p>
              <p className="mt-1 text-xs text-[var(--accent)]">{r.status}</p>
            </div>
          ))}
        </Card>
      </div>

      <GatePassModal
        open={gatePassOpen}
        onClose={() => setGatePassOpen(false)}
        studentId={studentId}
        roomNumber={roomNumber}
        timeOut={timeOut}
      />
    </div>
  )
}
