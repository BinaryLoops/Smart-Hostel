import { chromium } from 'playwright'

const base = 'http://localhost:5173'
const results = []
const push = (name, status, note = '') => results.push({ name, status, note })

async function step(name, fn) {
  try {
    await fn()
    push(name, 'PASS')
  } catch (e) {
    push(name, 'FAIL', e instanceof Error ? e.message : String(e))
  }
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

async function signup(email, role = 'student') {
  await page.goto(`${base}/signup`, { waitUntil: 'domcontentloaded' })
  const form = page.locator('form').first()
  await form.locator('input').nth(0).fill(role === 'admin' ? 'Admin User' : 'Student User')
  await form.locator('input[type="email"]').fill(email)
  await form.locator('input[type="password"]').fill('Password@123')
  await form.locator('select').first().selectOption(role)
  await page.getByRole('button', { name: /sign up/i }).click()
  await page.waitForURL((u) => u.pathname === '/', { timeout: 15000 })
}

try {
  await step('Signup student', async () => {
    await signup(`student${Date.now()}@example.com`, 'student')
  })

  for (const p of ['/', '/mess', '/complaints', '/leave', '/attendance', '/logs', '/laundry', '/room', '/fees', '/lost-found', '/gym', '/events', '/hospital']) {
    await step(`Open ${p}`, async () => {
      await page.goto(`${base}${p}`, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(300)
    })
  }

  await step('Notifications bell opens panel', async () => {
    await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: /notifications/i }).click()
    await page.getByText('Smart alerts').waitFor({ timeout: 5000 })
  })

  await step('Logs add entry', async () => {
    await page.goto(`${base}/logs`, { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: /add entry/i }).click()
    await page.waitForTimeout(500)
  })

  await step('Mess actions', async () => {
    await page.goto(`${base}/mess`, { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: /^attended$/i }).first().click()
    await page.getByRole('button', { name: /send missed meal details to parent/i }).click()
    await page.getByPlaceholder(/reason \/ health note/i).fill('Fever')
    await page.getByRole('button', { name: /^request$/i }).click()
  })

  await step('Gate pass modal', async () => {
    await page.goto(`${base}/leave`, { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: /generate gate pass/i }).click()
    await page.getByText('QR Gate Pass').waitFor({ timeout: 5000 })
  })

  await step('Laundry paid toggle', async () => {
    await page.goto(`${base}/laundry`, { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: /toggle paid laundry/i }).click()
    await page.getByRole('button', { name: /open laundroswipe/i }).waitFor({ timeout: 5000 })
  })

  await step('Ambulance submit', async () => {
    await page.goto(`${base}/hospital`, { waitUntil: 'domcontentloaded' })
    await page.getByPlaceholder(/pickup location/i).fill('Hostel Main Gate')
    await page.getByPlaceholder(/symptoms/i).fill('Headache')
    await page.getByRole('button', { name: /request ambulance/i }).click()
  })

  await step('Sign out', async () => {
    await page.getByRole('button', { name: /sign out/i }).click()
    await page.waitForURL((u) => u.pathname === '/login', { timeout: 10000 })
  })

  await step('Signup admin', async () => {
    await signup(`admin${Date.now()}@example.com`, 'admin')
  })

  await step('Open admin page + AI summary button', async () => {
    await page.goto(`${base}/admin`, { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: /ai summary|summarizing/i }).click()
    await page.waitForTimeout(1500)
  })
} finally {
  await browser.close()
}

console.log(JSON.stringify(results, null, 2))

