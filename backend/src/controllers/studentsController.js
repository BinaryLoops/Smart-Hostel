import { newId, nowIso } from '../store/memory.js'
import { store } from '../store/store.js'

function safeStudent(s) {
  // Avoid leaking fields to non-admin if added later.
  return {
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    guardianPhone: s.guardianPhone,
    proctorName: s.proctorName || '',
    proctorPhone: s.proctorPhone || '',
    proctorEmail: s.proctorEmail || '',
    roomNumber: s.roomNumber,
    block: s.block,
    role: s.role || 'student',
    createdAt: s.createdAt,
  }
}

export async function listStudents(req, res) {
  const items = await store.listStudents()
  res.json({ items: items.map(safeStudent) })
}

export async function upsertStudent(req, res) {
  const body = req.body || {}
  const id = body.id || body.email || newId('stu')
  const next = {
    id,
    name: body.name || 'Student',
    email: body.email || '',
    phone: body.phone || '',
    guardianPhone: body.guardianPhone || '',
    proctorName: body.proctorName || '',
    proctorPhone: body.proctorPhone || '',
    proctorEmail: body.proctorEmail || '',
    roomNumber: body.roomNumber || '',
    block: body.block || '',
    role: body.role || 'student',
    createdAt: nowIso(),
  }
  const saved = await store.upsertStudent(id, next)
  res.status(201).json(safeStudent(saved))
}

export async function myStudentRecord(req, res) {
  const userId = req.user?.uid || req.headers['x-user-id'] || 'anonymous'
  const s = await store.getStudent(userId)
  if (!s) return res.status(404).json({ message: 'Student record not found' })
  res.json(safeStudent(s))
}

