import { Phone, Shield, HeartPulse, Building2, User } from 'lucide-react'
import { Card } from '../ui/Card'

const CONTACTS = [
  { label: 'Warden', phone: '+91-90000-00001', icon: User },
  { label: 'Security', phone: '+91-90000-00002', icon: Shield },
  { label: 'Ambulance', phone: '108', icon: HeartPulse },
  { label: 'Hostel office', phone: '+91-90000-00003', icon: Building2 },
]

export function EmergencyContactsWidget() {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-[var(--text-primary)]">Emergency contacts</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Tap to call (uses your device dialer when available).
          </p>
        </div>
        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <Phone className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {CONTACTS.map((c) => {
          const Icon = c.icon
          return (
            <a
              key={c.label}
              href={`tel:${c.phone}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-4 py-3 text-sm hover:border-[var(--accent)]"
            >
              <span className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--bg-elevated)] text-[var(--text-primary)]">
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block font-medium text-[var(--text-primary)]">{c.label}</span>
                  <span className="block text-xs text-[var(--text-secondary)]">{c.phone}</span>
                </span>
              </span>
              <Phone className="h-4 w-4 text-[var(--text-secondary)]" />
            </a>
          )
        })}
      </div>
    </Card>
  )
}

