import { Router } from 'express'
import {
  createAnnouncement,
  listAnnouncements,
  updateAnnouncement,
} from '../controllers/announcementsController.js'
import { requireAuth } from '../middleware/authn.js'
import { requireAdmin } from '../middleware/authz.js'

export const announcementsRouter = Router()

announcementsRouter.get('/', listAnnouncements)
announcementsRouter.post('/', requireAuth, requireAdmin, createAnnouncement)
announcementsRouter.patch('/:id', requireAuth, requireAdmin, updateAnnouncement)

