import { Router } from 'express'
import {
  createNotification,
  listNotifications,
  markAllRead,
  markRead,
} from '../controllers/notificationsController.js'

export const notificationsRouter = Router()

notificationsRouter.get('/', listNotifications)
notificationsRouter.post('/', createNotification)
notificationsRouter.post('/read-all', markAllRead)
notificationsRouter.patch('/:id/read', markRead)

