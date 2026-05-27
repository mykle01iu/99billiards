import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import authRoutes from './routes/authRoutes'
import employeeRoutes from './routes/employeeRoutes'
import tableRoutes from './routes/tableRoutes'
import serviceRoutes from './routes/serviceRoutes'
import invoiceRoutes from './routes/invoiceRoutes'
import dashboardRoutes from './routes/dashboardRoutes'
import bankRoutes from './routes/bankRoutes'
import customerRoutes from './routes/customerRoutes'
import promotionRoutes from './routes/promotionRoutes'
import reportRoutes from './routes/reportRoutes'


dotenv.config()

const prisma = new PrismaClient()
const app = express()
const PORT = process.env.PORT || 3000

async function seedDefaultUsers() {
    const admin = await prisma.user.findFirst({ where: { role: 'admin' } })
    if (!admin) {
        const passwordHash = await bcrypt.hash('123456', 10)
        await prisma.user.create({ data: { username: 'admin', passwordHash, role: 'admin' } })
        console.log('Tạo user mặc định: admin / 123456')
    }

    const staff = await prisma.user.findUnique({ where: { username: 'staff' } })
    if (!staff) {
        const passwordHash = await bcrypt.hash('123456', 10)
        await prisma.user.create({ data: { username: 'staff', passwordHash, role: 'staff' } })
        console.log('Tạo user mặc định: staff / 123456')
    }

    const bank = await prisma.bankAccount.findFirst()
    if (!bank) {
        await prisma.bankAccount.create({
            data: {
                bankName: 'Vietcombank',
                accountName: '99 BILLIARDS',
                accountNumber: '1234567890',
                isDefault: true
            }
        })
        console.log('Tạo tài khoản ngân hàng mặc định')
    }
}

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/employees', employeeRoutes)
app.use('/api/tables', tableRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/invoices', invoiceRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/bank', bankRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/promotions', promotionRoutes)
app.use('/api/reports', reportRoutes)

app.get('/', (req, res) => {
    res.json({ message: '99Billiards API is running!' })
})

seedDefaultUsers().catch(error => {
    console.error('Lỗi tạo user mặc định:', error)
})

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`)
})

export default app