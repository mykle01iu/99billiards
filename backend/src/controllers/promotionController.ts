import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getAllPromotions = async (req: Request, res: Response) => {
  try {
    const promotions = await prisma.promotion.findMany({
      where: { active: true }
    })
    res.json(promotions)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch promotions' })
  }
}

export const createPromotion = async (req: Request, res: Response) => {
  const { code, description, discountType, discountValue, minAmount, maxUsage, expireAt } = req.body

  if (!code || !description || !discountType || discountValue === undefined) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const promotion = await prisma.promotion.create({
      data: {
        code: code.toUpperCase(),
        description,
        discountType,
        discountValue,
        minAmount: minAmount || 0,
        maxUsage: maxUsage || 999,
        expireAt: expireAt ? new Date(expireAt) : null
      }
    })
    res.status(201).json(promotion)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Promotion code already exists' })
    }
    res.status(500).json({ error: 'Failed to create promotion' })
  }
}

export const applyPromotion = async (req: Request, res: Response) => {
  const { code, totalAmount } = req.body

  try {
    const promotion = await prisma.promotion.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!promotion) {
      return res.status(404).json({ error: 'Promotion not found' })
    }

    if (!promotion.active) {
      return res.status(400).json({ error: 'Promotion is not active' })
    }

    if (promotion.used >= promotion.maxUsage) {
      return res.status(400).json({ error: 'Promotion usage limit exceeded' })
    }

    if (totalAmount < promotion.minAmount) {
      return res.status(400).json({
        error: `Minimum purchase amount is ${promotion.minAmount}`
      })
    }

    if (promotion.expireAt && new Date() > promotion.expireAt) {
      return res.status(400).json({ error: 'Promotion has expired' })
    }

    let discountAmount = 0
    if (promotion.discountType === 'percent') {
      discountAmount = (totalAmount * promotion.discountValue) / 100
    } else {
      discountAmount = promotion.discountValue
    }

    // Increment usage
    await prisma.promotion.update({
      where: { id: promotion.id },
      data: { used: { increment: 1 } }
    })

    res.json({
      promotion,
      discountAmount,
      finalAmount: totalAmount - discountAmount
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to apply promotion' })
  }
}

export const updatePromotion = async (req: Request, res: Response) => {
  const { id } = req.params
  const { description, discountValue, active, expireAt } = req.body

  try {
    const promotion = await prisma.promotion.update({
      where: { id: parseInt(String(id)) },
      data: { description, discountValue, active, expireAt }
    })
    res.json(promotion)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update promotion' })
  }
}

export const deletePromotion = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    await prisma.promotion.delete({
      where: { id: parseInt(String(id)) }
    })
    res.json({ message: 'Promotion deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete promotion' })
  }
}
