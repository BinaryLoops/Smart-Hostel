// Minimal RBAC for demo deployments.
// In production, replace with verified JWT/session + server-side roles.

export function getUserId(req) {
  return req.headers['x-user-id'] || req.query.userId || req.body?.userId || 'anonymous'
}

export function getRole(req) {
  return (req.headers['x-user-role'] || '').toString().toLowerCase() || 'student'
}

export function requireAdmin(req, res, next) {
  const role = req.user?.role || getRole(req)
  if (role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' })
  }
  next()
}

