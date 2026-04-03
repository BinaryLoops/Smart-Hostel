import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'

const ITEMS = [
  { id: 1, type: 'Lost', title: 'Black umbrella', where: 'Near mess', when: 'Apr 1' },
  { id: 2, type: 'Found', title: 'Blue water bottle', where: 'Gym', when: 'Mar 30' },
]

export function LostFound() {
  return (
    <div>
      <PageHeader
        title="Lost & found"
        description="Post and browse items — back with Firestore for persistence."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {ITEMS.map((i) => (
          <Card key={i.id} className="p-4">
            <span className="text-xs font-semibold uppercase text-[var(--accent)]">{i.type}</span>
            <p className="mt-1 font-medium text-[var(--text-primary)]">{i.title}</p>
            <p className="text-sm text-[var(--text-secondary)]">
              {i.where} · {i.when}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}
