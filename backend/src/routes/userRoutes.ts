import express from 'express'
import { authenticate, isAdmin } from '../middleware/auth'
import { getAllUsers, createUser, changePassword, updateRole, deleteUser } from '../controllers/userController'

const router = express.Router()

router.get('/', authenticate, isAdmin, getAllUsers)
router.post('/', authenticate, isAdmin, createUser)
router.put('/:id/password', authenticate, isAdmin, changePassword)
router.put('/:id/role', authenticate, isAdmin, updateRole)
router.delete('/:id', authenticate, isAdmin, deleteUser)

export default router