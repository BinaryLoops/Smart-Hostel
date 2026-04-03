// In-memory “DB” for demo deployments. Replace with a real DB later.

export const memory = {
  notifications: [],
  announcements: [
    { id: 'ann1', title: 'Hostel Registration Open', content: 'Fall semester hostel registration is now open.', date: new Date().toISOString(), priority: 2, pinned: true }
  ],
  complaints: [
    { id: 'cmp1', userId: 'demo-student1@vit.ac.in', category: 'Electrical', roomNumber: '412', description: 'Fan is not working', status: 'open', createdAt: new Date().toISOString() },
    { id: 'cmp2', userId: 'demo-student2@vit.ac.in', category: 'Plumbing', roomNumber: '205', description: 'Tap is leaking', status: 'resolved', createdAt: new Date(Date.now() - 86400000).toISOString() }
  ],
  messIntent: [],
  laundryBookings: [],
  events: [
    { id: 'evt1', title: 'Tech Meetup', description: 'Annual tech meetup in the main auditorium', date: new Date(Date.now() + 86400000).toISOString(), rsvps: [] }
  ],
  vtopSync: new Map(), // userId -> { lastSyncedAt, lastStatus }
  // PS02 additions
  students: [
    { id: 'demo-student1', email: 'demo-student1@vit.ac.in', name: 'Aarav Patel', block: 'A', roomNumber: '412', gender: 'Male', course: 'CSE Core', courseName: 'B.Tech', bedType: '2 bed AC', hostelRank: 42, regNumber: '21BCE0012', role: 'student' },
    { id: 'demo-student2', email: 'demo-student2@vit.ac.in', name: 'Priya Sharma', block: 'C-Girls', roomNumber: '205', gender: 'Female', course: 'ECE', courseName: 'B.Tech', bedType: '4 bed NON-AC', hostelRank: 120, regNumber: '21BEE0045', role: 'student' }
  ], // { id(userId/email), name, email, phone, guardianPhone, roomNumber, block, role }
  rooms: [], // { id, block, roomNumber, capacity, occupants: [studentId] }
  activityLogs: [], // { id, studentId, type, note, at, createdAt }
  // New modules (demo fallback)
  entryExitLogs: [
    { id: 'eel1', studentId: 'demo-student1', studentName: 'Aarav Patel', studentBlock: 'A', scannedAtBlock: 'A', kind: 'entry', isRedAlert: false, actualAt: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: 'eel2', studentId: 'demo-student2', studentName: 'Priya Sharma', studentBlock: 'C-Girls', scannedAtBlock: 'A', kind: 'entry', isRedAlert: true, alertReason: 'Student from Block C-Girls entered unauthorized Block A. [CRITICAL: Female entering Male Hostel]', actualAt: new Date().toISOString(), createdAt: new Date().toISOString() }
  ], // { id, studentId, kind, expectedAt, actualAt, minutesLate, createdAt }
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

