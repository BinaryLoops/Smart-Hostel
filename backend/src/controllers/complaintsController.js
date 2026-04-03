import { store } from '../store/store.js'

const allowedCategories = new Set(['electrical', 'plumbing', 'wifi', 'cleaning'])

export async function createComplaint(req, res) {
  const userId = req.user?.uid || req.body?.userId
  const { category, status } = req.body || {}
  if (!userId) return res.status(400).json({ message: 'userId is required' })
  if (!allowedCategories.has(category)) {
    return res.status(400).json({ message: 'invalid category' })
  }
  const c = await store.createComplaint({
    userId,
    category,
    status: status || 'open',
  })
  res.status(201).json(c)
}

export async function resolveComplaint(req, res) {
  const id = req.params.id
  const c = await store.resolveComplaint(id)
  if (!c) return res.status(404).json({ message: 'Complaint not found' })
  res.json(c)
}

export async function complaintAnalytics(req, res) {
  const list = await store.listComplaints({ limit: 1000 })
  const counts = { electrical: 0, plumbing: 0, wifi: 0, cleaning: 0 }
  for (const c of list) counts[c.category]++

  let most = { category: null, count: 0 }
  for (const [category, count] of Object.entries(counts)) {
    if (count > most.count) most = { category, count }
  }

  res.json({ counts, mostFrequent: most })
}

