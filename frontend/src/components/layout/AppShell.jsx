import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

const titles = {
  '/': 'Dashboard',
  '/mess': 'Mess',
  '/complaints': 'Complaints',
  '/leave': 'Leave & Outing',
  '/attendance': 'Attendance',
  '/logs': 'Entry / Exit Logs',
  '/laundry': 'Laundry',
  '/room': 'Room',
  '/fees': 'Hostel Fees',
  '/lost-found': 'Lost & Found',
  '/gym': 'Gym & Wellness',
  '/events': 'Events',
  '/hospital': 'Hospital / Ambulance',
  '/admin': 'Admin Console',
}

export function AppShell() {
  const loc = useLocation()
  const title = titles[loc.pathname] || 'Portal'

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <TopBar title={title} />
        <main className="relative flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,var(--accent-soft),transparent)] opacity-80" />
          <AnimatePresence mode="wait">
            <motion.div
              key={loc.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
