import { store } from '../store/store.js'

function lateness(actualAt, expectedAt) {
  const a = new Date(actualAt).getTime()
  const e = new Date(expectedAt).getTime()
  if (!Number.isFinite(a) || !Number.isFinite(e)) return 0
  return Math.max(0, Math.round((a - e) / 60000))
}

export async function createEntryExit(req, res) {
  const studentId = req.user?.uid
  const { kind, expectedAt, actualAt } = req.body || {}
  if (!studentId) return res.status(401).json({ message: 'Unauthorized' })
  if (!kind || !['entry', 'exit'].includes(kind)) return res.status(400).json({ message: 'kind invalid' })
  if (!expectedAt || !actualAt) return res.status(400).json({ message: 'expectedAt and actualAt required' })

  const minutesLate = lateness(actualAt, expectedAt)
  const doc = await store.createEntryExitLog({ studentId, kind, expectedAt, actualAt, minutesLate })
  res.status(201).json(doc)
}

export async function listMyEntryExit(req, res) {
  const studentId = req.user?.uid
  if (!studentId) return res.status(401).json({ message: 'Unauthorized' })
  const items = await store.listEntryExitLogs({ studentId })
  res.json({ items })
}

export async function adminListEntryExit(req, res) {
  const items = await store.listEntryExitLogs({})
  res.json({ items })
}

export async function processScannerLog(req, res) {
  // hardware scanner sends this raw payload
  const { studentId, studentName, studentBlock, studentGender, scannedAtBlock, time } = req.body || {}

  if (!studentId || !studentBlock || !scannedAtBlock || !studentGender) {
    return res.status(400).json({ message: 'Missing hardware parameters' })
  }

  const kind = 'entry' // Assuming gate scanner scans entry
  const actualAt = time || new Date().toISOString()
  
  let isRedAlert = false
  let alertReason = ''

  // Strict Hostels constraints
  if (studentBlock !== scannedAtBlock) {
     isRedAlert = true
     alertReason = `Student from Block ${studentBlock} entered unauthorized Block ${scannedAtBlock}.`
     
     const boysBlocks = ['A', 'D1', 'D2', 'E', 'C-Boys']
     const girlsBlocks = ['B', 'C-Girls']

     if (girlsBlocks.includes(studentBlock) && boysBlocks.includes(scannedAtBlock)) {
        alertReason += ' [CRITICAL: Female entering Male Hostel]'
     } else if (boysBlocks.includes(studentBlock) && girlsBlocks.includes(scannedAtBlock)) {
        alertReason += ' [CRITICAL: Male entering Female Hostel]'
     }
  }

  const doc = await store.createEntryExitLog({
    studentId,
    studentName: studentName || 'Unknown Scanner Entity',
    kind,
    studentBlock,
    scannedAtBlock,
    isRedAlert,
    alertReason,
    actualAt,
    expectedAt: actualAt, 
    minutesLate: 0
  })

  if (isRedAlert) {
     await store.createNotification({
       userId: 'admin@gmail.com', // Admin specific alert
       title: 'SECURITY RED ALERT',
       body: alertReason,
       type: 'danger',
       createdAt: actualAt,
       readAt: null
     })
  }

  res.status(201).json(doc)
}

