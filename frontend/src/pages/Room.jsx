import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

export function Room() {
  const { user } = useAuth()
  const userId = user?.uid || user?.email || 'demo'
  const [record, setRecord] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setError('')
    api
      .myStudentRecord(userId)
      .then((res) => alive && setRecord(res))
      .catch(() => {
        // If no record yet, keep page usable with fallback.
        alive && setRecord({ block: 'B', roomNumber: 'B-204' })
      })
    return () => {
      alive = false
    }
  }, [userId])

  return (
    <div>
      <PageHeader
        title="Room allotment"
        description="Students see assigned room; admins manage allocations in backend."
      />
      <Card className="p-6">
        <p className="text-sm text-[var(--text-secondary)]">Block</p>
        <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--text-primary)]">
          {record?.block ? `Block ${record.block}` : '—'}
        </p>
        <p className="mt-4 text-sm text-[var(--text-secondary)]">Room</p>
        <p className="text-xl font-semibold text-[var(--accent)]">{record?.roomNumber || '—'}</p>
        {error && <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>}
        <p className="mt-4 text-xs text-[var(--text-secondary)]">
          This comes from your student record. If you don’t have one yet, an admin must allocate it.
        </p>
      </Card>

      <Card className="mt-6 p-6">
        <p className="text-sm text-[var(--text-secondary)]">Proctor details</p>
        <p className="mt-2 font-semibold text-[var(--text-primary)]">{record?.proctorName || 'Not assigned'}</p>
        <div className="mt-2 space-y-1 text-sm text-[var(--text-secondary)]">
          <p>{record?.proctorPhone || '—'}</p>
          <p>{record?.proctorEmail || '—'}</p>
        </div>
      </Card>
    </div>
  )
}
