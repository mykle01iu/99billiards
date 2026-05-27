import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body
    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing) return res.status(400).json({ message: 'Username đã tồn tại' })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { username, passwordHash, role: role || 'staff' }
    })
    res.status(201).json({ message: 'Tạo tài khoản thành công', userId: user.id })
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) return res.status(400).json({ message: 'Sai tài khoản hoặc mật khẩu' })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(400).json({ message: 'Sai tài khoản hoặc mật khẩu' })

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    )
    res.json({ token, role: user.role, userId: user.id })
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' })
  }
}