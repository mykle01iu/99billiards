import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      include: { invoices: true }
    })
    res.json(customers)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' })
  }
}

export const getCustomerByPhone = async (req: Request, res: Response) => {
  const { phone } = req.params

  try {
    const customer = await prisma.customer.findUnique({
      where: { phone: String(phone) },
      include: { invoices: true }
    })

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' })
    }

    res.json(customer)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer' })
  }
}

export const createCustomer = async (req: Request, res: Response) => {
  const { name, phone } = req.body

  if (!name || !phone) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const customer = await prisma.customer.create({
      data: { name, phone }
    })
    res.status(201).json(customer)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Phone number already exists' })
    }
    res.status(500).json({ error: 'Failed to create customer' })
  }
}

export const updateCustomer = async (req: Request, res: Response) => {
  const { id } = req.params
  const { name, tier } = req.body

  try {
    const customer = await prisma.customer.update({
      where: { id: parseInt(String(id)) },
      data: { name, tier }
    })
    res.json(customer)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update customer' })
  }
}

export const addPoints = async (req: Request, res: Response) => {
  const { id } = req.params
  const { points } = req.body

  try {
    const customer = await prisma.customer.update({
      where: { id: parseInt(String(id)) },
      data: { points: { increment: points } }
    })
    res.json(customer)
  } catch (error) {
    res.status(500).json({ error: 'Failed to add points' })
  }
}

export const upgradeToVIP = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const customer = await prisma.customer.update({
      where: { id: parseInt(String(id)) },
      data: { tier: 'vip' }
    })
    res.json(customer)
  } catch (error) {
    res.status(500).json({ error: 'Failed to upgrade customer' })
  }
}
