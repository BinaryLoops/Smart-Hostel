import { useEffect, useMemo, useState } from 'react'
import { UsersRound, Save } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { api } from '../../services/api'

// Admin-only: manage student records + room allocations.
export function StudentsPanel({ userId, role }) {
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const [draft, setDraft] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    guardianPhone: '',
    proctorName: '',
    proctorPhone: '',
    proctorEmail: '',
    block: 'B',
    roomNumber: 'B-204',
    role: 'student',
  })

  async function refresh() {
    const res = await api.adminListStudents(userId, role)
    setItems(res.items || [])
  }

  useEffect(() => {
    let alive = true
    setError('')
    api
      .adminListStudents(userId, role)
      .then((res) => alive && setItems(res.items || []))
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'Failed to load students'))
    return () => {
      alive = false
    }
  }, [role, userId])

  const canSave = useMemo(() => draft.id || draft.email, [draft.email, draft.id])

  async function save() {
    if (!canSave) return
    setBusy(true)
    setError('')
    try {
      await api.adminUpsertStudent(userId, role, draft)
      await refresh()
      setDraft((d) => ({ ...d, name: '', email: '', phone: '', guardianPhone: '' }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <UsersRound className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-[var(--text-primary)]">Student records & room allocation</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Admin-only. Students can only view their own record.
            </p>
          </div>
        </div>
        <span className="text-xs text-[var(--text-secondary)]">{items.length} students</span>
      </div>

      {error && <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>}

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] p-4">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Upsert student</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Use student id (recommended) or email as identifier.
          </p>

          <div className="mt-3 grid gap-2">
            <input
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm"
              placeholder="Student ID (e.g. demo-john@x.com)"
              value={draft.id}
              onChange={(e) => setDraft((d) => ({ ...d, id: e.target.value }))}
            />
            <input
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm"
              placeholder="Name"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            />
            <input
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm"
              placeholder="Email"
              value={draft.email}
              onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm"
                placeholder="Phone"
                value={draft.phone}
                onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
              />
              <input
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm"
                placeholder="Guardian phone"
                value={draft.guardianPhone}
                onChange={(e) => setDraft((d) => ({ ...d, guardianPhone: e.target.value }))}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <input
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm"
                placeholder="Proctor name"
                value={draft.proctorName}
                onChange={(e) => setDraft((d) => ({ ...d, proctorName: e.target.value }))}
              />
              <input
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm"
                placeholder="Proctor phone"
                value={draft.proctorPhone}
                onChange={(e) => setDraft((d) => ({ ...d, proctorPhone: e.target.value }))}
              />
              <input
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm"
                placeholder="Proctor email"
                value={draft.proctorEmail}
                onChange={(e) => setDraft((d) => ({ ...d, proctorEmail: e.target.value }))}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <input
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm"
                placeholder="Block"
                value={draft.block}
                onChange={(e) => setDraft((d) => ({ ...d, block: e.target.value }))}
              />
              <input
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm"
                placeholder="Room number"
                value={draft.roomNumber}
                onChange={(e) => setDraft((d) => ({ ...d, roomNumber: e.target.value }))}
              />
              <select
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm"
                value={draft.role}
                onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))}
              >
                <option value="student">student</option>
                <option value="admin">admin</option>
              </select>
            </div>

            <Button variant="outline" onClick={save} disabled={busy || !canSave}>
              <Save className="h-4 w-4" />
              {busy ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] p-4">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Recent records</p>
          <div className="mt-3 overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[var(--text-secondary)]">
                <tr>
                  <th className="pb-2 pr-3 font-medium">ID</th>
                  <th className="pb-2 pr-3 font-medium">Name</th>
                  <th className="pb-2 pr-3 font-medium">Room</th>
                  <th className="pb-2 font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {items.slice(0, 8).map((s) => (
                  <tr key={s.id} className="border-t border-[var(--border-subtle)]/60">
                    <td className="py-2 pr-3 font-mono text-[var(--text-primary)]">{s.id}</td>
                    <td className="py-2 pr-3 text-[var(--text-primary)]">{s.name}</td>
                    <td className="py-2 pr-3 text-[var(--text-secondary)]">
                      {s.block ? `Block ${s.block}` : ''} {s.roomNumber}
                    </td>
                    <td className="py-2 text-[var(--text-secondary)]">{s.role}</td>
                  </tr>
                ))}
                {!items.length && (
                  <tr>
                    <td className="py-3 text-[var(--text-secondary)]" colSpan={4}>
                      No students yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  )
}

