import { store } from '../store/store.js'

function getUserId(req) {
  return req.user?.uid || req.query.userId || req.headers['x-user-id'] || 'anonymous'
}

export async function listNotifications(req, res) {
  const userId = getUserId(req)
  const onlyUnread = String(req.query.unread || 'false') === 'true'
  const items = await store.listNotifications(userId, { unreadOnly: onlyUnread })
  res.json({ userId, items })
}

export async function createNotification(req, res) {
  const userId = req.body?.userId || getUserId(req)
  const { type, title, body, data } = req.body || {}

  if (!type) return res.status(400).json({ message: 'type is required' })

  const n = await store.createNotification({
    userId,
    type,
    title: title || type,
    body: body || '',
    data: data || {},
    readAt: null,
  })
  res.status(201).json(n)
}

export async function markRead(req, res) {
  const userId = getUserId(req)
  const id = req.params.id
  const n = await store.markNotificationRead(userId, id)
  if (!n) return res.status(404).json({ message: 'Notification not found' })
  res.json(n)
}

export async function markAllRead(req, res) {
  const userId = getUserId(req)
  const result = await store.markAllNotificationsRead(userId)
  res.json({ ...result, userId })
}

