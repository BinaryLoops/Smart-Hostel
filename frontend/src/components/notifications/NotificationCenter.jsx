import { useMemo } from 'react'
import { Bell, CheckCheck, Circle } from 'lucide-react'
import { Modal } from '../ui/Modal'

function typeLabel(type) {
  switch (type) {
    case 'hostel_fee_due':
      return 'Hostel fee'
    case 'complaint_resolved':
      return 'Complaint'
    case 'outing_approved':
      return 'Outing'
    case 'mess_change_window_open':
      return 'Mess'
    default:
      return 'Update'
  }
}

export function NotificationCenter({
  open,
  onClose,
  notifications,
  loading,
  error,
  onMarkAllRead,
  onMarkRead,
}) {
  const unread = useMemo(() => notifications.filter((n) => !n.readAt), [notifications])

  return (
    <Modal
      open={open}
      title="Notifications"
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-[var(--text-secondary)]">
            {unread.length ? `${unread.length} unread` : 'All caught up'}
          </div>
          <button
            type="button"
            onClick={() => onMarkAllRead?.()}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] hover:border-[var(--accent)]"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        </div>
      }
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <Bell className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)]">Smart alerts</p>
          <p className="text-xs text-[var(--text-secondary)]">
            Fee reminders, approvals, complaint updates, and mess windows.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {error && <div className="text-sm text-[var(--danger)]">{error}</div>}
        {loading && <div className="text-sm text-[var(--text-secondary)]">Loading…</div>}

        {!loading && !notifications.length && (
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] p-4 text-sm text-[var(--text-secondary)]">
            No notifications yet.
          </div>
        )}

        {notifications.map((n) => {
          const isUnread = !n.readAt
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => onMarkRead?.(n.id)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] p-4 text-left transition hover:border-[var(--accent)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)]">
                      {typeLabel(n.type)}
                    </span>
                    {isUnread && (
                      <span className="inline-flex items-center gap-1 text-xs text-[var(--accent)]">
                        <Circle className="h-2.5 w-2.5 fill-current" />
                        Unread
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm font-medium text-[var(--text-primary)]">
                    {n.title}
                  </p>
                  {n.body && <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{n.body}</p>}
                </div>
                <span className="shrink-0 text-[10px] text-[var(--text-secondary)]">
                  {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </Modal>
  )
}

