import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getBookingHistoryByGuest } from '../services/api.js';

const STATUS_CONFIG = {
  booked: { label: 'Đã đặt (chờ nhận phòng)', bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  checked_in: { label: 'Đang sử dụng (ở)', bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  checked_out: { label: 'Đã trả phòng', bg: '#f3e8ff', color: '#6b21a8', border: '#d8b4fe' },
  cancelled: { label: 'Đã huỷ phòng', bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' }
};

export default function MyBookingHistory() {
  const [searchParams] = useSearchParams();
  const hotelId = searchParams.get('hotelId');
  const [phone, setPhone] = useState('');
  const [history, setHistory] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatVND = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  async function handleSearch(e) {
    e.preventDefault();
    if (!phone.trim()) return;
    setError('');
    setLoading(true);
    try {
      const data = await getBookingHistoryByGuest(phone.trim());
      setHistory(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '10px 0 40px' }}>
      <h2 style={{ fontSize: 24, color: '#0f172a', marginBottom: 8 }}>Tra cứu lịch sử đặt phòng</h2>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
        Nhập số điện thoại quý khách đã dùng khi đặt phòng để xem tình trạng đơn, tiền cọc và nguyên nhân huỷ (nếu có).
      </p>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 24, maxWidth: 500 }}>
        <input
          placeholder="Nhập số điện thoại đã đặt phòng (VD: 0988...)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Đang tìm...' : 'Tra cứu'}
        </button>
      </form>

      {error && <p style={{ color: '#dc2626', background: '#fee2e2', padding: 12, borderRadius: 8 }}>{error}</p>}
      {history && history.length === 0 && (
        <div style={{ background: '#f8fafc', padding: 24, borderRadius: 8, textAlign: 'center', color: '#64748b' }}>
          Không tìm thấy đơn đặt phòng nào với số điện thoại này.
        </div>
      )}

      {history && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {history.map((item) => {
            const cfg = STATUS_CONFIG[item.status] || { label: item.status, bg: '#f1f5f9', color: '#334155', border: '#cbd5e1' };
            const depositAmount = Math.round(Number(item.total_price) * 0.3);

            return (
              <div
                key={item.id}
                style={{
                  background: '#fff',
                  border: `1px solid ${cfg.border}`,
                  borderLeft: `6px solid ${cfg.color}`,
                  borderRadius: 10,
                  padding: 18,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: 17, color: '#0f172a' }}>
                      {item.hotel_name} — Phòng {item.room_number} ({item.type === 'vip' ? 'VIP' : 'Thường'})
                    </h3>
                    <div style={{ fontSize: 13, color: '#64748b' }}>
                      Mã đơn: <strong>#{item.id}</strong> | Khách: {item.guest_name}
                    </div>
                  </div>

                  <span
                    style={{
                      background: cfg.bg,
                      color: cfg.color,
                      padding: '5px 12px',
                      borderRadius: 20,
                      fontWeight: 'bold',
                      fontSize: 13,
                      border: `1px solid ${cfg.border}`
                    }}
                  >
                    {cfg.label}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: 14, color: '#334155', background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: 12 }}>Thời gian nhận phòng:</div>
                    <strong>{item.check_in}</strong>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: 12 }}>Thời gian trả phòng:</div>
                    <strong>{item.check_out}</strong>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: 12 }}>Tổng tiền phòng:</div>
                    <strong style={{ color: '#0f172a' }}>{formatVND(item.total_price)}</strong>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: 12 }}>Tiền cọc 30%:</div>
                    <div>
                      {item.is_deposited ? (
                        <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓ Đã cọc QR: {formatVND(depositAmount)}</span>
                      ) : (
                        <span style={{ color: '#d97706', fontWeight: 600 }}>⚠️ Chưa cọc: {formatVND(depositAmount)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* HIỂN THỊ NGUYÊN NHÂN HUỶ PHÒNG NẾU ĐƠN BỊ HUỶ */}
                {item.status === 'cancelled' && (
                  <div
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: 8,
                      padding: '12px 14px',
                      marginTop: 10,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10
                    }}
                  >
                    <span style={{ fontSize: 20, lineHeight: 1 }}>🛑</span>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#b91c1c', fontSize: 14, marginBottom: 2 }}>
                        Nguyên nhân huỷ phòng:
                      </div>
                      <div style={{ color: '#7f1d1d', fontSize: 14 }}>
                        {item.cancel_reason || 'Khách hàng hoặc khách sạn đã huỷ đơn đặt phòng này'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Nút huỷ nếu đơn vẫn đang ở trạng thái 'booked' */}
                {item.status === 'booked' && (
                  <div style={{ marginTop: 12, textAlign: 'right' }}>
                    <Link
                      to={`/cancel/${item.id}?hotelId=${hotelId || item.hotel_id}`}
                      style={{
                        display: 'inline-block',
                        background: '#fff',
                        color: '#dc2626',
                        border: '1px solid #fca5a5',
                        padding: '6px 14px',
                        borderRadius: 6,
                        textDecoration: 'none',
                        fontSize: 13,
                        fontWeight: 600
                      }}
                    >
                      Huỷ đặt phòng này
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}