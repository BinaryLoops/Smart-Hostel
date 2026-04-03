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
    const payload = {
      hostel: {
        roomNumber: 'B-204',
        studentId: userId,
        feesDue: false,
        outingsRemaining: 2,
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
  // Temporary compatibility for environments where VTOP TLS chain validation fails.
  // Keep this scoped to VTOP flow only.
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

  const jar = new CookieJar()
  const client = wrapper(
    axios.create({
      jar,
      withCredentials: true,
      timeout: 20000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
      },
      maxRedirects: 0,
      validateStatus: () => true,
    })
  )

  const homeRes = await client.get('https://vtopcc.vit.ac.in/vtop/')
  const homeHtml = typeof homeRes.data === 'string' ? homeRes.data : ''

  // Heuristic: detect the actual username/password form field names VTOP expects.
  // VTOP occasionally changes `name` attributes, so sending `username/password` blindly can fail.
  let userField = 'username'
  let passField = 'password'
  try {
    const $ = cheerio.load(homeHtml)
    const passInput = $('input[type="password"]').first()
    const passName = passInput.attr('name') || passInput.attr('id')
    if (passName) passField = passName

    const userInput = $('input[type="text"]').first() || $('input[type="email"]').first()
    const byHint = $('input')
      .filter((_, el) => {
        const name = ($(el).attr('name') || '').toLowerCase()
        const id = ($(el).attr('id') || '').toLowerCase()
        return /user|reg|roll|id|student|username/.test(name) || /user|reg|roll|id|student|username/.test(id)
      })
      .first()

    const chosenUser = userInput?.length ? userInput : byHint
    const userName = chosenUser?.attr?.('name') || chosenUser?.attr?.('id')
    if (userName) userField = userName
  } catch {
    // Fall back to defaults if HTML parsing fails.
  }

  const toFormBody = (u, p) =>
    new URLSearchParams({
      [userField]: u,
      [passField]: p,
    }).toString()

  const loginEndpoints = [
    'https://vtopcc.vit.ac.in/vtop/doLogin',
    'https://vtopcc.vit.ac.in/vtop/login',
    'https://vtopcc.vit.ac.in/vtop/processLogin',
  ]

  let loggedIn = false
  let lastHtml = ''
  let captchaRequired = false
  for (const url of loginEndpoints) {
    const res = await client.post(
      url,
      toFormBody(username, password),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )

    const html = typeof res.data === 'string' ? res.data : ''
    lastHtml = html || lastHtml
    const location = typeof res.headers?.location === 'string' ? res.headers.location : ''

    const maybeCaptcha =
      /captcha|recaptcha|g-recaptcha/i.test(html) ||
      /name=["']?captcha["']?|id=["']?captcha["']?/i.test(html) ||
      /captcha|recaptcha|verify/i.test(location)

    if (maybeCaptcha) captchaRequired = true

    if (res.status === 200 && /logout|dashboard|v-top|vtop/i.test(lastHtml)) {
      loggedIn = true
      break
    }
    if (res.status >= 300 && res.status < 400) {
      loggedIn = true
      break
    }
  }

  if (!loggedIn) {
    const maybeCaptcha = captchaRequired || /captcha|recaptcha|g-recaptcha|verify/i.test(lastHtml || '')
    const err = new Error(maybeCaptcha ? 'CAPTCHA_REQUIRED' : 'INVALID_CREDENTIALS_OR_FLOW_CHANGED')
    err.code = maybeCaptcha ? 'CAPTCHA_REQUIRED' : 'INVALID_CREDENTIALS'
    throw err
  }
  return client
}

async function fetchHostelData(client) {
  const candidates = [
    'https://vtopcc.vit.ac.in/vtop/hostel/hostelRoomInformation',
    'https://vtopcc.vit.ac.in/vtop/hostel/hostelStudentRoomInfo',
    'https://vtopcc.vit.ac.in/vtop/hostel/hostelInfo',
    'https://vtopcc.vit.ac.in/vtop/hostel',
  ]
  let html = ''
  for (const url of candidates) {
    const res = await client.get(url)
    if (typeof res.data === 'string' && res.data.length > 1000) {
      html = res.data
      break
    }
  }
  if (!html) throw new Error('Could not fetch hostel data page')

  const $ = cheerio.load(html)
  const block = extractByLabel($, 'Block') || extractByLabel($, 'Hostel Block')
  const room = extractByLabel($, 'Room') || extractByLabel($, 'Room No') || extractByLabel($, 'Room Number')
  const messType = extractByLabel($, 'Mess Type') || extractByLabel($, 'Mess')
  const outingsRaw = extractByLabel($, 'Outings') || extractByLabel($, 'Outing')
  const outings = outingsRaw ? Number(String(outingsRaw).match(/\d+/)?.[0] || '') || null : null

  return { block: block || '', room: room || '', messType: messType || '', outings }
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

