import { Router } from 'express'
import { requireAdmin } from '../middleware/authz.js'
import { requireAuth } from '../middleware/authn.js'
import { listStudents, myStudentRecord, upsertStudent } from '../controllers/studentsController.js'

export const studentsRouter = Router()

// Student self-service (privacy): only their own record.
studentsRouter.get('/me', requireAuth, myStudentRecord)

// Admin operations
studentsRouter.get('/', requireAuth, requireAdmin, listStudents)
studentsRouter.post('/', requireAuth, requireAdmin, upsertStudent)

