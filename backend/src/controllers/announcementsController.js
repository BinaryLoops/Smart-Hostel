import { store } from '../store/store.js'
import { nowIso } from '../store/memory.js'

export async function listAnnouncements(req, res) {
  const items = await store.listAnnouncements()
  res.json({ items })
}

export async function createAnnouncement(req, res) {
  const { title, description, date, priority, pinned } = req.body || {}
  if (!title) return res.status(400).json({ message: 'title is required' })
  const a = await store.createAnnouncement({
    title,
    description: description || '',
    date: date || nowIso().slice(0, 10),
    priority: Number.isFinite(priority) ? priority : 1, // 1..5
    pinned: Boolean(pinned),
  })
  res.status(201).json(a)
}

export async function updateAnnouncement(req, res) {
  const id = req.params.id
  const body = req.body || {}
  const patch = {}
  if (typeof body.title === 'string') patch.title = body.title
  if (typeof body.description === 'string') patch.description = body.description
  if (typeof body.date === 'string') patch.date = body.date
  if (typeof body.priority === 'number') patch.priority = body.priority
  if (typeof body.pinned === 'boolean') patch.pinned = body.pinned
  const a = await store.updateAnnouncement(id, patch)
  if (!a) return res.status(404).json({ message: 'Announcement not found' })
  res.json(a)
}

