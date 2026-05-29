import { useEffect, useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import api from '../services/api'

const logo = new URL('../assets/logo.png', import.meta.url).href

interface Invoice {
  id: number; totalAmount: number; paymentMethod: string; status: string; createdAt: string
  session: { table: { name: string }; totalHours: number; tableFee: number }
  items: { id: number; quantity: number; unitPrice: number; service: { name: string } }[]
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selected, setSelected] = useState<Invoice | null>(null)
  const printRef = useRef<any>(null)

  const pageStyle = `
    @page { margin: 20mm; }
    body { color: #000; background: #fff; -webkit-print-color-adjust: exact; }
    .invoice-print { color: #000 !important; background: #fff !important; }
    .invoice-print * { color: #000 !important; background: transparent !important; box-shadow: none !important; }
    .invoice-print img { filter: grayscale(1) contrast(1.2) !important; }
    .invoice-print .text-gray-500 { color: #333 !important; }
    .invoice-print .text-gray-700 { color: #111 !important; }
    .invoice-print .border-gray-200 { border-color: #ccc !important; }
    .invoice-print .rounded-3xl { border-radius: 24px !important; }
    .invoice-print button { display: none !important; }
  `

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selected ? `Invoice-${selected.id}` : 'Invoice',
    pageStyle,
  })

  const formatMoney = (value: number) => value.toLocaleString('vi-VN') + 'đ'
  const formatDate = (value: string) => new Date(value).toLocaleString('vi-VN', { hour12: false })

  useEffect(() => {
    api.get('/invoices')
      .then(res => setInvoices(res.data))
      .catch(error => {
        console.error('Lỗi lấy hóa đơn:', error)
        alert('❌ Không thể lấy hóa đơn: ' + (error.response?.data?.message || error.message))
      })
  }, [])

  return (
    <div className="p-8 space-y-6">
      <div><h2 className="text-2xl font-bold" style={{ color: '#1a3d1f' }}>Hóa đơn</h2><p className="text-gray-500 text-sm mt-1">Lịch sử giao dịch</p></div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead><tr style={{ background: '#f9fafb' }}>
              {['#', 'Bàn', 'Thời gian', 'Tổng tiền', 'Thanh toán', ''].map(h => (
                <th key={h} className="text-left px-6 py-4 text-sm font-semibold text-gray-600">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-500">#{inv.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{inv.session.table.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{inv.session.totalHours ? `${inv.session.totalHours.toFixed(1)}h` : '--'}</td>
                  <td className="px-6 py-4 text-sm font-bold" style={{ color: '#1a5c2e' }}>{inv.totalAmount.toLocaleString()}đ</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ background: inv.paymentMethod === 'cash' ? '#dcfce7' : '#e0f2fe', color: '#374151' }}>
                      {inv.paymentMethod === 'cash' ? '💵 Tiền mặt' : '💳 Chuyển khoản'}
                    </span>
                  </td>
                  <td className="px-6 py-4"><button onClick={() => setSelected(inv)} className="text-sm font-medium hover:underline" style={{ color: '#1a5c2e' }}>Chi tiết</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {invoices.length === 0 && <p className="text-center text-gray-400 py-12">Chưa có hóa đơn nào</p>}
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          {selected ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold" style={{ color: '#1a3d1f' }}>Hóa đơn #{selected.id}</h3>
                <div className="flex items-center gap-2">
                  <button onClick={handlePrint} className="px-3 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#1a5c2e' }}>
                    🖨️ In hóa đơn
                  </button>
                  <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
              </div>
              <div ref={printRef} className="space-y-6 invoice-print" style={{ color: '#000' }}>
                <div className="rounded-3xl border border-gray-200 p-5" style={{ background: '#fff' }}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img src={logo} alt="Logo 99 Billiards" className="h-16 w-16 object-contain" style={{ filter: 'grayscale(1) contrast(1.2)' }} />
                      <div>
                        <div className="text-3xl font-black" style={{ color: '#000' }}>99 Billiards</div>
                        <div className="text-sm text-gray-700">Địa chỉ: Khu ĐT VSIP - Xã Cẩm Giàng - Thành Phố Hải Phòng</div>
                        <div className="text-sm text-gray-700">Hotline: 0367 564 896</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs uppercase font-semibold text-gray-500">Hóa đơn</div>
                      <div className="text-xl font-bold" style={{ color: '#000' }}>#{selected.id}</div>
                      <div className="text-xs text-gray-700">{formatDate(selected.createdAt)}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Bàn</span><span className="font-medium">{selected.session.table.name}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Thời gian</span><span className="font-medium">{selected.session.totalHours?.toFixed(1)}h</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Tiền bàn</span><span className="font-medium">{selected.session.tableFee ? formatMoney(selected.session.tableFee) : '0đ'}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Thanh toán</span><span className="font-medium">{selected.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}</span></div>
                </div>

                {selected.items.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Dịch vụ thêm</p>
                    <div className="space-y-2">
                      {selected.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm p-3 rounded-2xl border border-gray-200" style={{ background: '#fff' }}>
                          <span className="text-gray-700">{item.service.name} x{item.quantity}</span>
                          <span className="font-medium">{formatMoney(item.unitPrice * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-3xl border border-gray-200 p-5" style={{ background: '#fff' }}>
                  <div className="flex justify-between font-bold text-lg mb-3">
                    <span style={{ color: '#000' }}>Tổng cộng</span>
                    <span style={{ color: '#000' }}>{formatMoney(selected.totalAmount)}</span>
                  </div>
                  <div className="text-sm text-gray-700">Đã bao gồm phí bàn và dịch vụ thêm.</div>
                </div>

                <div className="rounded-3xl border border-gray-200 p-5 text-center" style={{ background: '#fff' }}>
                  <p className="font-semibold text-gray-800">Cảm ơn quý khách đã ủng hộ 99 Billiards!</p>
                  <p className="text-sm text-gray-700 mt-2">Hẹn gặp lại lần sau. Chúc quý khách có buổi chơi thật vui.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center"><div className="text-5xl mb-3">🧾</div><p className="text-sm">Chọn hóa đơn để xem chi tiết</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}