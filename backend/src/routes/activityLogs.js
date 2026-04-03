import { Router } from 'express'
import { requireAdmin } from '../middleware/authz.js'
import { requireAuth } from '../middleware/authn.js'
import { createActivityLog, listActivityLogs } from '../controllers/activityLogsController.js'

export const activityLogsRouter = Router()

// Students can submit their own logs (late entry/activity).
activityLogsRouter.post('/', requireAuth, createActivityLog)

// Admin can view all logs (filterable).
activityLogsRouter.get('/', requireAuth, requireAdmin, listActivityLogs)

