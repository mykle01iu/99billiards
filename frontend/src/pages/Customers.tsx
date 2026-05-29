import { useState, useEffect } from 'react'
import api from '../services/api'

interface Customer {
  id: number
  name: string
  phone: string
  tier: string
  totalSpent: number
  points: number
  createdAt: string
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers')
      setCustomers(response.data)
    } catch (error) {
      console.error('Lỗi lấy khách hàng:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/customers', form)
      setForm({ name: '', phone: '' })
      setShowForm(false)
      fetchCustomers()
      alert('✅ Thêm khách hàng thành công!')
    } catch (error: any) {
      alert('❌ ' + (error.response?.data?.error || 'Có lỗi xảy ra'))
    } finally {
      setSaving(false)
    }
  }

  const handleUpgradeVIP = async (id: number) => {
    try {
      await api.post(`/customers/${id}/vip`)
      fetchCustomers()
      alert('✅ Nâng cấp VIP thành công!')
    } catch {
      alert('❌ Có lỗi xảy ra')
    }
  }

  const handleAddPoints = async (id: number, points: number) => {
    try {
      await api.post(`/customers/${id}/points`, { points })
      fetchCustomers()
      alert('✅ Thêm điểm thành công!')
    } catch {
      alert('❌ Có lỗi xảy ra')
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#1a3d1f' }}>Khách hàng VIP</h2>
          <p className="text-gray-500 text-sm mt-1">Quản lý thành viên và điểm thưởng</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: '#1a5c2e' }}
        >
          + Thêm khách
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddCustomer} className="p-6 rounded-xl border bg-gray-50 space-y-4">
          <input
            type="text"
            placeholder="Họ tên"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
            className="w-full p-3 border rounded-xl text-sm"
          />
          <input
            type="phone"
            placeholder="Số điện thoại"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            required
            className="w-full p-3 border rounded-xl text-sm"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 rounded-xl font-semibold text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#1a5c2e' }}
            >
              {saving ? 'Đang lưu...' : 'Thêm khách'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 rounded-xl font-semibold text-sm border"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">⏳ Đang tải dữ liệu...</div>
      ) : (
        <div className="grid gap-4">
          {customers.map(customer => (
            <div key={customer.id} className="p-4 rounded-xl border hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-lg">{customer.name}</span>
                    {customer.tier === 'vip' && <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">👑 VIP</span>}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📱 {customer.phone}</p>
                    <p>💰 Đã chi: {customer.totalSpent.toLocaleString()}đ</p>
                    <p>⭐ Điểm: {customer.points}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {customer.tier !== 'vip' && (
                    <button
                      onClick={() => handleUpgradeVIP(customer.id)}
                      className="px-3 py-2 rounded-lg text-xs font-semibold text-white"
                      style={{ background: '#f5c518', color: '#1a3d1f' }}
                    >
                      Nâng VIP
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const points = prompt('Số điểm cần thêm:')
                      if (points) handleAddPoints(customer.id, parseInt(points))
                    }}
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-white"
                    style={{ background: '#8b5cf6' }}
                  >
                    +Điểm
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
