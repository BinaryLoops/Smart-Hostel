import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore'
import { db, firebaseReady } from '../config/firebase'

const LOCAL_KEY = 'shp-mess-feedback'

function localList() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
  } catch {
    return []
  }
}

function localPush(entry) {
  const list = localList()
  list.unshift({ ...entry, id: `local-${Date.now()}`, createdAt: new Date().toISOString() })
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, 200)))
}

export async function submitMessFeedback(data) {
  if (!firebaseReady || !db) {
    localPush(data)
    return { id: 'local' }
  }
  const ref = await addDoc(collection(db, 'messFeedback'), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return { id: ref.id }
}

export async function listMessFeedback() {
  if (!firebaseReady || !db) {
    return localList()
  }
  const snap = await getDocs(collection(db, 'messFeedback'))
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() ?? (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0)
      const tb = b.createdAt?.toMillis?.() ?? (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0)
      return tb - ta
    })
}
