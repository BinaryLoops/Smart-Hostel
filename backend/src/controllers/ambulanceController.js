import { store } from '../store/store.js'

export async function requestAmbulance(req, res) {
  const studentId = req.user?.uid
  if (!studentId) return res.status(401).json({ message: 'Unauthorized' })
  const { pickup, note, referredHospital, attendant } = req.body || {}
  const doc = await store.createAmbulanceRequest({
    studentId,
    pickup: pickup || 'Hostel Main Gate',
    note: note || '',
    referredHospital: referredHospital || '',
    attendant: attendant || null,
    status: 'dispatched',
    etaMins: '10-15',
  })
  res.status(201).json(doc)
}

export async function myAmbulanceRequests(req, res) {
  const studentId = req.user?.uid
  if (!studentId) return res.status(401).json({ message: 'Unauthorized' })
  const items = await store.listAmbulanceRequests({ studentId })
  res.json({ items })
}

