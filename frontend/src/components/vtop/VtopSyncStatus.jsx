import { RefreshCcw, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Button } from '../ui/Button'

export function VtopSyncStatus({ label, lastSyncedAt, lastStatus, lastError, syncing, onSync }) {
  const Icon =
    lastStatus === 'success' ? CheckCircle2 : lastStatus === 'failed' ? XCircle : Clock

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-4 py-3">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)]">VTOP hostel sync</p>
          <p className="text-xs text-[var(--text-secondary)]">
            {label}
            {lastSyncedAt ? ` · ${new Date(lastSyncedAt).toLocaleString()}` : ''}
          </p>
          {lastStatus === 'failed' && lastError && (
            <p className="mt-1 text-xs text-[var(--danger)]">{lastError}</p>
          )}
        </div>
      </div>

      <Button variant="outline" onClick={onSync} disabled={syncing}>
        <RefreshCcw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </div>
  )
}

