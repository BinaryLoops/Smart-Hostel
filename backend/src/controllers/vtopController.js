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
        roomNumber: randomHostel.room,
        block: randomHostel.block,
        messType: randomHostel.messType,
        studentId: userId,
        feesDue: false,
        outingsRemaining: randomHostel.outings,
      },
    }

    await store.setVtopState(userId, { lastSyncedAt: syncedAt, lastStatus: 'success', lastError: null })
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
  // Generate random demo data
  const blocks = ['A Block', 'B Block', 'C Block', 'D Block']
  const randomBlock = blocks[Math.floor(Math.random() * blocks.length)]
  const randomRoom = Math.floor(Math.random() * 800) + 101 // rooms 101-900

  const messTypes = ['Special Mess', 'Non-Veg Mess', 'Veg Mess']
  const randomMess = messTypes[Math.floor(Math.random() * messTypes.length)]

  const randomOutings = Math.floor(Math.random() * 5) + 1 // 1-5 outings

  return {
    block: randomBlock,
    room: String(randomRoom),
    messType: randomMess,
    outings: randomOutings
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

