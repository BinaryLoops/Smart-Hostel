import { Router } from 'express'
import { requireAuth } from '../middleware/authn.js'
import { requireAdmin } from '../middleware/authz.js'
import { adminListEntryExit, createEntryExit, listMyEntryExit } from '../controllers/entryExitController.js'

export const entryExitRouter = Router()

entryExitRouter.post('/', requireAuth, createEntryExit)
entryExitRouter.get('/me', requireAuth, listMyEntryExit)
entryExitRouter.get('/', requireAuth, requireAdmin, adminListEntryExit)

