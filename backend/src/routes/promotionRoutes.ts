import express from 'express'
import { authenticate, isAdmin } from '../middleware/auth'
import {
  getAllPromotions,
  createPromotion,
  applyPromotion,
  updatePromotion,
  deletePromotion
} from '../controllers/promotionController'

const router = express.Router()

router.get('/', authenticate, getAllPromotions)
router.post('/', authenticate, isAdmin, createPromotion)
router.post('/apply', authenticate, applyPromotion)
router.put('/:id', authenticate, isAdmin, updatePromotion)
router.delete('/:id', authenticate, isAdmin, deletePromotion)

export default router
