import { useState, useEffect } from 'react'
import api from '../services/api'

interface UserAccount {
  id: number
  username: string
  role: string
  createdAt: string
}

export default function AccountManagement() {
  const [users, setUsers] = useState<UserAccount[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ username: '', password: '', role: 'staff' })
  const [changePwModal, setChangePwModal] = useState<UserAccount | null>(null)
  const [newPw, setNewPw] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users')
      setUsers(res.data)
    } catch { alert('❌ Không có quyền truy cập') }
    finally { setLoading(false) }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/users', form)
      setForm({ username: '', password: '', role: 'staff' })
      setShowForm(false)
      fetchUsers()
      alert('✅ Tạo tài khoản thành công!')
    } catch (err: any) {
      alert('❌ ' + (err.response?.data?.error || 'Có lỗi xảy ra'))
    }
  }

  const handleChangePassword = async () => {
    if (!changePwModal || !newPw) return
    if (newPw.length < 6) return alert('Mật khẩu tối thiểu 6 ký tự')
    try {
      await api.put(`/users/${changePwModal.id}/password`, { newPassword: newPw })
      setChangePwModal(null); setNewPw('')
      alert('✅ Đổi mật khẩu thành công!')
    } catch { alert('❌ Có lỗi xảy ra') }
  }

  const handleChangeRole = async (user: UserAccount) => {
    const newRole = user.role === 'admin' ? 'staff' : 'admin'
    if (!confirm(`Đổi role ${user.username} → ${newRole}?`)) return
    try {
      await api.put(`/users/${user.id}/role`, { role: newRole })
      fetchUsers()
    } catch { alert('❌ Có lỗi xảy ra') }
  }

  const handleDelete = async (user: UserAccount) => {
    if (!confirm(`Xóa tài khoản "${user.username}"?`)) return
    try {
      await api.delete(`/users/${user.id}`)
      fetchUsers()
      alert('✅ Đã xóa tài khoản')
    } catch { alert('❌ Có lỗi xảy ra') }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#1a3d1f' }}>Quản lý tài khoản</h2>
          <p className="text-gray-500 text-sm mt-1">Tạo và phân quyền tài khoản nhân viên</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: '#1a5c2e' }}>
          + Tạo tài khoản
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="p-6 rounded-2xl border bg-gray-50 space-y-4">
          <h3 className="font-semibold text-gray-700">Tạo tài khoản mới</h3>
          <div className="grid grid-cols-3 gap-4">
            <input placeholder="Tên đăng nhập" value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required className="p-3 border rounded-xl text-sm" />
            <input type="password" placeholder="Mật khẩu (min 6 ký tự)" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required minLength={6} className="p-3 border rounded-xl text-sm" />
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
              className="p-3 border rounded-xl text-sm">
              <option value="staff">👤 Staff</option>
              <option value="admin">👑 Admin</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: '#1a5c2e' }}>Tạo</button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600">Hủy</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-400">⏳ Đang tải...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['#', 'Tên đăng nhập', 'Quyền', 'Ngày tạo', 'Thao tác'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-sm font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-400">{user.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {user.username}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{
                        background: user.role === 'admin' ? '#fef3c7' : '#f3f4f6',
                        color: user.role === 'admin' ? '#b45309' : '#6b7280'
                      }}>
                      {user.role === 'admin' ? '👑 Admin' : '👤 Staff'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => { setChangePwModal(user); setNewPw('') }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600">
                        🔑 Đổi mật khẩu
                      </button>
                      <button onClick={() => handleChangeRole(user)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                        🔄 Đổi quyền
                      </button>
                      <button onClick={() => handleDelete(user)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600">
                        🗑️ Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal đổi mật khẩu */}
      {changePwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <h3 className="font-bold text-lg mb-4" style={{ color: '#1a3d1f' }}>
              Đổi mật khẩu — {changePwModal.username}
            </h3>
            <input type="password" placeholder="Mật khẩu mới (min 6 ký tự)"
              value={newPw} onChange={e => setNewPw(e.target.value)}
              className="w-full p-3 border rounded-xl text-sm mb-4" />
            <div className="flex gap-3">
              <button onClick={handleChangePassword}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white"
                style={{ background: '#1a5c2e' }}>Xác nhận</button>
              <button onClick={() => setChangePwModal(null)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-600">Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}