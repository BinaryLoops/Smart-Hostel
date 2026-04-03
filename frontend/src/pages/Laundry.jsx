import { PageHeader } from '../components/ui/PageHeader'
import { useAuth } from '../context/AuthContext'
import { LaundryAnalyticsPanel } from '../components/laundry/LaundryAnalyticsPanel'
import { LaundryBookingPanel } from '../components/laundry/LaundryBookingPanel'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useState } from 'react'

export function Laundry() {
  const { user } = useAuth()
  const userId = user?.uid || user?.email || 'demo'
  const [paidEnabled, setPaidEnabled] = useState(false)

  return (
    <div>
      <PageHeader
        title="Laundry slots"
        description="Book a slot and view weekly usage analytics + peak hours."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <LaundryBookingPanel userId={userId} />
        <LaundryAnalyticsPanel />
      </div>

      <div className="mt-6">
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-[var(--text-primary)]">Paid laundry</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Toggle to enable premium paid laundry flow.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPaidEnabled((v) => !v)}
              className={`h-8 w-14 rounded-full p-1 transition ${paidEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--bg-muted)]'}`}
              aria-label="Toggle paid laundry"
            >
              <span
                className={`block h-6 w-6 rounded-full bg-white transition ${paidEnabled ? 'translate-x-6' : ''}`}
              />
            </button>
          </div>

          {paidEnabled && (
            <div className="mt-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-muted)] p-4">
              <p className="text-sm text-[var(--text-primary)]">
                Paid partner dashboard is enabled. Open LaundroSwipe to continue.
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Best experience opens in a new tab for mobile and desktop compatibility.
              </p>
              <div className="mt-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">ProFab Power Launders (VIT Chennai)</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Contact: <a className="text-[var(--accent)] hover:underline" href="tel:9715888844">9715888844</a>,{' '}
                  <a className="text-[var(--accent)] hover:underline" href="tel:8667765491">8667765491</a>
                </p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Pickup/Drop: Wednesday & Saturday, 6:30 PM – 8:30 PM
                </p>

                <div className="mt-3 overflow-auto rounded-lg border border-[var(--border-subtle)]">
                  <table className="w-full min-w-[520px] text-left text-xs">
                    <thead className="bg-[var(--bg-muted)] text-[var(--text-secondary)]">
                      <tr>
                        <th className="px-3 py-2 font-medium">Item</th>
                        <th className="px-3 py-2 font-medium">Wash & Ironing</th>
                        <th className="px-3 py-2 font-medium">Dry Cleaning</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Pant/Jeans', '22', '50'],
                        ['White Pants/Jeans', '25', '60'],
                        ['Shirt/T-Shirt', '22', '50'],
                        ['White Shirt/T-Shirt', '25', '60'],
                        ['Shorts', '16', '40'],
                        ['Lungi', '20', '50'],
                        ['Towel', '18', '40'],
                        ['Bed Sheet (Single/Double)', '25', '60'],
                        ['Hand Towel', '8', '20'],
                        ['Pillow Cover', '12', '30'],
                        ['Dhoti', '40', '60'],
                        ['Blanket (Small)', '90', '110'],
                        ['Blanket (Big)', '100', '120'],
                        ['Lab Coat', '25', '60'],
                        ['Quilt', '120', '150'],
                        ['Jacket/Hoodie/Kurta', '50', '100'],
                        ['Track Pant', '22', '40'],
                        ['Bag', '150', '-'],
                        ['Shoe', '150', '-'],
                        ['Only Iron (per piece)', '10', '-'],
                        ['Ladies Top', '25', '60'],
                        ['Ladies Bottom', '22', '50'],
                        ['Shawl', '18', '40'],
                        ['Saree', '70', '150'],
                        ['Fancy Dresses', '-', '100'],
                        ['Blazer', '-', '150'],
                      ].map(([item, wash, dry]) => (
                        <tr key={item} className="border-t border-[var(--border-subtle)]/60">
                          <td className="px-3 py-2 text-[var(--text-primary)]">{item}</td>
                          <td className="px-3 py-2 text-[var(--text-secondary)]">{wash}</td>
                          <td className="px-3 py-2 text-[var(--text-secondary)]">{dry}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <Button
                className="mt-3"
                variant="outline"
                onClick={() => window.open('https://www.laundroswipe.com/dashboard', '_blank', 'noopener,noreferrer')}
              >
                Open LaundroSwipe
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
