import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { healthRouter } from './routes/health.js'
import { messRouter } from './routes/mess.js'
import { notificationsRouter } from './routes/notifications.js'
import { announcementsRouter } from './routes/announcements.js'
import { complaintsRouter } from './routes/complaints.js'
import { laundryRouter } from './routes/laundry.js'
import { eventsRouter } from './routes/events.js'
import { vtopRouter } from './routes/vtop.js'
import { studentsRouter } from './routes/students.js'
import { activityLogsRouter } from './routes/activityLogs.js'
import { entryExitRouter } from './routes/entryExit.js'
import { messAttendanceRouter } from './routes/messAttendance.js'
import { ambulanceRouter } from './routes/ambulance.js'
import { roomServiceRouter } from './routes/roomService.js'
import { attachUser } from './middleware/authn.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: process.env.CORS_ORIGIN || true }))
app.use(express.json())
app.use(attachUser)

app.use('/api', healthRouter)
app.use('/api/mess', messRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/announcements', announcementsRouter)
app.use('/api/complaints', complaintsRouter)
app.use('/api/laundry', laundryRouter)
app.use('/api/events', eventsRouter)
app.use('/api/vtop', vtopRouter)
app.use('/api/students', studentsRouter)
app.use('/api/activity-logs', activityLogsRouter)
app.use('/api/entry-exit', entryExitRouter)
app.use('/api/mess-attendance', messAttendanceRouter)
app.use('/api/ambulance', ambulanceRouter)
app.use('/api/room-service', roomServiceRouter)

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.listen(PORT, () => {
  console.log(`Smart Hostel API listening on http://localhost:${PORT}`)
})
