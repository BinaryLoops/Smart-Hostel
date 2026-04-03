import { Router } from 'express'
import {
  complaintAnalytics,
  createComplaint,
  resolveComplaint,
} from '../controllers/complaintsController.js'
import { requireAuth } from '../middleware/authn.js'
import { requireAdmin } from '../middleware/authz.js'

export const complaintsRouter = Router()

complaintsRouter.post('/', requireAuth, createComplaint)
complaintsRouter.patch('/:id/resolve', requireAuth, requireAdmin, resolveComplaint)
complaintsRouter.get('/analytics', requireAuth, requireAdmin, complaintAnalytics)

