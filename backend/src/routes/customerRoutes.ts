import express from 'express'
import { authenticate, isAdmin } from '../middleware/auth'
import {
  getAllCustomers,
  getCustomerByPhone,
  createCustomer,
  updateCustomer,
  addPoints,
  upgradeToVIP
} from '../controllers/customerController'

const router = express.Router()

router.get('/', authenticate, isAdmin, getAllCustomers)
router.get('/:phone', authenticate, getCustomerByPhone)
router.post('/', authenticate, createCustomer)
router.put('/:id', authenticate, isAdmin, updateCustomer)
router.post('/:id/points', authenticate, isAdmin, addPoints)
router.post('/:id/vip', authenticate, isAdmin, upgradeToVIP)

export default router
