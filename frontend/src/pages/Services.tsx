import { useEffect, useState } from 'react'
import api from '../services/api'

interface Service { id: number; name: string; category: string; price: number; stock: number }

export default function Services() {
  const [services, setServices] = useState<Service[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'food', price: '', stock: '' })

  const fetchServices = async () => { const res = await api.get('/services'); setServices(res.data) }
  useEffect(() => { fetchServices() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.post('/services', form)
    setForm({ name: '', category: 'food', price: '', stock: '' })
    setShowForm(false); fetchServices()
  }

  const handleDelete = async (id: number) => {
    if (confirm('Xóa dịch vụ này?')) { await api.delete(`/services/${id}`); fetchServices() }
  }

  const categoryLabel: Record<string, string> = { food: '🍔 Đồ ăn', drink: '🥤 Đồ uống', equipment: '🎱 Dụng cụ' }
  const categoryColor: Record<string, string> = { food: '#fef3c7', drink: '#e0f2fe', equipment: '#dcfce7' }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold" style={{ color: '#1a3d1f' }}>Dịch vụ</h2><p className="text-gray-500 text-sm mt-1">Quản lý đồ ăn, thức uống và dụng cụ</p></div>
        <button onClick={() => setShowForm(!showForm)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#1a5c2e' }}>+ Thêm dịch vụ</button>
      </div>
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-4" style={{ color: '#1a3d1f' }}>Thêm dịch vụ mới</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4">
            <input placeholder="Tên dịch vụ" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border rounded-xl px-4 py-2.5 text-sm outline-none" required />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="border rounded-xl px-4 py-2.5 text-sm outline-none">
              <option value="food">🍔 Đồ ăn</option>
              <option value="drink">🥤 Đồ uống</option>
              <option value="equipment">🎱 Dụng cụ</option>
            </select>
            <input placeholder="Giá (VNĐ)" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="border rounded-xl px-4 py-2.5 text-sm outline-none" required />
            <input placeholder="Tồn kho" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="border rounded-xl px-4 py-2.5 text-sm outline-none" />
            <div className="col-span-4 flex gap-3">
              <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#1a5c2e' }}>Lưu</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600">Hủy</button>
            </div>
          </form>
        </div>
      )}
      <div className="grid grid-cols-3 gap-5">
        {services.map(service => (
          <div key={service.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: categoryColor[service.category], color: '#374151' }}>{categoryLabel[service.category]}</div>
              <button onClick={() => handleDelete(service.id)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">{service.name}</h3>
            <p className="text-xl font-bold mb-3" style={{ color: '#1a5c2e' }}>{service.price.toLocaleString()}đ</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Tồn kho</span>
              <span className={`font-medium ${service.stock < 5 ? 'text-red-500' : 'text-green-600'}`}>{service.stock} cái</span>
            </div>
          </div>
        ))}
        {services.length === 0 && <p className="col-span-3 text-center text-gray-400 py-12">Chưa có dịch vụ nào</p>}
      </div>
    </div>
  )
}