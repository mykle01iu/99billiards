import { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import api from '../services/api'

interface DayRevenue { date: string; revenue: number }
interface TopTable { name: string; revenue: number; count: number }
interface PeakHour { hour: number; revenue: number; count: number }
interface Invoice {
  id: number; totalAmount: number; finalAmount: number; discountAmount: number
  paymentMethod: string; createdAt: string; promotionCode: string | null
  session: { table: { name: string }; totalHours: number }
  createdBy: { username: string }
}

const fmt = (n: number) => n.toLocaleString('vi-VN') + 'đ'
const today = new Date().toISOString().slice(0, 10)
const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)

export default function Statistics() {
  const [startDate, setStartDate] = useState(monthAgo)
  const [endDate, setEndDate] = useState(today)
  const [tab, setTab] = useState<'revenue' | 'tables' | 'hours' | 'invoices'>('revenue')

  const [dayData, setDayData] = useState<DayRevenue[]>([])
  const [topTables, setTopTables] = useState<TopTable[]>([])
  const [peakHours, setPeakHours] = useState<PeakHour[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const params = `?startDate=${startDate}&endDate=${endDate}`

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [d, t, h, inv, sum] = await Promise.all([
          api.get('/reports/revenue-by-day' + params),
          api.get('/reports/top-tables' + params),
          api.get('/reports/peak-hours' + params),
          api.get('/reports/invoices-by-date' + params),
          api.get('/reports/revenue' + params)
        ])
        setDayData(d.data)
        setTopTables(t.data)
        setPeakHours(h.data)
        setInvoices(inv.data)
        setSummary(sum.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [startDate, endDate])

  const tabs = [
    { key: 'revenue', label: '📈 Doanh thu' },
    { key: 'tables', label: '🎱 Top bàn' },
    { key: 'hours', label: '⏰ Giờ cao điểm' },
    { key: 'invoices', label: '🧾 Hóa đơn' }
  ]

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#1a3d1f' }}>Thống kê nâng cao</h2>
        <p className="text-gray-500 text-sm mt-1">Phân tích doanh thu chi tiết</p>
      </div>

      {/* Bộ lọc thời gian */}
      <div className="flex gap-3 items-center flex-wrap">
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
          className="p-2.5 border rounded-xl text-sm" />
        <span className="text-gray-400">→</span>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
          className="p-2.5 border rounded-xl text-sm" />
        {[
          { label: 'Hôm nay', s: today, e: today },
          { label: '7 ngày', s: new Date(Date.now()-7*86400000).toISOString().slice(0,10), e: today },
          { label: '30 ngày', s: monthAgo, e: today }
        ].map(p => (
          <button key={p.label} onClick={() => { setStartDate(p.s); setEndDate(p.e) }}
            className="px-3 py-2 rounded-xl text-xs font-semibold border"
            style={{ background: startDate === p.s ? '#dcfce7' : '#f9fafb', color: '#1a5c2e' }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tổng doanh thu', value: fmt(summary.totalRevenue || 0), color: '#dcfce7', text: '#1a5c2e' },
            { label: 'Số hóa đơn', value: summary.totalInvoices || 0, color: '#fef3c7', text: '#b45309' },
            { label: 'TB/hóa đơn', value: fmt(summary.averagePerInvoice || 0), color: '#e0f2fe', text: '#0369a1' },
            { label: 'Chuyển khoản', value: fmt(summary.paymentMethods?.transfer || 0), color: '#f3e8ff', text: '#7c3aed' }
          ].map(c => (
            <div key={c.label} className="p-4 rounded-2xl border" style={{ background: c.color }}>
              <p className="text-xs text-gray-500 mb-1">{c.label}</p>
              <p className="text-xl font-bold" style={{ color: c.text }}>{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className="px-4 py-2 rounded-xl text-sm font-semibold border-2 transition"
            style={{
              borderColor: tab === t.key ? '#1a5c2e' : '#e5e7eb',
              background: tab === t.key ? '#dcfce7' : 'white',
              color: tab === t.key ? '#1a5c2e' : '#6b7280'
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">⏳ Đang tải...</div>
      ) : (
        <>
          {/* Tab: Doanh thu theo ngày */}
          {tab === 'revenue' && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-4">Doanh thu theo ngày</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }}
                    tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }}
                    tickFormatter={v => (v / 1000) + 'k'} />
                  <Tooltip formatter={(v: any) => [fmt(v), 'Doanh thu']}
                    labelFormatter={l => 'Ngày ' + l} />
                  <Line type="monotone" dataKey="revenue" stroke="#1a5c2e"
                    strokeWidth={2} dot={false} name="Doanh thu" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Tab: Top bàn */}
          {tab === 'tables' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-4">Top 5 bàn doanh thu cao nhất</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topTables}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => (v/1000)+'k'} />
                    <Tooltip formatter={(v: any) => [fmt(v), 'Doanh thu']} />
                    <Bar dataKey="revenue" fill="#1a5c2e" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid gap-3">
                {topTables.map((t, i) => (
                  <div key={t.name} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm"
                      style={{ background: i === 0 ? '#f5c518' : i === 1 ? '#9ca3af' : i === 2 ? '#cd7c2f' : '#1a5c2e' }}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">🎱 {t.name}</p>
                      <p className="text-xs text-gray-500">{t.count} hóa đơn</p>
                    </div>
                    <p className="font-bold text-lg" style={{ color: '#1a5c2e' }}>{fmt(t.revenue)}</p>
                  </div>
                ))}
                {topTables.length === 0 && <p className="text-center text-gray-400 py-8">Chưa có dữ liệu</p>}
              </div>
            </div>
          )}

          {/* Tab: Giờ cao điểm */}
          {tab === 'hours' && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-4">Doanh thu theo giờ trong ngày</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" tickFormatter={h => h + 'h'} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => (v/1000)+'k'} />
                  <Tooltip
                    labelFormatter={h => `${h}:00 - ${h}:59`}
                    formatter={(v: any, name) => [
                      name === 'revenue' ? fmt(v) : v,
                      name === 'revenue' ? 'Doanh thu' : 'Hóa đơn'
                    ]} />
                  <Legend formatter={n => n === 'revenue' ? 'Doanh thu' : 'Số hóa đơn'} />
                  <Bar dataKey="revenue" fill="#1a5c2e" radius={[4,4,0,0]} />
                  <Bar dataKey="count" fill="#f5c518" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Tab: Danh sách hóa đơn */}
          {tab === 'invoices' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">Danh sách hóa đơn ({invoices.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      {['#', 'Bàn', 'Giờ', 'Tổng', 'Giảm giá', 'Thực thu', 'TT', 'NV', 'Thời gian'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm text-gray-400">#{inv.id}</td>
                        <td className="px-4 py-3 text-sm font-medium">{inv.session?.table?.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{inv.session?.totalHours?.toFixed(1) || '--'}h</td>
                        <td className="px-4 py-3 text-sm">{fmt(inv.totalAmount)}</td>
                        <td className="px-4 py-3 text-sm text-red-500">
                          {inv.discountAmount > 0 ? `-${fmt(inv.discountAmount)}` : '--'}
                          {inv.promotionCode && <span className="ml-1 text-xs bg-yellow-100 text-yellow-700 px-1 rounded">{inv.promotionCode}</span>}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold" style={{ color: '#1a5c2e' }}>{fmt(inv.finalAmount)}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{ background: inv.paymentMethod === 'cash' ? '#dcfce7' : '#e0f2fe', color: '#374151' }}>
                            {inv.paymentMethod === 'cash' ? '💵' : '💳'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{inv.createdBy?.username}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {new Date(inv.createdAt).toLocaleString('vi-VN', { hour12: false })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {invoices.length === 0 && <p className="text-center text-gray-400 py-12">Chưa có hóa đơn</p>}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}