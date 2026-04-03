import { nowIso } from '../store/memory.js'
import { store } from '../store/store.js'

const MEALS = new Set(['breakfast', 'lunch', 'snacks', 'dinner'])

export async function markMessAttendance(req, res) {
  const studentId = req.user?.uid
  const { date, meal, attended } = req.body || {}
  if (!studentId) return res.status(401).json({ message: 'Unauthorized' })
  if (!date) return res.status(400).json({ message: 'date is required (yyyy-mm-dd)' })
  if (!MEALS.has(meal)) return res.status(400).json({ message: 'invalid meal' })

  await store.upsertMessAttendance({ studentId, date, meal, attended: Boolean(attended) })
  res.json({ ok: true })
}

export async function listMyMessAttendance(req, res) {
  const studentId = req.user?.uid
  if (!studentId) return res.status(401).json({ message: 'Unauthorized' })
  const date = req.query.date
  const items = await store.listMessAttendance({ studentId, date })
  res.json({ items })
}

export async function notifyParentForMissedMeals(req, res) {
  const studentId = req.user?.uid
  if (!studentId) return res.status(401).json({ message: 'Unauthorized' })
  const date = req.body?.date || nowIso().slice(0, 10)

  const list = await store.listMessAttendance({ studentId, date })
  const missedMeals = list.filter((x) => x.attended === false).map((x) => x.meal)
  const note = await store.createParentNotification({
    studentId,
    date,
    missedMeals,
    channel: 'parent_portal',
    status: 'queued',
  })

  res.json({ ok: true, missedMeals, notificationId: note.id })
}

