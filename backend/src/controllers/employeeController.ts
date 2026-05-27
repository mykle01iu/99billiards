import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getAll = async (req: Request, res: Response) => {
  const employees = await prisma.employee.findMany()
  res.json(employees)
}

export const getOne = async (req: Request, res: Response) => {
  const employee = await prisma.employee.findUnique({ where: { id: Number(req.params.id) } })
  if (!employee) return res.status(404).json({ message: 'Không tìm thấy' })
  res.json(employee)
}

export const create = async (req: Request, res: Response) => {
  try {
    const { fullName, phone, position, baseSalary } = req.body
    const employee = await prisma.employee.create({
      data: { fullName, phone, position, baseSalary: Number(baseSalary) }
    })
    res.status(201).json(employee)
  } catch {
    res.status(500).json({ message: 'Lỗi server' })
  }
}

export const update = async (req: Request, res: Response) => {
  try {
    const { fullName, phone, position, baseSalary, status } = req.body
    const employee = await prisma.employee.update({
      where: { id: Number(req.params.id) },
      data: { fullName, phone, position, baseSalary: Number(baseSalary), status }
    })
    res.json(employee)
  } catch {
    res.status(500).json({ message: 'Lỗi server' })
  }
}

export const remove = async (req: Request, res: Response) => {
  try {
    await prisma.employee.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'Đã xóa nhân viên' })
  } catch {
    res.status(500).json({ message: 'Lỗi server' })
  }
}

export const clockIn = async (req: Request, res: Response) => {
  try {
    const employeeId = Number(req.params.id)
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
    if (!employee) return res.status(404).json({ message: 'Không tìm thấy nhân viên' })

    const activeShift = await prisma.shift.findFirst({ where: { employeeId, clockOut: null } })
    if (activeShift) return res.status(400).json({ message: 'Nhân viên đang trong ca làm' })

    const shift = await prisma.shift.create({ data: { employeeId, clockIn: new Date() } })
    res.status(201).json(shift)
  } catch {
    res.status(500).json({ message: 'Lỗi server' })
  }
}

export const clockOut = async (req: Request, res: Response) => {
  try {
    const employeeId = Number(req.params.id)
    const activeShift = await prisma.shift.findFirst({ where: { employeeId, clockOut: null } })
    if (!activeShift) return res.status(400).json({ message: 'Không có ca làm nào đang mở' })

    const shift = await prisma.shift.update({
      where: { id: activeShift.id },
      data: { clockOut: new Date() }
    })
    res.status(200).json(shift)
  } catch {
    res.status(500).json({ message: 'Lỗi server' })
  }
}

export const getShifts = async (req: Request, res: Response) => {
  try {
    const employeeId = Number(req.params.id)
    const shifts = await prisma.shift.findMany({
      where: { employeeId },
      orderBy: { clockIn: 'desc' },
      take: 10
    })
    res.json(shifts)
  } catch {
    res.status(500).json({ message: 'Lỗi server' })
  }
}