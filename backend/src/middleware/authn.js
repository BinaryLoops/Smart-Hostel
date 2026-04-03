import { getAdminAuth, getAdminDb, firebaseEnabled } from '../config/firebaseAdmin.js'
import { getUserId, getRole } from './authz.js'

async function getRoleFromDb(uid) {
  const db = getAdminDb()
  if (!db) return 'student'
  const snap = await db.collection('students').doc(uid).get()
  if (!snap.exists) return 'student'
  const data = snap.data() || {}
  return (data.role || 'student').toString().toLowerCase()
}

export async function attachUser(req, _res, next) {
  // Competition-ready path: verify Firebase ID token
  if (firebaseEnabled()) {
    const auth = getAdminAuth()
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : ''

    if (token) {
      try {
        const decoded = await auth.verifyIdToken(token)
        req.user = { uid: decoded.uid, email: decoded.email || null, role: await getRoleFromDb(decoded.uid) }
      } catch {
        // Invalid token → treat as unauthenticated.
        req.user = null
      }
    } else {
      req.user = null
    }

    return next()
  }

  // Demo fallback: trust headers for local/dev (no real security).
  const uid = getUserId(req)
  req.user = { uid, role: getRole(req) }
  next()
}

export function requireAuth(req, res, next) {
  if (!req.user?.uid || req.user.uid === 'anonymous') {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  next()
}

