import { chromium } from 'playwright'

const base = 'http://localhost:5173'
const results = []

function pass(name, note = '') {
  results.push({ name, status: 'PASS', note })
}
function fail(name, note = '') {
  results.push({ name, status: 'FAIL', note })
}

async function safeStep(name, fn) {
  try {
    await fn()
    pass(name)
  } catch (e) {
    fail(name, e instanceof Error ? e.message : String(e))
  }
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

async function signUp(email, role = 'student') {
  await page.goto(`${base}/signup`, { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Full name').fill(role === 'admin' ? 'Admin User' : 'Student User')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('Password@123')
  await page.getByLabel('Role').selectOption(role)
  await page.getByRole('button', { name: /sign up/i }).click()
  await page.waitForURL((u) => u.pathname === '/', { timeout: 15000 })
}

try {
  // Student flow
  const studentEmail = `student${Date.now()}@example.com`
  await safeStep('Signup student', async () => {
    await signUp(studentEmail, 'student')
  })

  const pages = [
    '/',
    '/mess',
    '/complaints',
    '/leave',
    '/attendance',
    '/logs',
    '/laundry',
    '/room',
    '/fees',
    '/lost-found',
    '/gym',
    '/events',
    '/hospital',
  ]

  for (const p of pages) {
    await safeStep(`Open page ${p}`, async () => {
      await page.goto(`${base}${p}`, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(400)
    })
  }

  await safeStep('Open notifications center', async () => {
    await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: /notifications/i }).click()
    await page.getByText('Smart alerts').waitFor({ timeout: 5000 })
  })

  await safeStep('Logs: Add Entry button', async () => {
    await page.goto(`${base}/logs`, { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: /add entry/i }).click()
    await page.waitForTimeout(800)
  })

  await safeStep('Mess: attendance + parent notify + room service', async () => {
    await page.goto(`${base}/mess`, { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: /attended/i }).first().click()
    await page.getByRole('button', { name: /send missed meal details to parent/i }).click()
    await page.getByPlaceholder(/reason \/ health note/i).fill('Fever')
    await page.getByRole('button', { name: /^request$/i }).click()
    await page.waitForTimeout(1000)
  })

  await safeStep('Leave: Generate Gate Pass opens modal', async () => {
    await page.goto(`${base}/leave`, { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: /generate gate pass/i }).click()
    await page.getByText('QR Gate Pass').waitFor({ timeout: 5000 })
  })

  await safeStep('Laundry: paid toggle + external button visible', async () => {
    await page.goto(`${base}/laundry`, { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: /toggle paid laundry/i }).click()
    await page.getByRole('button', { name: /open laundroswipe/i }).waitFor({ timeout: 5000 })
  })

  await safeStep('Hospital: submit ambulance request', async () => {
    await page.goto(`${base}/hospital`, { waitUntil: 'domcontentloaded' })
    await page.getByPlaceholder(/pickup location/i).fill('Hostel Main Gate')
    await page.getByPlaceholder(/symptoms/i).fill('Headache')
    await page.getByRole('button', { name: /request ambulance/i }).click()
    await page.waitForTimeout(1200)
  })

  // Upgrade to admin (best-effort)
  await safeStep('Sign out current user', async () => {
    await page.getByRole('button', { name: /sign out/i }).click()
    await page.waitForURL((u) => u.pathname === '/login', { timeout: 10000 })
  })

  const adminEmail = `admin${Date.now()}@example.com`
  await safeStep('Signup admin', async () => {
    await signUp(adminEmail, 'admin')
  })

  await safeStep('Open admin console', async () => {
    await page.goto(`${base}/admin`, { waitUntil: 'domcontentloaded' })
    await page.getByText(/admin console|admin console/i).first().waitFor({ timeout: 8000 })
  })

  await safeStep('Admin AI summary button', async () => {
    await page.getByRole('button', { name: /ai summary|summarizing/i }).click()
    await page.waitForTimeout(2000)
  })
} finally {
  await browser.close()
}

console.log(JSON.stringify(results, null, 2))

