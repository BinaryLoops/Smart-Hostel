import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../services/api'

const SIX_HOURS_MS = 6 * 60 * 60 * 1000

function storageKey(userId) {
  return `shp-vtop-sync:${userId || 'anonymous'}`
}

function loadState(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveState(userId, state) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(state))
  } catch {
    // ignore quota / disabled storage
  }
}

export function useVtopSync(userId) {
  const [status, setStatus] = useState(() => loadState(userId) || null)
  const [syncing, setSyncing] = useState(false)
  const lastAutoSyncRef = useRef(null)

  const lastSyncedAt = status?.lastSyncedAt || null
  const lastStatus = status?.lastStatus || 'never'
  const lastError = status?.lastError || null

  const sync = useCallback(async () => {
    if (!userId) return
    setSyncing(true)
    try {
      const res = await api.vtopSync(userId)
      const next = { lastSyncedAt: res.syncedAt, lastStatus: 'success', lastError: null }
      setStatus(next)
      saveState(userId, next)
      return next
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Sync failed'
      const next = { lastSyncedAt: new Date().toISOString(), lastStatus: 'failed', lastError: msg }
      setStatus(next)
      saveState(userId, next)
      return next
    } finally {
      setSyncing(false)
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return

    // Auto-sync once after login (and no more than once per session).
    if (!lastAutoSyncRef.current) {
      lastAutoSyncRef.current = Date.now()
      void sync()
    }
  }, [sync, userId])

  useEffect(() => {
    if (!userId) return

    // Background refresh every 6 hours.
    const t = window.setInterval(() => void sync(), SIX_HOURS_MS)
    return () => window.clearInterval(t)
  }, [sync, userId])

  const label = useMemo(() => {
    if (syncing) return 'Syncing…'
    if (lastStatus === 'success') return 'Synced'
    if (lastStatus === 'failed') return 'Sync failed'
    return 'Not synced'
  }, [lastStatus, syncing])

  return { syncing, lastSyncedAt, lastStatus, lastError, label, sync }
}

