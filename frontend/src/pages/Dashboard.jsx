import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MessageSquareWarning,
  MapPin,
  UtensilsCrossed,
  Bell,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { StatCard } from '../components/ui/StatCard'
import { Card } from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'
import { AnnouncementsPanel } from '../components/announcements/AnnouncementsPanel'
import { useNotifications } from '../hooks/useNotifications'
import { useVtopSync } from '../hooks/useVtopSync'
import { VtopSyncStatus } from '../components/vtop/VtopSyncStatus'
import { MessCrowdWidget } from '../components/mess/MessCrowdWidget'
import { EmergencyContactsWidget } from '../components/emergency/EmergencyContactsWidget'

const quick = [
  { to: '/mess', label: 'Mess & QR', desc: 'Today’s menu & entry', color: 'var(--chart-1)' },
  { to: '/complaints', label: 'Raise complaint', desc: 'Track maintenance', color: 'var(--chart-2)' },
  { to: '/leave', label: 'Leave request', desc: 'Approval status', color: 'var(--chart-3)' },
  { to: '/attendance', label: 'Mark attendance', desc: 'GPS + time window', color: 'var(--chart-4)' },
]

const notifications = [
  { title: 'Mess feedback open', body: 'Dinner window ends 9:00 PM — share feedback.', time: '2h' },
  { title: 'Laundry slot', body: 'Your slot tomorrow 4–5 PM — Block B.', time: '5h' },
  { title: 'Event', body: 'Inter-hostel hackathon registration closes Friday.', time: '1d' },
]

export function Dashboard() {
  const { profile, demoMode, user } = useAuth()
  const userId = user?.uid || user?.email || 'demo'
  const { items: liveNotifications } = useNotifications(userId)
  const vtop = useVtopSync(userId)

  return (
    <div>
      <PageHeader
        title={`Hello, ${profile?.name || 'there'}`}
        description="Your hostel command center — attendance, mess, complaints, and more in one place."
      />

      <div className="mb-6">
        <VtopSyncStatus
          label={vtop.label}
          lastSyncedAt={vtop.lastSyncedAt}
          lastStatus={vtop.lastStatus}
          lastError={vtop.lastError}
          syncing={vtop.syncing}
          onSync={vtop.sync}
        />
      </div>

      {demoMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100"
        >
          <Zap className="h-4 w-4 shrink-0" />
          <span>
            Running in <strong>demo mode</strong> (Firebase env not set). Auth is simulated locally —
            add <code className="rounded bg-black/10 px-1">.env</code> for real Firestore.
          </span>
        </motion.div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          delay={0}
          icon={MessageSquareWarning}
          label="Open complaints"
          value="3"
          sub="2 in progress"
          accent="#6366f1"
        />
        <StatCard
          delay={0.05}
          icon={MapPin}
          label="Attendance streak"
          value="12 days"
          sub="Campus geofence OK"
          accent="#0d9488"
        />
        <StatCard
          delay={0.1}
          icon={UtensilsCrossed}
          label="Mess visits (week)"
          value="18"
          sub="Avg rating 4.2"
          accent="#f59e0b"
        />
        <StatCard
          delay={0.15}
          icon={Bell}
          label="Notifications"
          value="5"
          sub="2 actionable"
          accent="#ec4899"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="mb-3 font-[family-name:var(--font-display)] text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Quick actions
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {quick.map((q, i) => (
              <Link key={q.to} to={q.to} className="group block">
                <Card delay={0.05 * i} className="h-full p-4 transition hover:border-[var(--accent)]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{q.label}</p>
                      <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{q.desc}</p>
                    </div>
                    <span
                      className="mt-1 h-8 w-1 rounded-full"
                      style={{ background: q.color }}
                    />
                  </div>
                  <ChevronRight className="mt-3 h-4 w-4 text-[var(--text-secondary)] transition group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-[family-name:var(--font-display)] text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Notifications
          </h3>
          <Card className="divide-y divide-[var(--border-subtle)] p-0">
            {(liveNotifications.length ? liveNotifications.slice(0, 3) : notifications).map((n) => (
              <div key={n.title} className="flex gap-3 px-4 py-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Bell className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{n.title}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{n.body || n.description || ''}</p>
                </div>
                <span className="text-[10px] text-[var(--text-secondary)]">
                  {n.time || (n.createdAt ? new Date(n.createdAt).toLocaleDateString() : '')}
                </span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AnnouncementsPanel />
        </div>
        <div className="lg:col-span-1">
          <MessCrowdWidget userId={userId} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <EmergencyContactsWidget />
        </div>
      </div>
    </div>
  )
}
