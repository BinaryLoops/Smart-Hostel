import { useEffect, useState } from 'react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

export function Hospital() {
  const { user } = useAuth()
  const userId = user?.uid || user?.email || 'demo'
  const [pickup, setPickup] = useState('Hostel Main Gate')
  const [note, setNote] = useState('')
  const [referredHospital, setReferredHospital] = useState('')
  const [attendantName, setAttendantName] = useState('')
  const [attendantPhone, setAttendantPhone] = useState('')
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    const res = await api.ambulanceMy(userId)
    setItems(res.items || [])
  }

  useEffect(() => {
    setLoading(true)
    void refresh().finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.ambulanceRequest(userId, {
        pickup,
        note,
        referredHospital,
        attendant: attendantName || attendantPhone ? { name: attendantName, phone: attendantPhone } : null,
      })
      await refresh()
      setNote('')
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Hospital / Ambulance"
        description="Request ambulance (ETA 10-15 mins), add referral hospital and attendant details."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <form onSubmit={submit} className="space-y-3">
            <input
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-3 py-2 text-sm"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="Pickup location"
              required
            />
            <textarea
              className="min-h-[80px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-3 py-2 text-sm"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Symptoms / reason"
            />
            <input
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-3 py-2 text-sm"
              value={referredHospital}
              onChange={(e) => setReferredHospital(e.target.value)}
              placeholder="Referred hospital (optional)"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-3 py-2 text-sm"
                value={attendantName}
                onChange={(e) => setAttendantName(e.target.value)}
                placeholder="Attendant name"
              />
              <input
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-3 py-2 text-sm"
                value={attendantPhone}
                onChange={(e) => setAttendantPhone(e.target.value)}
                placeholder="Attendant phone"
              />
            </div>
            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
            <Button type="submit" disabled={busy}>
              {busy ? 'Requesting…' : 'Request Ambulance'}
            </Button>
          </form>
        </Card>

        <Card className="p-0">
          <div className="border-b border-[var(--border-subtle)] px-5 py-3 font-semibold text-[var(--text-primary)]">
            Recent requests
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {loading && <div className="px-5 py-4 text-sm text-[var(--text-secondary)]">Loading requests…</div>}
            {items.map((x) => (
              <div key={x.id} className="px-5 py-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-[var(--text-primary)]">{x.status?.toUpperCase()}</span>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-200">
                    ETA {x.etaMins || '10-15'} mins
                  </span>
                </div>
                <p className="text-[var(--text-secondary)]">{x.pickup}</p>
                {x.referredHospital && (
                  <p className="text-[var(--text-secondary)]">Referred: {x.referredHospital}</p>
                )}
                {x.attendant?.name && (
                  <p className="text-[var(--text-secondary)]">
                    Attendant: {x.attendant.name} ({x.attendant.phone || 'n/a'})
                  </p>
                )}
              </div>
            ))}
            {!loading && !items.length && (
              <div className="px-5 py-4 text-sm text-[var(--text-secondary)]">No requests yet.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

