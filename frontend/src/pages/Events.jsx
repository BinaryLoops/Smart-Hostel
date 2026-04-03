import { PageHeader } from '../components/ui/PageHeader'
import { EventsBoard } from '../components/events/EventsBoard'
import { useAuth } from '../context/AuthContext'

export function Events() {
  const { user } = useAuth()
  const userId = user?.uid || user?.email || 'demo'
  return (
    <div>
      <PageHeader
        title="Events & hackathons"
        description="Discover campus events and register in one tap."
      />
      <EventsBoard userId={userId} />
    </div>
  )
}
