import { onRequest } from 'firebase-functions/v2/https'
import admin from 'firebase-admin'
import express from 'express'
import cors from 'cors'
import axios from 'axios'
import { wrapper } from 'axios-cookiejar-support'
import { CookieJar } from 'tough-cookie'
import * as cheerio from 'cheerio'

// Do not re-initialize if already initialized (Functions hot reload / tests).
if (!admin.apps.length) {
  admin.initializeApp()
}

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

function must(v, name) {
  if (!v) throw new Error(`${name} is required`)
  return v
}

function extractByLabel($, label) {
  // Tries common patterns: "Label: value" or table rows where first cell contains label.
  const needle = label.toLowerCase()

  // Table row search
  const row = $('tr')
    .filter((_, el) => $(el).text().toLowerCase().includes(needle))
    .first()
  if (row.length) {
    const tds = row.find('td')
    if (tds.length >= 2) return $(tds[1]).text().trim()
  }

  // Generic label: value search
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

  // Step 1: open landing page to establish cookies
  await client.get('https://vtopcc.vit.ac.in/vtop/')

  // Step 2: attempt login (VTOP can change forms/captcha; this is best-effort)
  // Many VTOP instances use endpoint similar to /vtop/doLogin (may differ).
  const loginEndpoints = [
    'https://vtopcc.vit.ac.in/vtop/doLogin',
    'https://vtopcc.vit.ac.in/vtop/login',
    'https://vtopcc.vit.ac.in/vtop/processLogin',
  ]

  let loggedIn = false
  let lastHtml = ''
  for (const url of loginEndpoints) {
    const res = await client.post(
      url,
      new URLSearchParams({
        username,
        password,
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )

    lastHtml = typeof res.data === 'string' ? res.data : ''
    // Heuristic: after login, page usually contains "V-TOP" portal elements.
    if (res.status === 200 && /logout|dashboard|v-top|vtop/i.test(lastHtml)) {
      loggedIn = true
      break
    }
    // Redirect can also indicate success
    if (res.status >= 300 && res.status < 400) {
      loggedIn = true
      break
    }
  }

  if (!loggedIn) {
    throw new Error('VTOP login failed (form/captcha may be required)')
  }

  return client
}

async function fetchHostelData(client) {
  // Try a few likely pages; VTOP changes these paths.
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

// ONLY NEW ROUTE: POST /vtop/login  (deployed URL becomes .../api/vtop/login)
app.post('/vtop/login', async (req, res) => {
  try {
    const username = must(req.body?.username, 'username')
    const password = must(req.body?.password, 'password')

    const client = await vtopSessionLogin({ username, password })
    const hostel = await fetchHostelData(client)

    const lastSynced = admin.firestore.FieldValue.serverTimestamp()
    await admin
      .firestore()
      .collection('students')
      .doc(username)
      .set(
        {
          vtop: {
            ...hostel,
            lastSynced,
          },
        },
        { merge: true }
      )

    res.json({ ok: true, hostel })
  } catch (e) {
    res.status(400).json({ ok: false, message: e instanceof Error ? e.message : 'Failed' })
  }
})

export const api = onRequest({ region: 'us-central1' }, app)

