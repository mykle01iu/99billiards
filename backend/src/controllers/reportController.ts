import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getRevenueReport = async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query

  try {
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate as string) : new Date()

    const invoices = await prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end
        },
        status: 'paid'
      },
      include: {
        items: {
          include: { service: true }
        }
      }
    })

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.finalAmount, 0)
    const totalInvoices = invoices.length
    const cashRevenue = invoices
      .filter(inv => inv.paymentMethod === 'cash')
      .reduce((sum, inv) => sum + inv.finalAmount, 0)
    const transferRevenue = invoices
      .filter(inv => inv.paymentMethod === 'transfer')
      .reduce((sum, inv) => sum + inv.finalAmount, 0)

    res.json({
      period: { start, end },
      totalRevenue,
      totalInvoices,
      averagePerInvoice: totalInvoices > 0 ? totalRevenue / totalInvoices : 0,
      paymentMethods: {
        cash: cashRevenue,
        transfer: transferRevenue
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate revenue report' })
  }
}

export const getServiceReport = async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query

  try {
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate as string) : new Date()

    const invoices = await prisma.invoice.findMany({
      where: {
        createdAt: { gte: start, lte: end }
      },
      include: { items: { include: { service: true } } }
    })

    const serviceStats = new Map<number, { name: string; quantity: number; revenue: number }>()

    invoices.forEach(invoice => {
      invoice.items.forEach(item => {
        const existing = serviceStats.get(item.serviceId) || {
          name: item.service.name,
          quantity: 0,
          revenue: 0
        }
        existing.quantity += item.quantity
        existing.revenue += item.unitPrice * item.quantity
        serviceStats.set(item.serviceId, existing)
      })
    })

    const report = Array.from(serviceStats.values())
      .sort((a, b) => b.revenue - a.revenue)

    res.json({ period: { start, end }, services: report })
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate service report' })
  }
}

export const getDailyReport = async (req: Request, res: Response) => {
  const { date } = req.query

  try {
    const selectedDate = date ? new Date(date as string) : new Date()
    selectedDate.setHours(0, 0, 0, 0)
    const nextDay = new Date(selectedDate)
    nextDay.setDate(nextDay.getDate() + 1)

    const invoices = await prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: selectedDate,
          lt: nextDay
        }
      },
      include: {
        items: { include: { service: true } },
        session: { include: { table: true } }
      }
    })

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.finalAmount, 0)
    const totalDiscount = invoices.reduce((sum, inv) => sum + inv.discountAmount, 0)

    const timeSlots = {
      morning: { revenue: 0, invoices: 0 },
      afternoon: { revenue: 0, invoices: 0 },
      evening: { revenue: 0, invoices: 0 },
      night: { revenue: 0, invoices: 0 }
    }

    invoices.forEach(invoice => {
      const hour = invoice.createdAt.getHours()
      let slot = 'evening'
      if (hour < 12) slot = 'morning'
      else if (hour < 17) slot = 'afternoon'
      else if (hour < 22) slot = 'evening'
      else slot = 'night'

      timeSlots[slot as keyof typeof timeSlots].revenue += invoice.finalAmount
      timeSlots[slot as keyof typeof timeSlots].invoices += 1
    })

    res.json({
      date: selectedDate,
      totalRevenue,
      totalDiscount,
      totalInvoices: invoices.length,
      timeSlots
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate daily report' })
  }
}

export const getEmployeeReport = async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query

  try {
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate as string) : new Date()

    const shifts = await prisma.shift.findMany({
      where: {
        clockIn: { gte: start, lte: end },
        clockOut: { not: null }
      },
      include: { employee: true }
    })

    const employeeStats = new Map<number, { name: string; totalHours: number; shiftCount: number }>()

    shifts.forEach(shift => {
      if (shift.clockOut) {
        const hours = (shift.clockOut.getTime() - shift.clockIn.getTime()) / (1000 * 60 * 60)
        const existing = employeeStats.get(shift.employeeId) || {
          name: shift.employee.fullName,
          totalHours: 0,
          shiftCount: 0
        }
        existing.totalHours += hours
        existing.shiftCount += 1
        employeeStats.set(shift.employeeId, existing)
      }
    })

    const report = Array.from(employeeStats.values())
      .sort((a, b) => b.totalHours - a.totalHours)

    res.json({ period: { start, end }, employees: report })
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate employee report' })
  }
}
