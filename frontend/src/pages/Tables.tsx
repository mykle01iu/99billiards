import { useEffect, useState, useCallback } from 'react'
import api from '../services/api'

interface Table { id: number; name: string; type: string; status: string; pricePerHour: number }
interface Session { id: number; tableId: number; startTime: string; table: Table }
interface Service { id: number; name: string; category: string; price: number; stock: number }
interface OrderItem { serviceId: number; name: string; price: number; quantity: number }

export default function Tables() {
  const [tables, setTables] = useState<Table[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'standard', pricePerHour: '' })
  const [now, setNow] = useState(new Date())
  const [invoiceModal, setInvoiceModal] = useState(false)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState('cash')

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const [t, s, sv] = await Promise.all([api.get('/tables'), api.get('/tables/active-sessions'), api.get('/services')])
      setTables(t.data); setSessions(s.data); setServices(sv.data)
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [fetchData])

  const getSession = (tableId: number) => sessions.find(s => s.tableId === tableId)

  const getElapsed = (startTime: string) => {
    const diff = now.getTime() - new Date(startTime).getTime()
    const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const getEstimatedFee = (startTime: string, pricePerHour: number) => {
    const hours = (now.getTime() - new Date(startTime).getTime()) / 3600000
    return Math.round(hours * pricePerHour)
  }

  const handleStart = async (id: number) => {
    try {
      await api.post(`/tables/${id}/start`)
      fetchData()
    } catch (error: any) {
      alert('❌ ' + (error.response?.data?.message || 'Không thể bắt đầu ca chơi'))
    }
  }

  const openInvoiceModal = (table: Table) => {
    const session = getSession(table.id)
    if (!session) return
    setSelectedTable(table); setSelectedSession(session); setOrderItems([]); setInvoiceModal(true)
  }

  const addItem = (service: Service) => {
    setOrderItems(prev => {
      const existing = prev.find(i => i.serviceId === service.id)
      if (existing) return prev.map(i => i.serviceId === service.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { serviceId: service.id, name: service.name, price: service.price, quantity: 1 }]
    })
  }

  const removeItem = (serviceId: number) => {
    setOrderItems(prev => {
      const existing = prev.find(i => i.serviceId === serviceId)
      if (existing && existing.quantity > 1) return prev.map(i => i.serviceId === serviceId ? { ...i, quantity: i.quantity - 1 } : i)
      return prev.filter(i => i.serviceId !== serviceId)
    })
  }

  const getTotalBill = () => {
    if (!selectedTable || !selectedSession) return 0
    return getEstimatedFee(selectedSession.startTime, selectedTable.pricePerHour) + orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  }

  const getQRUrl = (amount: number) => {
    return `https://img.vietqr.io/image/MB-69999888888866-qr_only.png?amount=${amount}&addInfo=99Billiards thanh toan ban&accountName=HOANG DINH KHAI`
  }

  const handleCheckout = async () => {
    if (!selectedSession) return
    try {
      await api.post(`/tables/${selectedTable!.id}/end`)
      await api.post('/invoices', {
        sessionId: selectedSession.id, paymentMethod,
        items: orderItems.map(i => ({ serviceId: i.serviceId, quantity: i.quantity, unitPrice: i.price }))
      })
      alert('✅ Thanh toán thành công!')
      setInvoiceModal(false)
      setOrderItems([])
      setPaymentMethod('cash')
      fetchData()
    } catch (error: any) {
      alert('❌ ' + (error.response?.data?.message || error.message || 'Có lỗi xảy ra'))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.pricePerHour) {
      alert('❌ Vui lòng điền đầy đủ thông tin')
      return
    }
    try {
      await api.post('/tables', form)
      setForm({ name: '', type: 'standard', pricePerHour: '' })
      setShowForm(false)
      fetchData()
      alert('✅ Thêm bàn thành công!')
    } catch (error: any) {
      alert('❌ ' + (error.response?.data?.message || 'Không thể thêm bàn'))
    }
  }

  const categoryLabel: Record<string, string> = { food: '🍔', drink: '🥤', equipment: '🎱' }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold" style={{ color: '#1a3d1f' }}>Bàn chơi</h2><p className="text-gray-500 text-sm mt-1">Quản lý và theo dõi realtime</p></div>
        <button onClick={() => setShowForm(!showForm)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#1a5c2e' }}>+ Thêm bàn</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: '🟢', label: 'Bàn trống', value: tables.filter(t => t.status === 'available').length, color: '#dcfce7', text: '#1a5c2e' },
          { icon: '🔴', label: 'Đang chơi', value: tables.filter(t => t.status === 'occupied').length, color: '#fef3c7', text: '#b45309' },
          { icon: '📊', label: 'Tổng số bàn', value: tables.length, color: '#e0f2fe', text: '#0369a1' },
        ].map(item => (
          <div key={item.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: item.color }}>{item.icon}</div>
            <div><p className="text-2xl font-bold" style={{ color: item.text }}>{item.value}</p><p className="text-sm text-gray-500">{item.label}</p></div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
            <input placeholder="Tên bàn" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border rounded-xl px-4 py-2.5 text-sm outline-none" required />
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="border rounded-xl px-4 py-2.5 text-sm outline-none">
              <option value="standard">Standard</option><option value="vip">VIP</option>
            </select>
            <input placeholder="Giá/giờ" type="number" value={form.pricePerHour} onChange={e => setForm({ ...form, pricePerHour: e.target.value })} className="border rounded-xl px-4 py-2.5 text-sm outline-none" required />
            <div className="col-span-3 flex gap-3">
              <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#1a5c2e' }}>Lưu</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600">Hủy</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-4 gap-5">
        {tables.map(table => {
          const session = getSession(table.id)
          return (
            <div key={table.id} className="bg-white rounded-2xl p-5 shadow-sm border-2 transition" style={{ borderColor: table.status === 'occupied' ? '#f5c518' : '#e5e7eb' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: table.type === 'vip' ? '#fef3c7' : '#f3f4f6', color: table.type === 'vip' ? '#b45309' : '#6b7280' }}>
                  {table.type === 'vip' ? '⭐ VIP' : 'Standard'}
                </span>
                <div className="w-3 h-3 rounded-full" style={{ background: table.status === 'occupied' ? '#f5c518' : '#22c55e' }}></div>
              </div>
              <h3 className="font-bold text-lg mb-1 text-gray-800">{table.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{table.pricePerHour.toLocaleString()}đ/giờ</p>
              {session ? (
                <div className="mb-3 p-3 rounded-xl" style={{ background: '#fffbeb' }}>
                  <div className="text-2xl font-mono font-bold text-center mb-1" style={{ color: '#b45309' }}>{getElapsed(session.startTime)}</div>
                  <div className="text-center text-sm font-semibold" style={{ color: '#1a5c2e' }}>~{getEstimatedFee(session.startTime, table.pricePerHour).toLocaleString()}đ</div>
                </div>
              ) : (
                <div className="mb-3 p-3 rounded-xl text-center text-sm text-gray-400" style={{ background: '#f9fafb' }}>Chờ khách</div>
              )}
              {table.status === 'available' ? (
                <button onClick={() => handleStart(table.id)} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#1a5c2e' }}>▶ Bắt đầu</button>
              ) : (
                <button onClick={() => openInvoiceModal(table)} className="w-full py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#f5c518', color: '#1a3d1f' }}>🧾 Thanh toán</button>
              )}
            </div>
          )
        })}
        {tables.length === 0 && <div className="col-span-4 text-center py-12"><div className="text-5xl mb-3">🎱</div><p className="text-gray-400">Chưa có bàn nào</p></div>}
      </div>

      {invoiceModal && selectedTable && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-screen overflow-y-auto">
            <div className="p-6 text-white" style={{ background: '#1a5c2e' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">🧾 Thanh toán — {selectedTable.name}</h3>
                  <p className="text-green-200 text-sm mt-1">Thời gian: {getElapsed(selectedSession.startTime)}</p>
                </div>
                <button onClick={() => setInvoiceModal(false)} className="text-white/70 hover:text-white text-2xl">✕</button>
              </div>
            </div>
            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Thêm dịch vụ</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {services.map(service => (
                    <div key={service.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-green-200 transition">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{categoryLabel[service.category]} {service.name}</p>
                        <p className="text-xs text-gray-400">{service.price.toLocaleString()}đ</p>
                      </div>
                      <button onClick={() => addItem(service)} className="w-8 h-8 rounded-lg text-white text-lg font-bold flex items-center justify-center" style={{ background: '#1a5c2e' }}>+</button>
                    </div>
                  ))}
                  {services.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Chưa có dịch vụ nào</p>}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Hóa đơn</h4>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between p-3 rounded-xl" style={{ background: '#f9fafb' }}>
                    <span className="text-sm text-gray-600">🎱 {selectedTable.name}</span>
                    <span className="text-sm font-semibold">{getEstimatedFee(selectedSession.startTime, selectedTable.pricePerHour).toLocaleString()}đ</span>
                  </div>
                  {orderItems.map(item => (
                    <div key={item.serviceId} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#f9fafb' }}>
                      <span className="text-sm text-gray-600">{item.name} x{item.quantity}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{(item.price * item.quantity).toLocaleString()}đ</span>
                        <button onClick={() => removeItem(item.serviceId)} className="w-6 h-6 rounded-full bg-red-100 text-red-500 text-xs font-bold">−</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-xl mb-4" style={{ background: '#dcfce7' }}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold" style={{ color: '#1a3d1f' }}>Tổng cộng</span>
                    <span className="text-2xl font-bold" style={{ color: '#1a5c2e' }}>{getTotalBill().toLocaleString()}đ</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[{ value: 'cash', label: '💵 Tiền mặt' }, { value: 'transfer', label: '💳 Chuyển khoản' }].map(m => (
                    <button key={m.value} onClick={() => setPaymentMethod(m.value)} className="py-2.5 rounded-xl text-sm font-medium border-2 transition"
                      style={{ borderColor: paymentMethod === m.value ? '#1a5c2e' : '#e5e7eb', background: paymentMethod === m.value ? '#dcfce7' : 'white', color: paymentMethod === m.value ? '#1a5c2e' : '#6b7280' }}>
                      {m.label}
                    </button>
                  ))}
                </div>
                {paymentMethod === 'transfer' && (
                  <div className="p-4 rounded-xl border-2 text-center" style={{ borderColor: '#f5c518' }}>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Quét QR để thanh toán</p>
                    <img
                      src={getQRUrl(getTotalBill())}
                      alt="QR thanh toán"
                      className="w-48 h-48 mx-auto rounded-xl"
                    />
                    <p className="text-xs text-gray-500 mt-2">MB Bank • HOANG DINH KHAI</p>
                    <p className="text-xs text-gray-500">69999888888866</p>
                    <p className="font-bold mt-1" style={{ color: '#1a5c2e' }}>{getTotalBill().toLocaleString()}đ</p>
                  </div>
                )}
                <button onClick={handleCheckout} className="w-full py-3 rounded-xl font-bold text-sm" style={{ background: '#f5c518', color: '#1a3d1f' }}>✅ Xác nhận thanh toán</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}