import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'

const prisma = new PrismaClient()

export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, items, paymentMethod } = req.body
    const session = await prisma.session.findUnique({
      where: { id: Number(sessionId) }
    })
    if (!session) return res.status(404).json({ message: 'Không tìm thấy phiên chơi' })

    let totalAmount = session.tableFee || 0
    const invoiceItems = items.map((item: any) => {
      totalAmount += item.unitPrice * item.quantity
      return {
        serviceId: item.serviceId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }
    })

    const invoice = await prisma.invoice.create({
      data: {
        sessionId: Number(sessionId),
        createdById: req.userId!,
        totalAmount,
        paymentMethod: paymentMethod || 'cash',
        status: 'paid',
        items: { create: invoiceItems }
      },
      include: { items: true }
    })
    res.status(201).json(invoice)
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' })
  }
}

export const getAll = async (req: Request, res: Response) => {
  const invoices = await prisma.invoice.findMany({
    include: { session: { include: { table: true } }, items: { include: { service: true } } }
  })
  res.json(invoices)
}

export const getOne = async (req: Request, res: Response) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: Number(req.params.id) },
    include: { session: { include: { table: true } }, items: { include: { service: true } } }
  })
  if (!invoice) return res.status(404).json({ message: 'Không tìm thấy' })
  res.json(invoice)
}