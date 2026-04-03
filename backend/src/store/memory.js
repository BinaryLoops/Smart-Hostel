// In-memory “DB” for demo deployments. Replace with a real DB later.

export const memory = {
  notifications: [],
  announcements: [],
  complaints: [],
  messIntent: [],
  laundryBookings: [],
  events: [],
  vtopSync: new Map(), // userId -> { lastSyncedAt, lastStatus }
  // PS02 additions
  students: [], // { id(userId/email), name, email, phone, guardianPhone, roomNumber, block, role }
  rooms: [], // { id, block, roomNumber, capacity, occupants: [studentId] }
  activityLogs: [], // { id, studentId, type, note, at, createdAt }
  // New modules (demo fallback)
  entryExitLogs: [], // { id, studentId, kind, expectedAt, actualAt, minutesLate, createdAt }
  messAttendance: [], // { id, studentId, date, meal, attended, createdAt }
  parentNotifications: [], // { id, studentId, date, missedMeals:[], createdAt }
  ambulanceRequests: [], // { id, studentId, status, pickup, note, referredHospital, attendant, etaMins, createdAt }
  roomServiceRequests: [], // { id, studentId, note, status, createdAt }
}

export function nowIso() {
  return new Date().toISOString()
}

export function newId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

