import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'

const prisma = new PrismaClient()

export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, items, paymentMethod, promotionCode, customerId } = req.body

    const session = await prisma.session.findUnique({ where: { id: Number(sessionId) } })
    if (!session) return res.status(404).json({ message: 'Không tìm thấy phiên chơi' })

    let totalAmount = session.tableFee || 0
    const invoiceItems = items.map((item: any) => {
      totalAmount += item.unitPrice * item.quantity
      return { serviceId: item.serviceId, quantity: item.quantity, unitPrice: item.unitPrice }
    })

    // Trừ stock tự động
    for (const item of items) {
      await prisma.service.update({
        where: { id: item.serviceId },
        data: { stock: { decrement: item.quantity } }
      })
    }

    // Áp dụng mã giảm giá
    let discountAmount = 0
    let finalAmount = totalAmount
    if (promotionCode) {
      const promo = await prisma.promotion.findUnique({ where: { code: promotionCode.toUpperCase() } })
      if (promo && promo.active && promo.used < promo.maxUsage && totalAmount >= promo.minAmount) {
        if (!promo.expireAt || new Date() <= promo.expireAt) {
          discountAmount = promo.discountType === 'percent'
            ? (totalAmount * promo.discountValue) / 100
            : promo.discountValue
          finalAmount = totalAmount - discountAmount
          await prisma.promotion.update({ where: { id: promo.id }, data: { used: { increment: 1 } } })
        }
      }
    }

    const invoice = await prisma.invoice.create({
      data: {
        sessionId: Number(sessionId),
        createdById: req.userId!,
        customerId: customerId ? Number(customerId) : null,
        totalAmount,
        discountAmount,
        finalAmount,
        promotionCode: promotionCode || null,
        paymentMethod: paymentMethod || 'cash',
        status: 'paid',
        items: { create: invoiceItems }
      },
      include: { items: true }
    })

    // Cộng điểm & totalSpent cho khách hàng thân thiết
    if (customerId) {
      const pts = Math.floor(finalAmount / 10000)
      await prisma.customer.update({
        where: { id: Number(customerId) },
        data: { totalSpent: { increment: finalAmount }, points: { increment: pts } }
      })
    }

    res.status(201).json(invoice)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi server' })
  }
}