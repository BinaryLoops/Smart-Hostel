import { Router } from 'express'
import { getMenu, addFeedback } from '../controllers/messController.js'
import { markGoingToMess, messCrowdStatus } from '../controllers/messCrowdController.js'
import { requireAuth } from '../middleware/authn.js'

export const messRouter = Router()

messRouter.get('/menu', getMenu)
messRouter.post('/feedback', addFeedback)
messRouter.post('/going', requireAuth, markGoingToMess)
messRouter.get('/crowd', messCrowdStatus)
