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
  // Mock login for demo purposes
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

