import admin from 'firebase-admin'

let app = null
let db = null

export function firebaseEnabled() {
  // This is intentionally simple: if you set a project id, we try to use ADC.
  // For local dev, set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON.
  return Boolean(process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT)
}

export function getAdminDb() {
  if (!firebaseEnabled()) return null
  if (db) return db

  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT
    const saJsonRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    const saJson = typeof saJsonRaw === 'string' ? saJsonRaw.trim() : ''

    let credential = admin.credential.applicationDefault()
    if (saJson) {
      try {
        credential = admin.credential.cert(JSON.parse(saJson))
      } catch {
        // If placeholder/invalid JSON is set, fall back to ADC instead of crashing.
        credential = admin.credential.applicationDefault()
      }
    }

    admin.initializeApp({
      credential,
      projectId,
    })
  }

  app = admin.app()
  db = admin.firestore()
  return db
}

export function getAdminAuth() {
  if (!firebaseEnabled()) return null
  if (!admin.apps.length) getAdminDb()
  return admin.auth()
}

