import { useEffect, useState } from 'react'
import api from '../services/api'

interface Employee { id: number; fullName: string; phone: string; position: string; baseSalary: number; status: string }
interface Shift { id: number; clockIn: string; clockOut: string | null }

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ fullName: '', phone: '', position: '', baseSalary: '' })
  const [saving, setSaving] = useState(false)
  const [activeShifts, setActiveShifts] = useState<Record<number, boolean>>({})
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null)
  const [shifts, setShifts] = useState<Shift[]>([])
  const [showShifts, setShowShifts] = useState(false)

  const fetchEmployees = async () => {
    const res = await api.get('/employees')
    setEmployees(res.data)
    const shiftStatus: Record<number, boolean> = {}
    await Promise.all(res.data.map(async (emp: Employee) => {
      const s = await api.get(`/employees/${emp.id}/shifts`)
      shiftStatus[emp.id] = s.data.length > 0 && !s.data[0].clockOut
    }))
    setActiveShifts(shiftStatus)
  }

  useEffect(() => { fetchEmployees() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/employees', {
        ...form,
        baseSalary: form.baseSalary ? Number(form.baseSalary) : 0
      })
      setForm({ fullName: '', phone: '', position: '', baseSalary: '' })
      setShowForm(false)
      fetchEmployees()
      alert('✅ Lưu nhân viên thành công!')
    } catch (error: any) {
      console.error('Lỗi lưu nhân viên:', error)
      alert('❌ Lưu thất bại: ' + (error.response?.data?.message || error.message || 'Vui lòng thử lại'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Xóa nhân viên này?')) {
      try {
        await api.delete(`/employees/${id}`)
        fetchEmployees()
        alert('✅ Xóa nhân viên thành công!')
      } catch (error: any) {
        alert('❌ ' + (error.response?.data?.message || 'Không thể xóa nhân viên'))
      }
    }
  }

  const handleClockIn = async (id: number) => {
    try {
      await api.post(`/employees/${id}/clock-in`)
      fetchEmployees()
      alert('✅ Check in thành công!')
    } catch (error: any) {
      alert('❌ ' + (error.response?.data?.message || 'Nhân viên đang trong ca làm!'))
    }
  }

  const handleClockOut = async (id: number) => {
    try {
      await api.post(`/employees/${id}/clock-out`)
      fetchEmployees()
      alert('✅ Check out thành công!')
    } catch (error: any) {
      alert('❌ ' + (error.response?.data?.message || 'Không có ca làm nào đang mở!'))
    }
  }

  const viewShifts = async (emp: Employee) => {
    try {
      const res = await api.get(`/employees/${emp.id}/shifts`)
      setShifts(res.data)
      setSelectedEmp(emp)
      setShowShifts(true)
    } catch (error: any) {
      alert('❌ Không thể tải lịch sử ca làm')
    }
  }

  const formatTime = (time: string) => new Date(time).toLocaleString('vi-VN')

  const calcHours = (clockIn: string, clockOut: string | null) => {
    if (!clockOut) return 'Đang làm'
    const diff = new Date(clockOut).getTime() - new Date(clockIn).getTime()
    const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000)
    return `${h}h ${m}m`
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold" style={{ color: '#1a3d1f' }}>Nhân viên</h2><p className="text-gray-500 text-sm mt-1">Quản lý danh sách và chấm công</p></div>
        <button onClick={() => setShowForm(!showForm)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#1a5c2e' }}>+ Thêm nhân viên</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-4" style={{ color: '#1a3d1f' }}>Thêm nhân viên mới</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input placeholder="Họ tên" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="border rounded-xl px-4 py-2.5 text-sm outline-none" required />
            <input placeholder="Số điện thoại" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="border rounded-xl px-4 py-2.5 text-sm outline-none" />
            <input placeholder="Chức vụ" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} className="border rounded-xl px-4 py-2.5 text-sm outline-none" required />
            <input placeholder="Lương cơ bản" type="number" value={form.baseSalary} onChange={e => setForm({ ...form, baseSalary: e.target.value })} className="border rounded-xl px-4 py-2.5 text-sm outline-none" />
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: '#1a5c2e' }}>
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600">Hủy</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead><tr style={{ background: '#f9fafb' }}>
            {['Họ tên', 'Số điện thoại', 'Chức vụ', 'Lương', 'Trạng thái', 'Chấm công', 'Thao tác'].map(h => (
              <th key={h} className="text-left px-6 py-4 text-sm font-semibold text-gray-600">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: '#1a5c2e' }}>{emp.fullName.charAt(0)}</div>
                    <span className="font-medium text-gray-800">{emp.fullName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{emp.phone}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{emp.position}</td>
                <td className="px-6 py-4 text-sm font-semibold" style={{ color: '#1a5c2e' }}>{emp.baseSalary.toLocaleString()}đ</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: emp.status === 'active' ? '#dcfce7' : '#fee2e2', color: emp.status === 'active' ? '#166534' : '#dc2626' }}>
                    {emp.status === 'active' ? '● Đang làm' : '● Nghỉ'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {activeShifts[emp.id] ? (
                      <button onClick={() => handleClockOut(emp.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: '#dc2626' }}>⏹ Check out</button>
                    ) : (
                      <button onClick={() => handleClockIn(emp.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: '#1a5c2e' }}>▶ Check in</button>
                    )}
                    <button onClick={() => viewShifts(emp)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600">📋 Lịch sử</button>
                  </div>
                </td>
                <td className="px-6 py-4"><button onClick={() => handleDelete(emp.id)} className="text-sm font-medium text-red-400 hover:text-red-600">Xóa</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {employees.length === 0 && <div className="text-center py-12"><div className="text-5xl mb-3">👥</div><p className="text-gray-400">Chưa có nhân viên nào</p></div>}
      </div>

      {showShifts && selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
            <div className="p-6 text-white rounded-t-2xl" style={{ background: '#1a5c2e' }}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">📋 Lịch sử ca — {selectedEmp.fullName}</h3>
                <button onClick={() => setShowShifts(false)} className="text-white/70 hover:text-white text-xl">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
              {shifts.map(shift => (
                <div key={shift.id} className="p-4 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Check in: {formatTime(shift.clockIn)}</p>
                      <p className="text-sm text-gray-500">Check out: {shift.clockOut ? formatTime(shift.clockOut) : '—'}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: shift.clockOut ? '#dcfce7' : '#fef3c7', color: shift.clockOut ? '#166534' : '#b45309' }}>
                      {calcHours(shift.clockIn, shift.clockOut)}
                    </span>
                  </div>
                </div>
              ))}
              {shifts.length === 0 && <p className="text-center text-gray-400 py-8">Chưa có lịch sử ca làm</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}