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

