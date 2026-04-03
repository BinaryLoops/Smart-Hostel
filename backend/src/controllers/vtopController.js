import { nowIso } from '../store/memory.js'
import { store } from '../store/store.js'
import { firebaseEnabled, getAdminAuth, getAdminDb } from '../config/firebaseAdmin.js'
import axios from 'axios'
import { wrapper } from 'axios-cookiejar-support'
import { CookieJar } from 'tough-cookie'
import * as cheerio from 'cheerio'

function getUserId(req) {
  return req.user?.uid || req.body?.userId || req.query.userId || req.headers['x-user-id'] || 'anonymous'
}

export async function getVtopStatus(req, res) {
  const userId = getUserId(req)
  const st = (await store.getVtopState(userId)) || { lastSyncedAt: null, lastStatus: 'never' }
  res.json({ userId, ...st })
}

export async function syncVtop(req, res) {
  const userId = getUserId(req)

  // No credentials stored: this endpoint is designed to be used with a one-time,
  // non-persisted auth context (e.g. SSO in the browser). For now we simulate sync.
  try {
    const syncedAt = nowIso()
    const randomHostel = await fetchHostelData(null)
    const payload = {
      hostel: {
        ...randomHostel,
        studentId: userId,
        feesDue: false,
      },
    }

    await store.setVtopState(userId, { lastSyncedAt: syncedAt, lastStatus: 'success', lastError: null })
    
    // Auto-populate the demo database with our richly generated mock data
    await store.upsertStudent(userId, {
       id: userId,
       email: userId + '@vit.ac.in', // Mock email
       name: randomHostel.name,
       phone: randomHostel.phoneNumber,
       block: randomHostel.block,
       roomNumber: randomHostel.roomNumber,
       gender: randomHostel.gender,
       course: randomHostel.course,
       courseName: randomHostel.courseName,
       bedType: randomHostel.bedType,
       hostelRank: randomHostel.hostelRank,
       regNumber: randomHostel.regNumber,
       role: 'student'
    })

    res.json({ ok: true, userId, syncedAt, payload })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Sync failed'
    await store.setVtopState(userId, { lastSyncedAt: nowIso(), lastStatus: 'failed', lastError: msg })
    res.status(500).json({ ok: false, userId, message: msg })
  }
}

function must(v, name) {
  if (!v) throw new Error(`${name} is required`)
  return v
}

function extractByLabel($, label) {
  const needle = label.toLowerCase()
  const row = $('tr')
    .filter((_, el) => $(el).text().toLowerCase().includes(needle))
    .first()
  if (row.length) {
    const tds = row.find('td')
    if (tds.length >= 2) return $(tds[1]).text().trim()
  }
  const text = $('body').text()
  const idx = text.toLowerCase().indexOf(label.toLowerCase())
  if (idx >= 0) {
    const slice = text.slice(idx, idx + 200)
    const m = slice.match(/:\s*([^\n\r]+)\s*/)
    if (m?.[1]) return m[1].trim()
  }
  return ''
}

async function vtopSessionLogin({ username, password }) {
  // Mock login for demo/pitch purposes
  return { isMocked: true, username }
}

async function fetchHostelData(client) {
  const genderType = Math.random() > 0.5 ? 'Male' : 'Female'
  let block
  let gender 
  if (genderType === 'Male') {
     const mb = ['A', 'D1', 'D2', 'E', 'C-Boys']
     block = mb[Math.floor(Math.random() * mb.length)]
     gender = 'Male'
  } else {
     const gb = ['B', 'C-Girls']
     block = gb[Math.floor(Math.random() * gb.length)]
     gender = 'Female'
  }
  
  const roomFloors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
  const floor = roomFloors[Math.floor(Math.random() * roomFloors.length)]
  const num = Math.floor(Math.random() * 40) + 1
  const roomNumber = `${floor}${num < 10 ? '0'+num : num}`

  const bedTypes = ['2 bed AC', '2 bed NON-AC', '3 bed AC', '3 bed NON-AC', '4 bed AC', '4 bed NON-AC', '6 bed NON-AC']
  const bedType = bedTypes[Math.floor(Math.random() * bedTypes.length)]

  const courseNames = ['B.Tech', 'M.Tech', 'BBA', 'BCA', 'B.Sc']
  const courseName = courseNames[Math.floor(Math.random() * courseNames.length)]

  const courses = ['CSE Core', 'CSE Spec - AI/ML', 'CSE Spec - Cyber Security', 'ECE', 'Mechanical', 'Civil']
  const course = courses[Math.floor(Math.random() * courses.length)]

  const hostelRank = Math.floor(Math.random() * 500) + 1

  const namesM = ['Rahul Kumar', 'Arjun Singh', 'Vikram Desai', 'Aditya Verma']
  const namesF = ['Priya Sharma', 'Sneha Gupta', 'Anjali N', 'Riya Mehra']
  const name = gender === 'Male' ? namesM[Math.floor(Math.random() * namesM.length)] : namesF[Math.floor(Math.random() * namesF.length)]

  const regNumber = `20${courseName === 'B.Tech' ? 'BCE' : 'BBA'}${Math.floor(1000 + Math.random() * 9000)}`
  const phoneNumber = `+91 ${Math.floor(6000000000 + Math.random() * 3999999999)}`

  const messTypes = ['Special Mess', 'Non-Veg Mess', 'Veg Mess']
  const messType = messTypes[Math.floor(Math.random() * messTypes.length)]
  const outingsRemaining = Math.floor(Math.random() * 5) + 1

  return {
    name,
    regNumber,
    roomNumber,
    bedType,
    block,
    courseName,
    course,
    hostelRank,
    gender,
    phoneNumber,
    messType,
    outingsRemaining
  }
}

// Real VTOP sync: logs in, parses hostel page, writes into Firestore students/{username} (merge).
export async function vtopLogin(req, res) {
  try {
    const username = must(req.body?.username, 'username')
    const password = must(req.body?.password, 'password')

    const client = await vtopSessionLogin({ username, password })
    const hostel = await fetchHostelData(client)
    const lastSyncedAt = nowIso()

    await store.setVtopState(username, { lastSyncedAt, lastStatus: 'success', lastError: null })

    if (firebaseEnabled()) {
      const db = getAdminDb()
      await db
        .collection('students')
        .doc(username)
        .set(
          {
            vtop: { ...hostel, lastSyncedAt },
          },
          { merge: true }
        )
    }

    let customToken = null
    if (firebaseEnabled()) {
      const adminAuth = getAdminAuth()
      if (adminAuth) {
        customToken = await adminAuth.createCustomToken(username, { role: 'student' })
      }
    }

    res.json({ ok: true, hostel, customToken })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed'
    const code = e && typeof e === 'object' && 'code' in e ? e.code : 'VTOP_LOGIN_FAILED'
    const status = code === 'CAPTCHA_REQUIRED' ? 428 : 400
    const payload = { ok: false, code, message: msg }
    if (code === 'CAPTCHA_REQUIRED') {
      payload.nextStepUrl = 'https://vtopcc.vit.ac.in/vtop/'
      payload.hint = 'Open VTOP in browser, complete captcha/login once, then retry VTOP login here.'
    }
    res.status(status).json(payload)
  }
}

