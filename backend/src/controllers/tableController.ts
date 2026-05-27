import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getAll = async (req: Request, res: Response) => {
  const tables = await prisma.table.findMany()
  res.json(tables)
}

export const getOne = async (req: Request, res: Response) => {
  const table = await prisma.table.findUnique({
    where: { id: Number(req.params.id) }
  })
  if (!table) return res.status(404).json({ message: 'Không tìm thấy' })
  res.json(table)
}

export const create = async (req: Request, res: Response) => {
  try {
    const { name, type, pricePerHour } = req.body
    const table = await prisma.table.create({
      data: { name, type, pricePerHour: Number(pricePerHour) }
    })
    res.status(201).json(table)
  } catch {
    res.status(500).json({ message: 'Lỗi server' })
  }
}

export const update = async (req: Request, res: Response) => {
  try {
    const { name, type, status, pricePerHour } = req.body
    const table = await prisma.table.update({
      where: { id: Number(req.params.id) },
      data: { name, type, status, pricePerHour: Number(pricePerHour) }
    })
    res.json(table)
  } catch {
    res.status(500).json({ message: 'Lỗi server' })
  }
}

export const remove = async (req: Request, res: Response) => {
  try {
    await prisma.table.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'Đã xóa bàn' })
  } catch {
    res.status(500).json({ message: 'Lỗi server' })
  }
}

export const startSession = async (req: Request, res: Response) => {
  try {
    const tableId = Number(req.params.id)
    const table = await prisma.table.findUnique({ where: { id: tableId } })
    if (!table) return res.status(404).json({ message: 'Không tìm thấy bàn' })
    if (table.status === 'occupied') return res.status(400).json({ message: 'Bàn đang được sử dụng' })

    const session = await prisma.session.create({
      data: { tableId }
    })
    await prisma.table.update({
      where: { id: tableId },
      data: { status: 'occupied' }
    })
    res.status(201).json(session)
  } catch {
    res.status(500).json({ message: 'Lỗi server' })
  }
}

export const endSession = async (req: Request, res: Response) => {
  try {
    const tableId = Number(req.params.id)
    const session = await prisma.session.findFirst({
      where: { tableId, endTime: null },
      include: { table: true }
    })
    if (!session) return res.status(404).json({ message: 'Không có phiên chơi nào đang mở' })

    const endTime = new Date()
    const totalHours = (endTime.getTime() - session.startTime.getTime()) / 3600000
    const tableFee = totalHours * session.table.pricePerHour

    const updated = await prisma.session.update({
      where: { id: session.id },
      data: { endTime, totalHours, tableFee }
    })
    await prisma.table.update({
      where: { id: tableId },
      data: { status: 'available' }
    })
    res.json(updated)
  } catch {
    res.status(500).json({ message: 'Lỗi server' })
  }
}
export const getActiveSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { endTime: null },
      include: { table: true }
    })
    res.json(sessions)
  } catch {
    res.status(500).json({ message: 'Lỗi server' })
  }
}