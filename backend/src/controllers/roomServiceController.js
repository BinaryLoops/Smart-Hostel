import { store } from '../store/store.js'

export async function requestRoomService(req, res) {
  const studentId = req.user?.uid
  if (!studentId) return res.status(401).json({ message: 'Unauthorized' })
  const { note } = req.body || {}
  const doc = await store.createRoomServiceRequest({
    studentId,
    note: note || 'Not well',
    status: 'pending',
  })
  res.status(201).json(doc)
}

export async function myRoomServiceRequests(req, res) {
  const studentId = req.user?.uid
  if (!studentId) return res.status(401).json({ message: 'Unauthorized' })
  const items = await store.listRoomServiceRequests({ studentId })
  res.json({ items })
}

