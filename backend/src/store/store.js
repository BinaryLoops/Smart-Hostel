import { memory, newId, nowIso } from './memory.js'
import { getAdminDb, firebaseEnabled } from '../config/firebaseAdmin.js'

function col(name) {
  const db = getAdminDb()
  return db.collection(name)
}

async function listCollection(name, { orderBy = 'createdAt', direction = 'desc', limit = 200 } = {}) {
  if (!firebaseEnabled()) return null
  const snap = await col(name).orderBy(orderBy, direction).limit(limit).get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const store = {
  // Notifications
  async listNotifications(userId, { unreadOnly = false } = {}) {
    if (!firebaseEnabled()) {
      return memory.notifications
        .filter((n) => n.userId === userId && (!unreadOnly || !n.readAt))
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    }

    let q = col('notifications').where('userId', '==', userId)
    if (unreadOnly) q = q.where('readAt', '==', null)
    const snap = await q.orderBy('createdAt', 'desc').limit(200).get()
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  },
  async createNotification(doc) {
    const n = { ...doc, createdAt: doc.createdAt || nowIso(), readAt: doc.readAt ?? null }
    if (!firebaseEnabled()) {
      const withId = { id: newId('ntf'), ...n }
      memory.notifications.push(withId)
      return withId
    }
    const ref = await col('notifications').add(n)
    return { id: ref.id, ...n }
  },
  async markNotificationRead(userId, id) {
    if (!firebaseEnabled()) {
      const n = memory.notifications.find((x) => x.id === id && x.userId === userId)
      if (!n) return null
      n.readAt = n.readAt || nowIso()
      return n
    }
    const ref = col('notifications').doc(id)
    const snap = await ref.get()
    if (!snap.exists) return null
    const data = snap.data()
    if (data.userId !== userId) return null
    const readAt = data.readAt || nowIso()
    await ref.update({ readAt })
    return { id, ...data, readAt }
  },
  async markAllNotificationsRead(userId) {
    const ts = nowIso()
    if (!firebaseEnabled()) {
      let changed = 0
      for (const n of memory.notifications) {
        if (n.userId === userId && !n.readAt) {
          n.readAt = ts
          changed++
        }
      }
      return { ok: true, changed }
    }
    const snap = await col('notifications').where('userId', '==', userId).where('readAt', '==', null).get()
    const batch = getAdminDb().batch()
    snap.docs.forEach((d) => batch.update(d.ref, { readAt: ts }))
    await batch.commit()
    return { ok: true, changed: snap.size }
  },

  // Announcements
  async listAnnouncements() {
    if (!firebaseEnabled()) {
      return [...memory.announcements].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        if (a.priority !== b.priority) return (b.priority || 1) - (a.priority || 1)
        return a.date < b.date ? 1 : -1
      })
    }
    const items = await listCollection('announcements', { orderBy: 'date', direction: 'desc', limit: 200 })
    return items.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      if ((a.priority || 1) !== (b.priority || 1)) return (b.priority || 1) - (a.priority || 1)
      return a.date < b.date ? 1 : -1
    })
  },
  async createAnnouncement(doc) {
    const a = { ...doc, createdAt: doc.createdAt || nowIso() }
    if (!firebaseEnabled()) {
      const withId = { id: newId('ann'), ...a }
      memory.announcements.push(withId)
      return withId
    }
    const ref = await col('announcements').add(a)
    return { id: ref.id, ...a }
  },
  async updateAnnouncement(id, patch) {
    if (!firebaseEnabled()) {
      const idx = memory.announcements.findIndex((x) => x.id === id)
      if (idx < 0) return null
      memory.announcements[idx] = { ...memory.announcements[idx], ...patch }
      return memory.announcements[idx]
    }
    const ref = col('announcements').doc(id)
    const snap = await ref.get()
    if (!snap.exists) return null
    await ref.update(patch)
    return { id, ...snap.data(), ...patch }
  },

  // Students
  async getStudent(uidOrEmail) {
    if (!firebaseEnabled()) {
      return memory.students.find((x) => x.id === uidOrEmail || x.email === uidOrEmail) || null
    }
    const ref = col('students').doc(uidOrEmail)
    const snap = await ref.get()
    if (snap.exists) return { id: snap.id, ...snap.data() }
    // Fallback: search by email (small scale)
    const q = await col('students').where('email', '==', uidOrEmail).limit(1).get()
    if (q.empty) return null
    const d = q.docs[0]
    return { id: d.id, ...d.data() }
  },
  async listStudents() {
    if (!firebaseEnabled()) return memory.students
    return await listCollection('students', { orderBy: 'createdAt', direction: 'desc', limit: 500 })
  },
  async upsertStudent(id, doc) {
    const s = { ...doc, createdAt: doc.createdAt || nowIso() }
    if (!firebaseEnabled()) {
      const idx = memory.students.findIndex((x) => x.id === id)
      const withId = { id, ...s }
      if (idx >= 0) memory.students[idx] = withId
      else memory.students.push(withId)
      return withId
    }
    await col('students').doc(id).set(s, { merge: true })
    const snap = await col('students').doc(id).get()
    return { id: snap.id, ...snap.data() }
  },

  // Activity logs
  async createActivityLog(doc) {
    const entry = { ...doc, createdAt: doc.createdAt || nowIso() }
    if (!firebaseEnabled()) {
      const withId = { id: newId('log'), ...entry }
      memory.activityLogs.push(withId)
      return withId
    }
    const ref = await col('activityLogs').add(entry)
    return { id: ref.id, ...entry }
  },
  async listActivityLogs({ studentId, type } = {}) {
    if (!firebaseEnabled()) {
      return memory.activityLogs
        .filter((l) => (studentId ? l.studentId === studentId : true))
        .filter((l) => (type ? l.type === type : true))
        .sort((a, b) => (a.at < b.at ? 1 : -1))
    }
    let q = col('activityLogs')
    if (studentId) q = q.where('studentId', '==', studentId)
    if (type) q = q.where('type', '==', type)
    const snap = await q.orderBy('at', 'desc').limit(500).get()
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  },

  // Complaints
  async createComplaint(doc) {
    const c = { ...doc, createdAt: doc.createdAt || nowIso(), resolvedAt: doc.resolvedAt ?? null }
    if (!firebaseEnabled()) {
      const withId = { id: newId('cmp'), ...c }
      memory.complaints.push(withId)
      return withId
    }
    const ref = await col('complaints').add(c)
    return { id: ref.id, ...c }
  },
  async resolveComplaint(id) {
    const patch = { status: 'resolved', resolvedAt: nowIso() }
    if (!firebaseEnabled()) {
      const c = memory.complaints.find((x) => x.id === id)
      if (!c) return null
      Object.assign(c, patch)
      return c
    }
    const ref = col('complaints').doc(id)
    const snap = await ref.get()
    if (!snap.exists) return null
    await ref.update(patch)
    return { id, ...snap.data(), ...patch }
  },
  async listComplaints({ limit = 500 } = {}) {
    if (!firebaseEnabled()) return [...memory.complaints].slice(-limit)
    const snap = await col('complaints').orderBy('createdAt', 'desc').limit(limit).get()
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  },

  // Mess intent (crowd)
  async markMessIntent({ userId, slot }) {
    const entry = { userId, slot, createdAt: nowIso() }
    if (!firebaseEnabled()) {
      memory.messIntent = memory.messIntent.filter((x) => !(x.userId === userId && x.slot === slot))
      memory.messIntent.push({ id: newId('msi'), ...entry })
      return { ok: true }
    }
    // Use deterministic doc id to de-dupe per user+slot.
    const docId = `${userId}__${slot}`
    await col('messIntent').doc(docId).set(entry, { merge: true })
    return { ok: true }
  },
  async countMessIntent(slot) {
    if (!firebaseEnabled()) return memory.messIntent.filter((x) => x.slot === slot).length
    const snap = await col('messIntent').where('slot', '==', slot).get()
    return snap.size
  },

  // Laundry
  async createLaundryBooking(doc) {
    const b = { ...doc, createdAt: doc.createdAt || nowIso() }
    if (!firebaseEnabled()) {
      const withId = { id: newId('lnd'), ...b }
      memory.laundryBookings.push(withId)
      return withId
    }
    const ref = await col('laundryBookings').add(b)
    return { id: ref.id, ...b }
  },
  async listLaundryBookings({ userId } = {}) {
    if (!firebaseEnabled()) {
      return memory.laundryBookings
        .filter((b) => (userId ? b.userId === userId : true))
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    }
    let q = col('laundryBookings')
    if (userId) q = q.where('userId', '==', userId)
    const snap = await q.orderBy('createdAt', 'desc').limit(500).get()
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  },

  // Events
  async listEvents() {
    if (!firebaseEnabled()) {
      return [...memory.events].sort((a, b) => (a.date < b.date ? -1 : 1))
    }
    const snap = await col('events').orderBy('date', 'asc').limit(200).get()
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  },
  async createEvent(doc) {
    const e = { ...doc, createdAt: doc.createdAt || nowIso(), rsvps: doc.rsvps || [] }
    if (!firebaseEnabled()) {
      const withId = { id: newId('evt'), ...e }
      memory.events.push(withId)
      return withId
    }
    const ref = await col('events').add(e)
    return { id: ref.id, ...e }
  },
  async rsvpEvent(id, userId) {
    if (!firebaseEnabled()) {
      const e = memory.events.find((x) => x.id === id)
      if (!e) return null
      e.rsvps ||= []
      if (!e.rsvps.some((r) => r.userId === userId)) e.rsvps.push({ userId, at: nowIso() })
      return { ok: true, rsvpCount: e.rsvps.length }
    }
    const ref = col('events').doc(id)
    const snap = await ref.get()
    if (!snap.exists) return null
    const data = snap.data() || {}
    const rsvps = Array.isArray(data.rsvps) ? data.rsvps : []
    if (!rsvps.some((r) => r.userId === userId)) rsvps.push({ userId, at: nowIso() })
    await ref.update({ rsvps })
    return { ok: true, rsvpCount: rsvps.length }
  },

  // VTOP sync state (store only status/timestamp)
  async getVtopState(userId) {
    if (!firebaseEnabled()) return memory.vtopSync.get(userId) || null
    const snap = await col('vtopSync').doc(userId).get()
    return snap.exists ? snap.data() : null
  },
  async setVtopState(userId, state) {
    if (!firebaseEnabled()) {
      memory.vtopSync.set(userId, state)
      return state
    }
    await col('vtopSync').doc(userId).set(state, { merge: true })
    return state
  },

  // Entry/Exit logs
  async createEntryExitLog(doc) {
    const entry = { ...doc, createdAt: doc.createdAt || nowIso() }
    if (!firebaseEnabled()) {
      const withId = { id: newId('eel'), ...entry }
      memory.entryExitLogs.push(withId)
      return withId
    }
    const ref = await col('entryExitLogs').add(entry)
    return { id: ref.id, ...entry }
  },
  async listEntryExitLogs({ studentId } = {}) {
    if (!firebaseEnabled()) {
      return memory.entryExitLogs
        .filter((l) => (studentId ? l.studentId === studentId : true))
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    }
    let q = col('entryExitLogs')
    if (studentId) q = q.where('studentId', '==', studentId)
    const snap = await q.orderBy('createdAt', 'desc').limit(500).get()
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  },

  // Mess attendance
  async upsertMessAttendance({ studentId, date, meal, attended }) {
    const doc = { studentId, date, meal, attended: Boolean(attended), createdAt: nowIso() }
    if (!firebaseEnabled()) {
      const key = `${studentId}:${date}:${meal}`
      memory.messAttendance = memory.messAttendance.filter((x) => `${x.studentId}:${x.date}:${x.meal}` !== key)
      memory.messAttendance.push({ id: newId('msa'), ...doc })
      return { ok: true }
    }
    const id = `${studentId}__${date}__${meal}`.replace(/[^\w\-]/g, '_')
    await col('messAttendance').doc(id).set(doc, { merge: true })
    return { ok: true }
  },
  async listMessAttendance({ studentId, date } = {}) {
    if (!firebaseEnabled()) {
      return memory.messAttendance
        .filter((x) => (studentId ? x.studentId === studentId : true))
        .filter((x) => (date ? x.date === date : true))
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    }
    let q = col('messAttendance')
    if (studentId) q = q.where('studentId', '==', studentId)
    if (date) q = q.where('date', '==', date)
    const snap = await q.orderBy('createdAt', 'desc').limit(200).get()
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  },
  async createParentNotification(doc) {
    const entry = { ...doc, createdAt: doc.createdAt || nowIso() }
    if (!firebaseEnabled()) {
      const withId = { id: newId('pnt'), ...entry }
      memory.parentNotifications.push(withId)
      return withId
    }
    const ref = await col('parentNotifications').add(entry)
    return { id: ref.id, ...entry }
  },

  // Ambulance
  async createAmbulanceRequest(doc) {
    const entry = { ...doc, createdAt: doc.createdAt || nowIso() }
    if (!firebaseEnabled()) {
      const withId = { id: newId('amb'), ...entry }
      memory.ambulanceRequests.push(withId)
      return withId
    }
    const ref = await col('ambulanceRequests').add(entry)
    return { id: ref.id, ...entry }
  },
  async listAmbulanceRequests({ studentId } = {}) {
    if (!firebaseEnabled()) {
      return memory.ambulanceRequests
        .filter((x) => (studentId ? x.studentId === studentId : true))
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    }
    let q = col('ambulanceRequests')
    if (studentId) q = q.where('studentId', '==', studentId)
    const snap = await q.orderBy('createdAt', 'desc').limit(200).get()
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  },
  async updateAmbulanceRequest(id, patch) {
    if (!firebaseEnabled()) {
      const idx = memory.ambulanceRequests.findIndex((x) => x.id === id)
      if (idx < 0) return null
      memory.ambulanceRequests[idx] = { ...memory.ambulanceRequests[idx], ...patch }
      return memory.ambulanceRequests[idx]
    }
    const ref = col('ambulanceRequests').doc(id)
    const snap = await ref.get()
    if (!snap.exists) return null
    await ref.update(patch)
    return { id, ...snap.data(), ...patch }
  },

  // Room service
  async createRoomServiceRequest(doc) {
    const entry = { ...doc, createdAt: doc.createdAt || nowIso() }
    if (!firebaseEnabled()) {
      const withId = { id: newId('rsr'), ...entry }
      memory.roomServiceRequests.push(withId)
      return withId
    }
    const ref = await col('roomServiceRequests').add(entry)
    return { id: ref.id, ...entry }
  },
  async listRoomServiceRequests({ studentId } = {}) {
    if (!firebaseEnabled()) {
      return memory.roomServiceRequests
        .filter((x) => (studentId ? x.studentId === studentId : true))
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    }
    let q = col('roomServiceRequests')
    if (studentId) q = q.where('studentId', '==', studentId)
    const snap = await q.orderBy('createdAt', 'desc').limit(200).get()
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  },
}

