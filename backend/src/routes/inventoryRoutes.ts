import express from 'express'
import { authenticate, isAdmin } from '../middleware/auth'
import { getLowStock, updateStock, getAllStock } from '../controllers/inventoryController'

const router = express.Router()

router.get('/', authenticate, isAdmin, getAllStock)
router.get('/low-stock', authenticate, getLowStock)
router.put('/:id/stock', authenticate, isAdmin, updateStock)

export default router