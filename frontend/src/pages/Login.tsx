import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import logo from '../assets/logo.png'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { username, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', res.data.role)
      navigate('/')
    } catch {
      setError('Sai tài khoản hoặc mật khẩu!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#1a5c2e' }}>
      <div className="hidden lg:flex flex-1 items-center justify-center p-12">
        <div className="text-center">
          <img src={logo} alt="99Billiards" className="w-48 h-48 mx-auto mb-8 rounded-full shadow-2xl" />
          <h1 className="text-4xl font-bold text-white mb-3">99Billiards Club</h1>
          <p className="text-green-200 text-lg">Hệ thống quản lý chuyên nghiệp</p>
          <div className="mt-8 grid grid-cols-3 gap-6 text-center">
            {[{ icon: '👥', label: 'Nhân viên' }, { icon: '🎱', label: 'Bàn chơi' }, { icon: '💰', label: 'Doanh thu' }].map(item => (
              <div key={item.label} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="text-green-100 text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full lg:w-96 flex items-center justify-center p-8" style={{ background: '#f5f5f0' }}>
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-1" style={{ color: '#1a3d1f' }}>Đăng nhập</h2>
          <p className="text-gray-500 text-sm mb-8">Chào mừng trở lại!</p>
          {error && <div className="mb-4 p-4 rounded-xl text-sm font-medium" style={{ background: '#fee2e2', color: '#dc2626' }}>⚠️ {error}</div>}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Tài khoản</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#d1d5db', background: 'white' }} placeholder="Nhập tài khoản" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Mật khẩu</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                style={{ borderColor: '#d1d5db', background: 'white' }} placeholder="Nhập mật khẩu" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white"
              style={{ background: loading ? '#9ca3af' : '#1a5c2e' }}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}