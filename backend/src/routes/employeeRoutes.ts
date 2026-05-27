import { Router } from 'express'
import { getAll, getOne, create, update, remove, clockIn, clockOut, getShifts } from '../controllers/employeeController'
import { authenticate, isAdmin } from '../middleware/auth'

const router = Router()

router.use(authenticate)
router.get('/', isAdmin, getAll)
router.get('/:id', isAdmin, getOne)
router.post('/', isAdmin, create)
router.put('/:id', isAdmin, update)
router.delete('/:id', isAdmin, remove)
router.post('/:id/clock-in', clockIn)
router.post('/:id/clock-out', clockOut)
router.get('/:id/shifts', isAdmin, getShifts)

export default router