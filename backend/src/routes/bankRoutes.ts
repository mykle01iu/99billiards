import express from 'express'
import { authenticate, isAdmin } from '../middleware/auth'
import {
  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  generateQRCode
} from '../controllers/bankController'

const router = express.Router()

router.get('/', authenticate, getBankAccounts)
router.post('/', authenticate, isAdmin, createBankAccount)
router.put('/:id', authenticate, isAdmin, updateBankAccount)
router.delete('/:id', authenticate, isAdmin, deleteBankAccount)
router.post('/generate-qr', authenticate, generateQRCode)

export default router
