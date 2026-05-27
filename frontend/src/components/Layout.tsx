import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function Layout() {
  const navigate = useNavigate()
  const role = localStorage.getItem('role')

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    navigate('/login')
  }

  return (
    <div className="flex h-screen" style={{ background: '#f5f5f0' }}>
      <aside className="w-64 text-white flex flex-col" style={{ background: '#1a5c2e' }}>
        <div className="p-6 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <img src={logo} alt="99Billiards" className="w-12 h-12 rounded-full ring-2" style={{ ringColor: '#f5c518' }} />
          <div>
            <h1 className="text-lg font-bold text-white">99Billiards</h1>
            <p className="text-xs" style={{ color: '#a3c9ae' }}>Quản lý hệ thống</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { to: '/', icon: '📊', label: 'Dashboard', end: true },
            ...(role === 'admin' ? [{ to: '/employees', icon: '👥', label: 'Nhân viên' }] : []),
            { to: '/tables', icon: '🎱', label: 'Bàn chơi' },
            ...(role === 'admin' ? [{ to: '/services', icon: '🍺', label: 'Dịch vụ' }] : []),
            { to: '/invoices', icon: '🧾', label: 'Hóa đơn' },
          ].map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                  isActive
                    ? 'text-white' 
                    : 'text-green-200 hover:text-white hover:bg-white/10'
                }`
              }
              style={({ isActive }) => isActive ? { background: '#f5c518', color: '#1a3d1f' } : {}}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-300 hover:bg-white/10 transition">
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}