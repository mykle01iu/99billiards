import { Router } from 'express'
import { createInvoice, getAll, getOne } from '../controllers/invoiceController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(authenticate)
router.get('/', getAll)
router.get('/:id', getOne)
router.post('/', createInvoice)

export default router