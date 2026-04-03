import { useState } from 'react'
import { MapPin, ShieldCheck } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export function Attendance() {
  const [status, setStatus] = useState('')

  function mark() {
    const okTime = new Date().getHours() >= 7 && new Date().getHours() <= 22
    const mockGeo = { lat: 12.84, lng: 80.15, withinCampus: true }
    if (okTime && mockGeo.withinCampus) {
      setStatus('Marked present — time window OK & simulated geofence match.')
    } else {
      setStatus('Blocked — outside window or geofence (demo).')
    }
  }

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Simulated GPS + time check — combine with QR for stronger anti-proxy in production."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">Campus geofence</p>
              <p className="text-xs text-[var(--text-secondary)]">
                Demo location: VIT Chennai area (mock coordinates)
              </p>
            </div>
          </div>
          <Button className="mt-6 w-full sm:w-auto" onClick={mark}>
            <ShieldCheck className="h-4 w-4" />
            Mark attendance
          </Button>
          {status && <p className="mt-4 text-sm text-[var(--text-secondary)]">{status}</p>}
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold text-[var(--text-primary)]">Anti-proxy (concept)</h3>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-[var(--text-secondary)]">
            <li>Require device time within check-in window</li>
            <li>Match coarse GPS to hostel polygon</li>
            <li>Optional: rotating QR at warden desk</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
