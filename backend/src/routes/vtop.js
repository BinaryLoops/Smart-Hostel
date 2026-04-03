import { Router } from 'express'
import { getVtopStatus, syncVtop, vtopLogin } from '../controllers/vtopController.js'
import { requireAuth } from '../middleware/authn.js'

export const vtopRouter = Router()

vtopRouter.get('/status', requireAuth, getVtopStatus)
vtopRouter.post('/sync', requireAuth, syncVtop)
// Login route must be public to support "VTOP-first sign-in".
vtopRouter.post('/login', vtopLogin)

