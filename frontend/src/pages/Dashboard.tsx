import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../services/api'

interface Stats { totalEmployees: number; occupiedTables: number; totalTables: number; todayRevenue: number }

const mockChartData = [
  { day: 'T2', revenue: 1200000 }, { day: 'T3', revenue: 1800000 },
  { day: 'T4', revenue: 1500000 }, { day: 'T5', revenue: 2200000 },
  { day: 'T6', revenue: 2800000 }, { day: 'T7', revenue: 3500000 }, { day: 'CN', revenue: 3200000 },
]

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(error => {
        console.error('Lỗi lấy thống kê:', error)
        alert('❌ Không thể lấy dữ liệu thống kê: ' + (error.response?.data?.message || error.message))
      })
  }, [])

  const cards = [
    { icon: '👥', label: 'Nhân viên đang làm', value: stats?.totalEmployees ?? '--', color: '#1a5c2e', bg: '#dcfce7' },
    { icon: '🎱', label: 'Bàn đang hoạt động', value: stats ? `${stats.occupiedTables}/${stats.totalTables}` : '--', color: '#b45309', bg: '#fef3c7' },
    { icon: '💰', label: 'Doanh thu hôm nay', value: stats ? `${(stats.todayRevenue / 1000000).toFixed(1)}M` : '--', color: '#7c3aed', bg: '#ede9fe' },
    { icon: '📈', label: 'Tỷ lệ lấp đầy', value: stats ? `${Math.round((stats.occupiedTables / Math.max(stats.totalTables, 1)) * 100)}%` : '--', color: '#0369a1', bg: '#e0f2fe' },
  ]

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#1a3d1f' }}>Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">Tổng quan hệ thống 99Billiards Club</p>
        </div>
        <div className="px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#1a5c2e' }}>
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-5">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4" style={{ background: card.bg }}>{card.icon}</div>
            <p className="text-3xl font-bold mb-1" style={{ color: card.color }}>{card.value}</p>
            <p className="text-gray-500 text-sm">{card.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-6" style={{ color: '#1a3d1f' }}>Doanh thu 7 ngày qua</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={mockChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(v: any) => [`${(v || 0).toLocaleString()}đ`, 'Doanh thu']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="revenue" fill="#1a5c2e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold mb-4" style={{ color: '#1a3d1f' }}>Trạng thái bàn</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#dcfce7' }}>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div><span className="text-sm font-medium text-gray-700">Bàn trống</span></div>
                <span className="font-bold" style={{ color: '#1a5c2e' }}>{stats ? stats.totalTables - stats.occupiedTables : '--'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#fef3c7' }}>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div><span className="text-sm font-medium text-gray-700">Đang dùng</span></div>
                <span className="font-bold text-yellow-600">{stats?.occupiedTables ?? '--'}</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold mb-4" style={{ color: '#1a3d1f' }}>Thao tác nhanh</h3>
            <div className="space-y-2">
              {[{ href: '/employees', icon: '👥', label: 'Thêm nhân viên' }, { href: '/tables', icon: '🎱', label: 'Quản lý bàn' }, { href: '/services', icon: '🍺', label: 'Dịch vụ' }].map(item => (
                <a key={item.href} href={item.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: '#dcfce7' }}>{item.icon}</div>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <span className="ml-auto text-gray-300">›</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}