import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getAll = async (req: Request, res: Response) => {
  const services = await prisma.service.findMany()
  res.json(services)
}

export const create = async (req: Request, res: Response) => {
  try {
    const { name, category, price, stock } = req.body
    const service = await prisma.service.create({
      data: { name, category, price: Number(price), stock: Number(stock) }
    })
    res.status(201).json(service)
  } catch {
    res.status(500).json({ message: 'Lỗi server' })
  }
}

export const update = async (req: Request, res: Response) => {
  try {
    const { name, category, price, stock } = req.body
    const service = await prisma.service.update({
      where: { id: Number(req.params.id) },
      data: { name, category, price: Number(price), stock: Number(stock) }
    })
    res.json(service)
  } catch {
    res.status(500).json({ message: 'Lỗi server' })
  }
}

export const remove = async (req: Request, res: Response) => {
  try {
    await prisma.service.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'Đã xóa dịch vụ' })
  } catch {
    res.status(500).json({ message: 'Lỗi server' })
  }
}