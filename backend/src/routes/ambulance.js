import { Router } from 'express'
import { requireAuth } from '../middleware/authn.js'
import { myAmbulanceRequests, requestAmbulance } from '../controllers/ambulanceController.js'

export const ambulanceRouter = Router()

ambulanceRouter.post('/', requireAuth, requestAmbulance)
ambulanceRouter.get('/me', requireAuth, myAmbulanceRequests)

