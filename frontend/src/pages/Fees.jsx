import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export function Fees() {
  return (
    <div>
      <PageHeader
        title="Hostel fees"
        description="View status — payment gateway can be integrated later."
      />
      <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">Semester hostel fee</p>
          <p className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--text-primary)]">
            ₹48,000
          </p>
          <p className="mt-1 text-sm text-[var(--accent)]">Paid · Receipt #SHP-2026-0142</p>
        </div>
        <Button onClick={() => alert('Mock payment — integrate Razorpay/Stripe later.')}>
          Pay now (mock)
        </Button>
      </Card>
    </div>
  )
}
