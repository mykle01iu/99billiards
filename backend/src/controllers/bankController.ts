import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import QRCode from 'qrcode'

const prisma = new PrismaClient()

export const getBankAccounts = async (req: Request, res: Response) => {
  try {
    const accounts = await prisma.bankAccount.findMany()
    res.json(accounts)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bank accounts' })
  }
}

export const createBankAccount = async (req: Request, res: Response) => {
  const { bankName, accountName, accountNumber } = req.body
  if (!bankName || !accountName || !accountNumber) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // Set others to false if this is default
    if (req.body.isDefault) {
      await prisma.bankAccount.updateMany({
        where: {},
        data: { isDefault: false }
      })
    }

    const account = await prisma.bankAccount.create({
      data: {
        bankName,
        accountName,
        accountNumber,
        isDefault: req.body.isDefault || false
      }
    })
    res.status(201).json(account)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create bank account' })
  }
}

export const updateBankAccount = async (req: Request, res: Response) => {
  const { id } = req.params
  const { bankName, accountName, accountNumber, isDefault } = req.body

  try {
    if (isDefault) {
      await prisma.bankAccount.updateMany({
        where: { NOT: { id: parseInt(String(id)) } },
        data: { isDefault: false }
      })
    }

    const account = await prisma.bankAccount.update({
      where: { id: parseInt(String(id)) },
      data: { bankName, accountName, accountNumber, isDefault }
    })
    res.json(account)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bank account' })
  }
}

export const deleteBankAccount = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    await prisma.bankAccount.delete({
      where: { id: parseInt(String(id)) }
    })
    res.json({ message: 'Bank account deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete bank account' })
  }
}

const formatTLV = (id: string, value: string) => `${id}${value.length.toString().padStart(2, '0')}${value}`

const getBankGui = (bankName: string) => {
  const lower = bankName.toLowerCase()
  if (lower.includes('vietcombank')) return 'com.vietcombank'
  if (lower.includes('mb') || lower.includes('mbbank')) return 'com.mbbank'
  if (lower.includes('vietinbank')) return 'com.vietinbank'
  if (lower.includes('acb')) return 'com.acb'
  if (lower.includes('techcombank')) return 'com.techcombank'
  return 'com.vietcombank'
}

const normalizeText = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()

const calculateCRC16 = (payload: string) => {
  let crc = 0xFFFF
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j += 1) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) : (crc << 1)
      crc &= 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

const DEFAULT_QR_BANK = {
  bankName: 'MBBank',
  accountName: 'HOANG DINH KHAI',
  accountNumber: '69999888888866'
}

const buildVietQrPayload = (bankName: string, accountNumber: string, accountName: string, amount: number) => {
  const gui = getBankGui(bankName)
  const account = accountNumber.replace(/\s+/g, '')
  const merchantName = normalizeText(accountName).toUpperCase().slice(0, 25)
  const amountValue = amount > 0 ? amount.toFixed(0) : ''

  let payload = ''
  payload += formatTLV('00', '01')
  payload += formatTLV('01', '12')
  payload += formatTLV('26', formatTLV('00', gui) + formatTLV('01', account))
  payload += formatTLV('52', '0000')
  payload += formatTLV('53', '704')
  if (amountValue) payload += formatTLV('54', amountValue)
  payload += formatTLV('58', 'VN')
  payload += formatTLV('59', merchantName)
  payload += formatTLV('60', 'HANOI')
  payload += formatTLV('63', '0000')

  const crc = calculateCRC16(payload)
  return payload.slice(0, -4) + crc
}

export const generateQRCode = async (req: Request, res: Response) => {
  const { amount } = req.body
  const totalAmount = Number(amount)

  if (!totalAmount || totalAmount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' })
  }

  try {
    const dbBank = await prisma.bankAccount.findFirst({
      where: { isDefault: true }
    })

    const defaultBank = dbBank ?? DEFAULT_QR_BANK

    const qrData = buildVietQrPayload(
      defaultBank.bankName,
      defaultBank.accountNumber,
      defaultBank.accountName,
      totalAmount
    )

    const qrImage = await QRCode.toDataURL(qrData)
    res.json({ qrImage, account: defaultBank })
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' })
  }
}
