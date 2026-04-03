import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  UtensilsCrossed,
  MessageSquareWarning,
  CalendarDays,
  MapPin,
  ClipboardList,
  Shirt,
  DoorOpen,
  Wallet,
  Search,
  Dumbbell,
  PartyPopper,
  HeartPulse,
  Shield,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const studentLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/mess', label: 'Mess', icon: UtensilsCrossed },
  { to: '/complaints', label: 'Complaints', icon: MessageSquareWarning },
  { to: '/leave', label: 'Leave / Outing', icon: CalendarDays },
  { to: '/attendance', label: 'Attendance', icon: MapPin },
  { to: '/logs', label: 'Entry/Exit Logs', icon: ClipboardList },
  { to: '/laundry', label: 'Laundry', icon: Shirt },
  { to: '/room', label: 'Room', icon: DoorOpen },
  { to: '/fees', label: 'Fees', icon: Wallet },
  { to: '/lost-found', label: 'Lost & Found', icon: Search },
  { to: '/gym', label: 'Gym & Wellness', icon: Dumbbell },
  { to: '/events', label: 'Events', icon: PartyPopper },
  { to: '/hospital', label: 'Hospital', icon: HeartPulse },
]

const adminLinks = [{ to: '/admin', label: 'Admin Console', icon: Shield }]

export function Sidebar() {
  const { isAdmin } = useAuth()

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-sidebar)] backdrop-blur-xl">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="font-[family-name:var(--font-display)] text-sm font-semibold leading-tight text-[var(--text-primary)]">
            Smart Hostel
          </p>
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
            Portal
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Menu
        </p>
        {studentLinks.map((link) => (
          <NavItem key={link.to} {...link} />
        ))}
        {isAdmin && (
          <>
            <p className="mb-2 mt-4 px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Administration
            </p>
            {adminLinks.map((link) => (
              <NavItem key={link.to} {...link} />
            ))}
          </>
        )}
      </nav>
    </aside>
  )
}

function NavItem({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]'
        }`
      }
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
      {label}
    </NavLink>
  )
}
