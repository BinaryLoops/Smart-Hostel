import { Router } from 'express'
import { requireAuth } from '../middleware/authn.js'
import { myRoomServiceRequests, requestRoomService } from '../controllers/roomServiceController.js'

export const roomServiceRouter = Router()

roomServiceRouter.post('/', requireAuth, requestRoomService)
roomServiceRouter.get('/me', requireAuth, myRoomServiceRequests)

