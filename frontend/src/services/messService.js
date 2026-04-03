import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore'
import { db, firebaseReady } from '../config/firebase'

const LOCAL_KEY = 'shp-mess-feedback'

function localList() {
  try {
    let list = JSON.parse(localStorage.getItem(LOCAL_KEY))
    if (!list || list.length === 0) {
       list = [
         { id: '1', rating: 5, meal: 'breakfast', comment: 'Idli was really good today', createdAt: new Date().toISOString() },
         { id: '2', rating: 2, meal: 'lunch', comment: 'Rajma was too spicy', createdAt: new Date(Date.now() - 86400000).toISOString() },
         { id: '3', rating: 4, meal: 'dinner', comment: 'Paneer curry was decent', createdAt: new Date(Date.now() - 172800000).toISOString() },
         { id: '4', rating: 5, meal: 'lunch', comment: 'Healthy salad', createdAt: new Date(Date.now() - 259200000).toISOString() },
       ]
       localStorage.setItem(LOCAL_KEY, JSON.stringify(list))
    }
    return list
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
