import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, firebaseReady } from '../config/firebase'
import { api } from '../services/api'

const AuthContext = createContext(null)

const DEMO_USER_KEY = 'shp-demo-user'

function generateRichDemoProfile(email) {
  const genderType = Math.random() > 0.5 ? 'Male' : 'Female'
  let block
  if (genderType === 'Male') {
     const mb = ['A', 'D1', 'D2', 'E', 'C-Boys']
     block = mb[Math.floor(Math.random() * mb.length)]
  } else {
     const gb = ['B', 'C-Girls']
     block = gb[Math.floor(Math.random() * gb.length)]
  }
  
  return {
    role: 'student',
    name: email?.split('@')[0] || 'Guest',
    email,
    gender: genderType,
    block: block,
    roomNumber: `${Math.floor(Math.random()*12)+1}${Math.floor(Math.random()*40)+10}`,
    course: 'CSE Core',
    courseName: 'B.Tech',
    hostelRank: Math.floor(Math.random() * 500) + 1,
    bedType: '2 bed AC',
    regNumber: `20BCE${Math.floor(1000 + Math.random() * 9000)}`
  }
}

function loadDemoUser() {
  try {
    const raw = localStorage.getItem(DEMO_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (uid, email) => {
    if (!firebaseReady || !db) {
      const demo = loadDemoUser()
      setProfile(demo?.profile ?? { role: 'student', name: email?.split('@')[0] ?? 'Guest' })
      return
    }
    const ref = doc(db, 'users', uid)
    try {
      const snap = await getDoc(ref)
      if (snap.exists()) {
        setProfile(snap.data())
      } else {
        const fallback = { role: 'student', name: email?.split('@')[0] ?? 'Student', email }
        await setDoc(ref, fallback)
        setProfile(fallback)
      }
    } catch (err) {
      console.warn("Firebase fetch failed, falling back to local demo profile:", err.message)
      const demo = loadDemoUser()
      let profilePayload = demo?.profile ?? generateRichDemoProfile(email)
      if (email?.includes('admin')) profilePayload = { role: 'admin', name: email.split('@')[0] }
      setProfile(profilePayload)
      // Implicitly push to DB if demo backend is up
      api.adminUpsertStudent(uid, 'admin', { id: uid, ...profilePayload }).catch(()=>null)
    }
  }, [])

  useEffect(() => {
    if (!firebaseReady || !auth) {
      const demo = loadDemoUser()
      if (demo) {
        setUser({ uid: demo.uid, email: demo.email, emailVerified: true })
        setProfile(demo.profile)
      }
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) await fetchProfile(u.uid, u.email)
      else setProfile(null)
      setLoading(false)
    })
    return () => unsub()
  }, [fetchProfile])

  const login = useCallback(
    async (email, password) => {
      if (!firebaseReady || !auth) {
        let role = email.includes('admin') ? 'admin' : 'student'
        const demoProfile = role === 'admin' ? { role: 'admin', name: email.split('@')[0] } : generateRichDemoProfile(email)
        const demo = {
          uid: 'demo-' + email,
          email,
          profile: demoProfile,
        }
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demo))
        setUser({ uid: demo.uid, email, emailVerified: true })
        setProfile(demo.profile)
        api.adminUpsertStudent(demo.uid, 'admin', { id: demo.uid, ...demo.profile }).catch(()=>null)
        return
      }
      await signInWithEmailAndPassword(auth, email, password)
    },
    []
  )

  const signup = useCallback(
    async (email, password, name, role = 'student') => {
      if (!firebaseReady || !auth || !db) {
        const demoProfile = role === 'admin' ? { role: 'admin', name } : { ...generateRichDemoProfile(email), name, role }
        const demo = {
          uid: 'demo-' + email,
          email,
          profile: demoProfile,
        }
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demo))
        setUser({ uid: demo.uid, email, emailVerified: true })
        setProfile(demo.profile)
        api.adminUpsertStudent(demo.uid, 'admin', { id: demo.uid, ...demo.profile }).catch(()=>null)
        return
      }
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await setDoc(doc(db, 'users', cred.user.uid), {
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
      })
      await fetchProfile(cred.user.uid, email)
    },
    [fetchProfile]
  )

  const loginWithVtop = useCallback(async (username, password) => {
    // Direct VTOP auth happens in backend. Credentials are used per-request only.
    const result = await api.syncVtop({ username, password })
    if (!result?.ok) throw new Error(result?.message || result?.code || 'VTOP login failed')

    if (firebaseReady && auth && result.customToken) {
      await signInWithCustomToken(auth, result.customToken)
      return
    }

    // Fallback only for non-Firebase local demo mode
    if (!firebaseReady || !auth) {
        const demoProfile = generateRichDemoProfile(`${username}@vtop.local`)
        demoProfile.name = username
        const demo = {
          uid: username,
          email: `${username}@vtop.local`,
          profile: demoProfile,
        }
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demo))
        setUser({ uid: demo.uid, email: demo.email, emailVerified: true })
        setProfile(demo.profile)
        api.adminUpsertStudent(demo.uid, 'admin', { id: demo.uid, ...demo.profile }).catch(()=>null)
    }
  }, [])

  const logout = useCallback(async () => {
    localStorage.removeItem(DEMO_USER_KEY)
    if (firebaseReady && auth) await signOut(auth)
    setUser(null)
    setProfile(null)
  }, [])

  const loginWithGoogle = useCallback(async () => {
    if (!firebaseReady || !auth) {
      const demoProfile = generateRichDemoProfile('demo.google@example.com')
      demoProfile.name = 'Google Demo User'
      const demo = {
        uid: 'demo-google',
        email: 'demo.google@example.com',
        profile: demoProfile,
      }
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demo))
      setUser({ uid: demo.uid, email: demo.email, emailVerified: true })
      setProfile(demo.profile)
      api.adminUpsertStudent(demo.uid, 'admin', { id: demo.uid, ...demo.profile }).catch(()=>null)
      return
    }
    const provider = new GoogleAuthProvider()
    const cred = await signInWithPopup(auth, provider)
    await fetchProfile(cred.user.uid, cred.user.email)
  }, [fetchProfile])

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      firebaseReady,
      demoMode: !firebaseReady,
      login,
      loginWithGoogle,
      loginWithVtop,
      signup,
      logout,
      isAdmin: profile?.role === 'admin',
    }),
    [user, profile, loading, login, loginWithGoogle, loginWithVtop, signup, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
