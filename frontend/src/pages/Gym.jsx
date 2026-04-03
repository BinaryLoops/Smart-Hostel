import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export function Gym() {
  return (
    <div>
      <PageHeader
        title="Gym & wellness"
        description="Gym registration, equipment complaints, and counseling bookings."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5">
          <h3 className="font-semibold text-[var(--text-primary)]">Gym registration</h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            One-time waiver + slot rules (demo).
          </p>
          <Button className="mt-4" onClick={() => alert('Registered (mock)')}>
            Register
          </Button>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-[var(--text-primary)]">Equipment issue</h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Routes to maintenance queue.
          </p>
          <Button className="mt-4" variant="outline" onClick={() => alert('Ticket filed (mock)')}>
            Report
          </Button>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-[var(--text-primary)]">Counseling</h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Book a slot; session opens in Google Meet (external).
          </p>
          <a
            href="https://meet.google.com"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            Open Meet link →
          </a>
        </Card>
      </div>
    </div>
  )
}
