import { Router } from 'express'
import { getAll, create, update, remove } from '../controllers/serviceController'
import { authenticate, isAdmin } from '../middleware/auth'

const router = Router()

router.use(authenticate)
router.get('/', getAll)
router.post('/', isAdmin, create)
router.put('/:id', isAdmin, update)
router.delete('/:id', isAdmin, remove)

export default router