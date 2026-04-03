import { nowIso } from '../store/memory.js'
import { store } from '../store/store.js'

export async function listEvents(req, res) {
  const items = await store.listEvents()
  res.json({ items })
}

export async function createEvent(req, res) {
  const { title, description, date } = req.body || {}
  if (!title) return res.status(400).json({ message: 'title is required' })
  if (!date) return res.status(400).json({ message: 'date is required (ISO or yyyy-mm-dd)' })
  const e = await store.createEvent({
    title,
    description: description || '',
    date,
    createdAt: nowIso(),
    rsvps: [], // { userId, at }
  })
  res.status(201).json(e)
}

export async function rsvpEvent(req, res) {
  const id = req.params.id
  const userId = req.user?.uid || req.body?.userId
  if (!userId) return res.status(400).json({ message: 'userId is required' })
  const result = await store.rsvpEvent(id, userId)
  if (!result) return res.status(404).json({ message: 'Event not found' })
  res.json(result)
}

