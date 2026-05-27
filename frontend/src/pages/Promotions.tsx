import { useState, useEffect } from 'react'
import api from '../services/api'

interface Promotion {
  id: number
  code: string
  description: string
  discountType: string
  discountValue: number
  minAmount: number
  maxUsage: number
  used: number
  active: boolean
  expireAt: string | null
}

export default function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'percent',
    discountValue: 0,
    minAmount: 0,
    maxUsage: 999,
    expireAt: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      const response = await api.get('/promotions')
      setPromotions(response.data)
    } catch (error) {
      console.error('Lỗi lấy khuyến mại:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePromotion = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/promotions', form)
      setForm({
        code: '',
        description: '',
        discountType: 'percent',
        discountValue: 0,
        minAmount: 0,
        maxUsage: 999,
        expireAt: ''
      })
      setShowForm(false)
      fetchPromotions()
      alert('✅ Tạo khuyến mại thành công!')
    } catch (error: any) {
      alert('❌ ' + (error.response?.data?.error || 'Có lỗi xảy ra'))
    }
  }

  const handleTogglePromotion = async (id: number, active: boolean) => {
    try {
      await api.put(`/promotions/${id}`, { active: !active })
      fetchPromotions()
    } catch {
      alert('❌ Có lỗi xảy ra')
    }
  }

  const handleDeletePromotion = async (id: number) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa?')) return
    try {
      await api.delete(`/promotions/${id}`)
      fetchPromotions()
      alert('✅ Xóa khuyến mại thành công!')
    } catch {
      alert('❌ Có lỗi xảy ra')
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#1a3d1f' }}>Khuyến mại</h2>
          <p className="text-gray-500 text-sm mt-1">Quản lý mã giảm giá và chương trình khuyến mại</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: '#1a5c2e' }}
        >
          + Tạo mã
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreatePromotion} className="p-6 rounded-xl border bg-gray-50 space-y-4">
          <input
            type="text"
            placeholder="Mã khuyến mại (VD: SUMMER2024)"
            value={form.code}
            onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
            required
            className="w-full p-3 border rounded-xl text-sm"
          />
          <input
            type="text"
            placeholder="Mô tả khuyến mại"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            required
            className="w-full p-3 border rounded-xl text-sm"
          />
          <div className="grid grid-cols-2 gap-4">
            <select
              value={form.discountType}
              onChange={e => setForm({ ...form, discountType: e.target.value })}
              className="p-3 border rounded-xl text-sm"
            >
              <option value="percent">% Giảm</option>
              <option value="fixed">Tiền cố định</option>
            </select>
            <input
              type="number"
              placeholder="Giá trị giảm"
              value={form.discountValue}
              onChange={e => setForm({ ...form, discountValue: parseFloat(e.target.value) })}
              required
              className="p-3 border rounded-xl text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Tối thiểu đơn hàng"
              value={form.minAmount}
              onChange={e => setForm({ ...form, minAmount: parseFloat(e.target.value) })}
              className="p-3 border rounded-xl text-sm"
            />
            <input
              type="number"
              placeholder="Số lần dùng tối đa"
              value={form.maxUsage}
              onChange={e => setForm({ ...form, maxUsage: parseInt(e.target.value) })}
              className="p-3 border rounded-xl text-sm"
            />
          </div>
          <input
            type="date"
            value={form.expireAt}
            onChange={e => setForm({ ...form, expireAt: e.target.value })}
            className="w-full p-3 border rounded-xl text-sm"
            placeholder="Ngày hết hạn (tùy chọn)"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl font-semibold text-sm text-white"
              style={{ background: '#1a5c2e' }}
            >
              Tạo mã
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
          {promotions.map(promo => (
            <div
              key={promo.id}
              className="p-4 rounded-xl border hover:shadow-md transition"
              style={{ borderColor: promo.active ? '#1a5c2e' : '#e5e7eb' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-lg font-mono" style={{ color: '#f5c518' }}>
                      {promo.code}
                    </span>
                    {promo.active ? (
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">✅ Hoạt động</span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">❌ Tắt</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{promo.description}</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>
                      💰 Giảm: {promo.discountValue}
                      {promo.discountType === 'percent' ? '%' : 'đ'}
                      {promo.minAmount > 0 && ` (tối thiểu ${promo.minAmount.toLocaleString()}đ)`}
                    </p>
                    <p>📊 Sử dụng: {promo.used}/{promo.maxUsage}</p>
                    {promo.expireAt && <p>📅 Hết hạn: {new Date(promo.expireAt).toLocaleDateString('vi-VN')}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTogglePromotion(promo.id, promo.active)}
                    className="px-3 py-2 rounded-lg text-xs font-semibold"
                    style={{
                      background: promo.active ? '#f3e8ff' : '#dcfce7',
                      color: promo.active ? '#8b5cf6' : '#1a5c2e'
                    }}
                  >
                    {promo.active ? '🔕 Tắt' : '🔔 Bật'}
                  </button>
                  <button
                    onClick={() => handleDeletePromotion(promo.id)}
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-red-600 bg-red-50"
                  >
                    🗑️ Xóa
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
