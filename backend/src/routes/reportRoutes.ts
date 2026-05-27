import express from 'express'
import { authenticate, isAdmin } from '../middleware/auth'
import {
  getRevenueReport,
  getServiceReport,
  getDailyReport,
  getEmployeeReport
} from '../controllers/reportController'

const router = express.Router()

router.get('/revenue', authenticate, isAdmin, getRevenueReport)
router.get('/service', authenticate, isAdmin, getServiceReport)
router.get('/daily', authenticate, isAdmin, getDailyReport)
router.get('/employee', authenticate, isAdmin, getEmployeeReport)

export default router
