import { Router } from 'express'
import { requireAuth } from '../middleware/authn.js'
import {
  listMyMessAttendance,
  markMessAttendance,
  notifyParentForMissedMeals,
} from '../controllers/messAttendanceController.js'

export const messAttendanceRouter = Router()

messAttendanceRouter.post('/', requireAuth, markMessAttendance)
messAttendanceRouter.get('/me', requireAuth, listMyMessAttendance)
messAttendanceRouter.post('/notify-parent', requireAuth, notifyParentForMissedMeals)

