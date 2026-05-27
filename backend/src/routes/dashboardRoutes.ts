import { Router } from 'express'
import { getStats } from '../controllers/dashboardController'
import { authenticate } from '../middleware/auth'

const router = Router()
router.use(authenticate)
router.get('/stats', getStats)

export default router