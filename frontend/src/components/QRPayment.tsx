import { useState, useEffect } from 'react'
import api from '../services/api'

interface QRPaymentProps {
  amount: number
  paymentMethod: string
}

export default function QRPayment({ amount, paymentMethod }: QRPaymentProps) {
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [bankInfo, setBankInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (paymentMethod === 'transfer' && amount > 0) {
      generateQR()
    }
  }, [paymentMethod, amount])

  const generateQR = async () => {
    setLoading(true)
    try {
      const response = await api.post('/bank/generate-qr', { amount })
      setQrImage(response.data.qrImage)
      setBankInfo(response.data.account)
    } catch (error) {
      console.error('Lỗi tạo QR:', error)
    } finally {
      setLoading(false)
    }
  }

  if (paymentMethod !== 'transfer') return null

  return (
    <div className="p-4 rounded-xl mb-4 border-2" style={{ borderColor: '#f5c518', background: '#fffbeb' }}>
      <div className="space-y-4">
        <div>
          <h3 className="font-bold text-sm mb-2" style={{ color: '#1a3d1f' }}>Thông tin chuyển khoản</h3>
          {bankInfo && (
            <div className="text-xs space-y-1" style={{ color: '#4b5563' }}>
              <p><span className="font-semibold">Ngân hàng:</span> {bankInfo.bankName}</p>
              <p><span className="font-semibold">Tên tài khoản:</span> {bankInfo.accountName}</p>
              <p><span className="font-semibold">Số tài khoản:</span> {bankInfo.accountNumber}</p>
              <p><span className="font-semibold">Số tiền:</span> <span style={{ color: '#f59e0b' }}>{amount.toLocaleString()}đ</span></p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-4">
            <div className="text-sm text-gray-500">⏳ Đang tạo mã QR...</div>
          </div>
        ) : qrImage ? (
          <div className="flex flex-col items-center space-y-3 w-full max-w-full mx-auto overflow-hidden">
            <img src={qrImage} alt="QR Code" className="w-full max-w-[280px] h-auto border-2 border-white rounded-lg p-2" style={{ background: '#f3f4f6' }} />
            <p className="text-xs text-center text-gray-600">
              Quét mã QR để thanh toán hoặc nhập thông tin trên
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
