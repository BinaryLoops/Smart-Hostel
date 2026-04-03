import { Router } from 'express'
import {
  createLaundryBooking,
  laundryAnalytics,
  listLaundryBookings,
} from '../controllers/laundryController.js'
import { requireAuth } from '../middleware/authn.js'
import { requireAdmin } from '../middleware/authz.js'

export const laundryRouter = Router()

laundryRouter.get('/bookings', requireAuth, listLaundryBookings)
laundryRouter.post('/bookings', requireAuth, createLaundryBooking)
laundryRouter.get('/analytics', requireAuth, requireAdmin, laundryAnalytics)

