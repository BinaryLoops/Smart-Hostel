import { Card } from './Card'

export function StatCard({ icon: Icon, label, value, sub, delay = 0, accent }) {
  return (
    <Card delay={delay} className="relative overflow-hidden p-5">
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-30 blur-2xl"
        style={{ background: accent || 'var(--accent)' }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
            {label}
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            {value}
          </p>
          {sub && <p className="mt-1 text-xs text-[var(--text-secondary)]">{sub}</p>}
        </div>
        {Icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
        )}
      </div>
    </Card>
  )
}
