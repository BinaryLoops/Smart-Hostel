import { useState } from 'react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ComplaintAnalytics } from '../components/complaints/ComplaintAnalytics'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = [
  'AC',
  'Window',
  'Cleaning',
  'Toilets',
  'Water leakage',
  'Mosquito issues',
]

const MOCK = [
  { id: 1, title: 'AC not cooling', cat: 'AC', status: 'In progress', priority: 'High' },
  { id: 2, title: 'Window latch broken', cat: 'Window', status: 'Open', priority: 'Medium' },
]

function mapCategory(cat) {
  const c = String(cat || '').toLowerCase()
  if (c.includes('clean')) return 'cleaning'
  if (c.includes('water') || c.includes('toilet') || c.includes('plumb')) return 'plumbing'
  if (c.includes('wifi') || c.includes('internet')) return 'wifi'
  return 'electrical'
}

export function Complaints() {
  const { user } = useAuth()
  const userId = user?.uid || user?.email || 'demo'
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [desc, setDesc] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      await api.createComplaint(userId, { category: mapCategory(category), title, description: desc })
      alert('Complaint recorded.')
      setTitle('')
      setDesc('')
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Could not save complaint')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Complaints"
        description="Report hostel issues by category. Admins track status and priority."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-semibold text-[var(--text-primary)]">New complaint</h3>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <input
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-3 py-2 text-sm"
              placeholder="Short title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <select
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-3 py-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <textarea
              className="min-h-[100px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-3 py-2 text-sm"
              placeholder="Describe the issue"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            {err && <p className="text-sm text-[var(--danger)]">{err}</p>}
            <Button type="submit" disabled={busy}>
              {busy ? 'Submitting…' : 'Submit'}
            </Button>
          </form>
        </Card>
        <Card className="p-0">
          <div className="border-b border-[var(--border-subtle)] px-5 py-3 font-semibold text-[var(--text-primary)]">
            Your recent tickets (mock)
          </div>
          <ul>
            {MOCK.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] px-5 py-3 text-sm last:border-0"
              >
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{c.title}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{c.cat}</p>
                </div>
                <span className="rounded-lg bg-[var(--accent-soft)] px-2 py-0.5 text-xs text-[var(--accent)]">
                  {c.status}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6">
        <ComplaintAnalytics />
      </div>
    </div>
  )
}
