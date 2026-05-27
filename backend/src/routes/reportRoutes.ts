import express from 'express'
import { authenticate, isAdmin } from '../middleware/auth'
import {
  getRevenueReport,
  getServiceReport,
  getDailyReport,
  getEmployeeReport,
  getRevenueByDay,
  getTopTables,
  getPeakHours,
  getInvoicesByDate
} from '../controllers/reportController'

const router = express.Router()

router.get('/revenue', authenticate, isAdmin, getRevenueReport)
router.get('/service', authenticate, isAdmin, getServiceReport)
router.get('/daily', authenticate, isAdmin, getDailyReport)
router.get('/employee', authenticate, isAdmin, getEmployeeReport)

// Routes mới cho Statistics nâng cao
router.get('/revenue-by-day', authenticate, isAdmin, getRevenueByDay)
router.get('/top-tables', authenticate, isAdmin, getTopTables)
router.get('/peak-hours', authenticate, isAdmin, getPeakHours)
router.get('/invoices-by-date', authenticate, isAdmin, getInvoicesByDate)

export default router
