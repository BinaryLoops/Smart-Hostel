import { store } from '../store/store.js'

function normalizeSlot(slot) {
  const s = String(slot || '').toLowerCase()
  if (!s) return null
  return s
}

function crowdLabel(count) {
  if (count >= 25) return 'Crowded'
  if (count >= 10) return 'Moderate'
  return 'Free'
}

export function markGoingToMess(req, res) {
  const userId = req.user?.uid || req.body?.userId
  const { slot } = req.body || {}
  if (!userId) return res.status(400).json({ message: 'userId is required' })
  const normalized = normalizeSlot(slot)
  if (!normalized) return res.status(400).json({ message: 'slot is required' })

  store
    .markMessIntent({ userId, slot: normalized })
    .then(() => res.status(201).json({ ok: true }))
    .catch((e) => res.status(500).json({ message: e instanceof Error ? e.message : 'Failed' }))
}

export async function messCrowdStatus(req, res) {
  const slot = normalizeSlot(req.query.slot || 'dinner')
  const count = await store.countMessIntent(slot)
  res.json({ slot, count, label: crowdLabel(count) })
}

