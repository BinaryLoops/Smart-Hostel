import { Router } from 'express'

export const healthRouter = Router()

healthRouter.get('/health', (req, res) => {
  res.json({ ok: true, service: 'smart-hostel-api', time: new Date().toISOString() })
})
