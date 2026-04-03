import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'

const POLL_MS = 60 * 1000
const SEED_KEY = 'shp-notifications-seeded'

export function useNotifications(userId) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const unreadCount = useMemo(() => items.filter((n) => !n.readAt).length, [items])

  const refresh = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError('')
    try {
      const res = await api.notifications(userId)
      setItems(res.items || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return
    void refresh()
    const t = window.setInterval(() => void refresh(), POLL_MS)
    return () => window.clearInterval(t)
  }, [refresh, userId])

  useEffect(() => {
    // Seed demo notifications once per browser to make the center useful immediately.
    if (!userId) return
    try {
      if (localStorage.getItem(SEED_KEY)) return
      localStorage.setItem(SEED_KEY, '1')
    } catch {
      return
    }

    void (async () => {
      try {
        const res = await api.notifications(userId)
        if ((res.items || []).length) return
        await api.createNotification(userId, {
          type: 'hostel_fee_due',
          title: 'Hostel fee due soon',
          body: 'Your next installment is due in 3 days. Pay to avoid late fee.',
        })
        await api.createNotification(userId, {
          type: 'mess_change_window_open',
          title: 'Mess change window open',
          body: 'Menu change feedback is open for dinner (next 2 hours).',
        })
        await refresh()
      } catch {
        // ignore seeding errors
      }
    })()
  }, [refresh, userId])

  const markRead = useCallback(
    async (id) => {
      if (!userId) return
      await api.markNotificationRead(userId, id)
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: n.readAt || new Date().toISOString() } : n)))
    },
    [userId]
  )

  const markAllRead = useCallback(async () => {
    if (!userId) return
    await api.markAllNotificationsRead(userId)
    const ts = new Date().toISOString()
    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || ts })))
  }, [userId])

  return { items, unreadCount, loading, error, refresh, markRead, markAllRead }
}

