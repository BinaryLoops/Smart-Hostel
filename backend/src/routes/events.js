import { Router } from 'express'
import { createEvent, listEvents, rsvpEvent } from '../controllers/eventsController.js'
import { requireAuth } from '../middleware/authn.js'
import { requireAdmin } from '../middleware/authz.js'

export const eventsRouter = Router()

eventsRouter.get('/', listEvents)
eventsRouter.post('/', requireAuth, requireAdmin, createEvent)
eventsRouter.post('/:id/rsvp', requireAuth, rsvpEvent)

