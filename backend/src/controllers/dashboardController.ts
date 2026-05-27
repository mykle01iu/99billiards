import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getStats = async (req: Request, res: Response) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [totalEmployees, occupiedTables, totalTables, todayInvoices] = await Promise.all([
      prisma.employee.count({ where: { status: 'active' } }),
      prisma.table.count({ where: { status: 'occupied' } }),
      prisma.table.count(),
      prisma.invoice.findMany({
        where: { createdAt: { gte: today }, status: 'paid' }
      })
    ])

    const todayRevenue = todayInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)

    res.json({ totalEmployees, occupiedTables, totalTables, todayRevenue })
  } catch {
    res.status(500).json({ message: 'Lỗi server' })
  }
}