import { nowIso } from '../store/memory.js'
import { store } from '../store/store.js'

export async function createActivityLog(req, res) {
  const studentId = req.user?.uid || req.headers['x-user-id'] || 'anonymous'
  const { type, note, at } = req.body || {}
  if (!type) return res.status(400).json({ message: 'type is required' })
  const entry = await store.createActivityLog({
    studentId,
    type, // e.g. "late_entry"
    note: note || '',
    at: at || nowIso(),
  })
  res.status(201).json(entry)
}

export async function listActivityLogs(req, res) {
  const { studentId, type } = req.query || {}
  const items = await store.listActivityLogs({ studentId, type })
  res.json({ items })
}

