import { nowIso } from '../store/memory.js'
import { store } from '../store/store.js'

function dayKey(iso) {
  return iso.slice(0, 10)
}

export async function createLaundryBooking(req, res) {
  const userId = req.user?.uid || req.body?.userId
  const { slot, time } = req.body || {}
  if (!userId) return res.status(400).json({ message: 'userId is required' })
  if (!slot) return res.status(400).json({ message: 'slot is required' })
  const b = await store.createLaundryBooking({
    userId,
    slot, // e.g. "Mon 4-5 PM"
    time: time || nowIso(),
  })
  res.status(201).json(b)
}

export async function listLaundryBookings(req, res) {
  const userId = req.query.userId
  const items = await store.listLaundryBookings({ userId })
  res.json({ items })
}

export async function laundryAnalytics(req, res) {
  const items = await store.listLaundryBookings({})
  const now = new Date()
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }

  const perDay = Object.fromEntries(days.map((d) => [d, 0]))
  const perHour = {} // "00".."23"
  for (const b of items) {
    const d = dayKey(b.time)
    if (perDay[d] != null) perDay[d]++
    const h = b.time.slice(11, 13)
    perHour[h] = (perHour[h] || 0) + 1
  }

  let peak = { hour: null, count: 0 }
  for (const [hour, count] of Object.entries(perHour)) {
    if (count > peak.count) peak = { hour, count }
  }

  const suggestions = Object.entries(perHour)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([hour, count]) => ({ hour, count }))

  res.json({
    week: days.map((d) => ({ date: d, count: perDay[d] })),
    peakHour: peak,
    suggestions,
  })
}

