import { Router } from 'express'
import { getAll, getOne, create, update, remove, startSession, endSession, getActiveSessions } from '../controllers/tableController'
import { authenticate, isAdmin } from '../middleware/auth'

const router = Router()

router.use(authenticate)
router.get('/', getAll)
router.get('/active-sessions', getActiveSessions)
router.get('/:id', getOne)
router.post('/', isAdmin, create)
router.put('/:id', isAdmin, update)
router.delete('/:id', isAdmin, remove)
router.post('/:id/start', startSession)
router.post('/:id/end', endSession)

export default router