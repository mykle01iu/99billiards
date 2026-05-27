import { useState, useEffect } from 'react'
import api from '../services/api'

interface Report {
  period: { start: string; end: string }
  totalRevenue: number
  totalInvoices: number
  averagePerInvoice: number
  paymentMethods: { cash: number; transfer: number }
}

export default function Reports() {
  const [reports, setReports] = useState<Report | null>(null)
  const [reportType, setReportType] = useState('revenue')
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchReport()
  }, [reportType, startDate, endDate])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await api.get(`/reports/${reportType}?${params}`)
      setReports(response.data)
    } catch (error) {
      console.error('Lỗi lấy báo cáo:', error)
    } finally {
      setLoading(false)
    }
  }

  const reportTypes = [
    { value: 'revenue', label: '💰 Doanh thu' },
    { value: 'service', label: '🍔 Dịch vụ' },
    { value: 'daily', label: '📅 Ngày hôm nay' },
    { value: 'employee', label: '👥 Nhân viên' }
  ]

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#1a3d1f' }}>Báo cáo & Thống kê</h2>
        <p className="text-gray-500 text-sm mt-1">Phân tích doanh thu và hiệu suất kinh doanh</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {reportTypes.map(type => (
          <button
            key={type.value}
            onClick={() => setReportType(type.value)}
            className="p-4 rounded-xl border-2 transition text-left"
            style={{
              borderColor: reportType === type.value ? '#1a5c2e' : '#e5e7eb',
              background: reportType === type.value ? '#dcfce7' : '#f9fafb'
            }}
          >
            <div className="font-semibold text-sm" style={{ color: '#1a3d1f' }}>{type.label}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="p-3 border rounded-xl text-sm"
          placeholder="Ngày bắt đầu"
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="p-3 border rounded-xl text-sm"
          placeholder="Ngày kết thúc"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">⏳ Đang tải dữ liệu...</div>
      ) : reports ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportType === 'revenue' && (
            <>
              <div className="p-6 rounded-xl border" style={{ background: '#f0fdf4', borderColor: '#1a5c2e' }}>
                <div className="text-sm text-gray-500">Tổng doanh thu</div>
                <div className="text-3xl font-bold mt-2" style={{ color: '#1a5c2e' }}>
                  {reports.totalRevenue?.toLocaleString()}đ
                </div>
              </div>
              <div className="p-6 rounded-xl border" style={{ background: '#fef3c7', borderColor: '#f5c518' }}>
                <div className="text-sm text-gray-500">Số hóa đơn</div>
                <div className="text-3xl font-bold mt-2" style={{ color: '#f59e0b' }}>
                  {reports.totalInvoices}
                </div>
              </div>
              <div className="p-6 rounded-xl border" style={{ background: '#f3e8ff', borderColor: '#8b5cf6' }}>
                <div className="text-sm text-gray-500">Trung bình/hóa đơn</div>
                <div className="text-3xl font-bold mt-2" style={{ color: '#8b5cf6' }}>
                  {reports.averagePerInvoice?.toLocaleString()}đ
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-blue-50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">💵 Tiền mặt</span>
                    <span className="font-bold" style={{ color: '#3b82f6' }}>
                      {reports.paymentMethods?.cash?.toLocaleString()}đ
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-purple-50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">💳 Chuyển khoản</span>
                    <span className="font-bold" style={{ color: '#8b5cf6' }}>
                      {reports.paymentMethods?.transfer?.toLocaleString()}đ
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
          {reportType === 'daily' && (
            <div className="col-span-2 p-6 rounded-xl bg-gray-50 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-600 mb-3">Doanh thu theo giờ</h3>
                <div className="space-y-2">
                  {Object.entries(reports as any).filter(([k]) => k.startsWith('timeSlots')).map(([_, slot]: any) => (
                    <div key={slot} className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span>{slot}</span>
                      <div>
                        <span className="font-bold">{(slot as any).revenue?.toLocaleString()}đ</span>
                        <span className="text-xs text-gray-500 ml-2">({(slot as any).invoices} hóa đơn)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
