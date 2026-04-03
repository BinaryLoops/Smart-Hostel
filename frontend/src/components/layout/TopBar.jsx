import { Moon, Sun, Bell, LogOut } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Button } from '../ui/Button'
import { useNotifications } from '../../hooks/useNotifications'
import { NotificationCenter } from '../notifications/NotificationCenter'

export function TopBar({ title }) {
  const { theme, toggleTheme } = useTheme()
  const { profile, user, logout } = useAuth()
  const userId = useMemo(() => user?.uid || user?.email || 'demo', [user])
  const [open, setOpen] = useState(false)
  const { items, unreadCount, loading, error, markAllRead, markRead } = useNotifications(userId)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/80 px-6 backdrop-blur-md">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--text-primary)]">
          {title}
        </h2>
        <p className="text-xs text-[var(--text-secondary)]">
          {profile?.name}
          {profile?.role && (
            <span className="ml-2 rounded-md bg-[var(--accent-soft)] px-2 py-0.5 text-[var(--accent)]">
              {profile.role}
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] text-[var(--text-primary)] transition hover:border-[var(--accent)]"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] text-[var(--text-primary)]"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-semibold text-white ring-2 ring-[var(--bg-muted)]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <Button variant="ghost" className="!py-2" onClick={() => logout()}>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>

      <NotificationCenter
        open={open}
        onClose={() => setOpen(false)}
        notifications={items}
        loading={loading}
        error={error}
        onMarkAllRead={markAllRead}
        onMarkRead={markRead}
      />
    </header>
  )
}
