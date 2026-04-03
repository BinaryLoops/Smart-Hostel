import { store } from '../store/store.js'

function lateness(actualAt, expectedAt) {
  const a = new Date(actualAt).getTime()
  const e = new Date(expectedAt).getTime()
  if (!Number.isFinite(a) || !Number.isFinite(e)) return 0
  return Math.max(0, Math.round((a - e) / 60000))
}

export async function createEntryExit(req, res) {
  const studentId = req.user?.uid
  const { kind, expectedAt, actualAt } = req.body || {}
  if (!studentId) return res.status(401).json({ message: 'Unauthorized' })
  if (!kind || !['entry', 'exit'].includes(kind)) return res.status(400).json({ message: 'kind invalid' })
  if (!expectedAt || !actualAt) return res.status(400).json({ message: 'expectedAt and actualAt required' })

  const minutesLate = lateness(actualAt, expectedAt)
  const doc = await store.createEntryExitLog({ studentId, kind, expectedAt, actualAt, minutesLate })
  res.status(201).json(doc)
}

export async function listMyEntryExit(req, res) {
  const studentId = req.user?.uid
  if (!studentId) return res.status(401).json({ message: 'Unauthorized' })
  const items = await store.listEntryExitLogs({ studentId })
  res.json({ items })
}

export async function adminListEntryExit(req, res) {
  const items = await store.listEntryExitLogs({})
  res.json({ items })
}

