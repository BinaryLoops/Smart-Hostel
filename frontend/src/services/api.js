import { auth, firebaseReady } from '../config/firebase'

// Be defensive: sometimes env values are missing protocol or include extra quotes.
const API_BASE_RAW = (import.meta.env.VITE_API_URL || 'http://localhost:4000').trim().replace(/^['"]|['"]$/g, '')
const API_BASE = API_BASE_RAW.startsWith('http://') || API_BASE_RAW.startsWith('https://') ? API_BASE_RAW : `https://${API_BASE_RAW}`

async function authHeaders(existing = {}) {
  if (!firebaseReady || !auth?.currentUser) return existing
  try {
    const token = await auth.currentUser.getIdToken()
    return { ...existing, Authorization: `Bearer ${token}` }
  } catch {
    return existing
  }
}

async function request(path, options = {}) {
  const url = `${API_BASE.replace(/\/$/, '')}${path}`
  const headers = await authHeaders({ 'Content-Type': 'application/json', ...options.headers })
  const res = await fetch(url, {
    headers,
    ...options,
  })
  if (!res.ok) {
    // Try to surface backend error `code`/`message` so the UI can show the real reason.
    try {
      const err = await res.json()
      const code = err?.code
      const message = err?.message
      if (code && message) throw new Error(`${code}: ${message}`)
      throw new Error(message || code || res.statusText)
    } catch {
      const text = await res.text().catch(() => '')
      throw new Error(text || res.statusText)
    }
  }
  return res.json()
}

function withUser(userId, headers = {}) {
  // Backend accepts user id via header or query; header keeps URLs clean.
  return userId ? { ...headers, 'x-user-id': userId } : headers
}

function withRole(role, headers = {}) {
  return role ? { ...headers, 'x-user-role': role } : headers
}

// When Firebase is enabled, the backend derives identity + role from the verified token.
// Keep header-based fallback for local/demo (no Firebase configured).
export const api = {
  health: () => request('/api/health'),
  messMenu: () => request('/api/mess/menu'),
  messFeedback: (body) =>
    request('/api/mess/feedback', { method: 'POST', body: JSON.stringify(body) }),

  // Notifications
  notifications: (userId, { unread = false } = {}) =>
    request(`/api/notifications?unread=${unread ? 'true' : 'false'}`, {
      headers: withUser(userId),
    }),
  createNotification: (userId, body) =>
    request('/api/notifications', {
      method: 'POST',
      headers: withUser(userId),
      body: JSON.stringify({ userId, ...body }),
    }),
  markNotificationRead: (userId, id) =>
    request(`/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: withUser(userId),
    }),
  markAllNotificationsRead: (userId) =>
    request('/api/notifications/read-all', {
      method: 'POST',
      headers: withUser(userId),
    }),

  // Announcements
  announcements: () => request('/api/announcements'),

  // VTOP sync (simulated backend sync; no credential storage)
  vtopStatus: (userId) => request('/api/vtop/status', { headers: withUser(userId) }),
  vtopSync: (userId) =>
    request('/api/vtop/sync', { method: 'POST', headers: withUser(userId) }),

  // Complaints analytics
  // Admin-only on backend when Firebase is enabled.
  complaintAnalytics: () => request('/api/complaints/analytics'),
  createComplaint: (userId, body) =>
    request('/api/complaints', {
      method: 'POST',
      headers: withUser(userId),
      body: JSON.stringify({ userId, ...body }),
    }),
  resolveComplaint: (id) => request(`/api/complaints/${id}/resolve`, { method: 'PATCH' }),

  // Mess crowd prediction
  markGoingToMess: (userId, slot) =>
    request('/api/mess/going', {
      method: 'POST',
      body: JSON.stringify({ userId, slot }),
    }),
  messCrowd: (slot = 'dinner') => request(`/api/mess/crowd?slot=${encodeURIComponent(slot)}`),

  // Laundry analytics
  laundryBookings: (userId) =>
    request(`/api/laundry/bookings${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`),
  createLaundryBooking: (userId, body) =>
    request('/api/laundry/bookings', {
      method: 'POST',
      body: JSON.stringify({ userId, ...body }),
    }),
  // Admin-only on backend when Firebase is enabled.
  laundryAnalytics: () => request('/api/laundry/analytics'),

  // Events
  events: () => request('/api/events'),
  rsvpEvent: (userId, eventId) =>
    request(`/api/events/${eventId}/rsvp`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  // PS02: Students / records
  myStudentRecord: (userId) => request('/api/students/me', { headers: withUser(userId) }),
  adminListStudents: (userId, role) =>
    request('/api/students', { headers: withRole(role, withUser(userId)) }),
  adminUpsertStudent: (userId, role, body) =>
    request('/api/students', {
      method: 'POST',
      headers: withRole(role, withUser(userId)),
      body: JSON.stringify(body),
    }),

  // PS02: Activity logs
  createActivityLog: (userId, body) =>
    request('/api/activity-logs', { method: 'POST', headers: withUser(userId), body: JSON.stringify(body) }),
  adminListActivityLogs: (userId, role, params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/api/activity-logs${q ? `?${q}` : ''}`, { headers: withRole(role, withUser(userId)) })
  },

  // VTOP Cloud Function sync (Firebase Functions)
  // POST ${import.meta.env.VITE_API_URL}/vtop/login
  syncVtop: ({ username, password }) =>
    request('/api/vtop/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  // Entry/Exit logs
  entryExitMy: (userId) => request('/api/entry-exit/me', { headers: withUser(userId) }),
  adminListEntryExitLogs: (userId, role) => request('/api/entry-exit', { headers: withRole(role, withUser(userId)) }),
  entryExitCreate: (userId, body) =>
    request('/api/entry-exit', { method: 'POST', headers: withUser(userId), body: JSON.stringify(body) }),

  // Mess attendance + parent notify
  messAttendanceMy: (userId, date) =>
    request(`/api/mess-attendance/me${date ? `?date=${encodeURIComponent(date)}` : ''}`, {
      headers: withUser(userId),
    }),
  messAttendanceMark: (userId, body) =>
    request('/api/mess-attendance', {
      method: 'POST',
      headers: withUser(userId),
      body: JSON.stringify(body),
    }),
  messNotifyParent: (userId, date) =>
    request('/api/mess-attendance/notify-parent', {
      method: 'POST',
      headers: withUser(userId),
      body: JSON.stringify({ date }),
    }),

  // Ambulance
  ambulanceRequest: (userId, body) =>
    request('/api/ambulance', { method: 'POST', headers: withUser(userId), body: JSON.stringify(body) }),
  ambulanceMy: (userId) => request('/api/ambulance/me', { headers: withUser(userId) }),

  // Room service
  roomServiceRequest: (userId, note) =>
    request('/api/room-service', {
      method: 'POST',
      headers: withUser(userId),
      body: JSON.stringify({ note }),
    }),
  roomServiceMy: (userId) => request('/api/room-service/me', { headers: withUser(userId) }),
}
