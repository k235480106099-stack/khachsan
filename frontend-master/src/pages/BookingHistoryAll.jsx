import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllHotels, getAllBookings, getBookingHistoryByHotel } from '../services/api.js';

const STATUS_MAP = {
  booked: { label: 'Đã đặt (Chờ nhận)', bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  checked_in: { label: 'Đang ở (sử dụng)', bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  using: { label: 'Đang ở (sử dụng)', bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  checked_out: { label: 'Đã trả phòng', bg: '#f3e8ff', color: '#6b21a8', border: '#d8b4fe' },
  cancelled: { label: 'Đã huỷ phòng', bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' }
};

export default function BookingHistoryAll() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlHotelId = searchParams.get('hotelId') || 'all';

  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(urlHotelId);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function loadData(hotelIdToLoad) {
    setLoading(true);
    setError('');

    const targetHotel = hotelIdToLoad !== undefined ? hotelIdToLoad : selectedHotel;

    const fetchPromise = (targetHotel === 'all')
      ? getAllBookings()
      : getBookingHistoryByHotel(targetHotel);

    Promise.all([
      getAllHotels().catch(() => []),
      fetchPromise.catch((err) => {
        setError(err.message || 'Lỗi tải danh sách đơn');
        return [];
      })
    ])
      .then(([hotelsData, bookingsData]) => {
        setHotels(Array.isArray(hotelsData) ? hotelsData : []);
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Không thể tải dữ liệu');
        setLoading(false);
      });
  }

  useEffect(() => {
    loadData(urlHotelId);
    setSelectedHotel(urlHotelId);
  }, [urlHotelId]);

  function handleHotelChange(newHotelId) {
    setSelectedHotel(newHotelId);
    if (newHotelId === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ hotelId: newHotelId });
    }
  }

  const formatVND = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = (b.guest_name || b.full_name || '').toLowerCase().includes(term);
      const matchPhone = (b.phone || '').includes(term);
      const matchRoom = String(b.room_number || '').includes(term);
      const matchId = String(b.id || '').includes(term);
      const matchHotel = (b.hotel_name || '').toLowerCase().includes(term);
      if (!matchName && !matchPhone && !matchRoom && !matchId && !matchHotel) return false;
    }
    return true;
  });

  const countBooked = bookings.filter((b) => b.status === 'booked').length;
  const countUsing = bookings.filter((b) => b.status === 'checked_in' || b.status === 'using').length;
  const countDone = bookings.filter((b) => b.status === 'checked_out').length;
  const countCancelled = bookings.filter((b) => b.status === 'cancelled').length;

  return (
    <div>
      {/* Tiêu đề & nút làm mới */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 24, color: '#0f172a' }}>
            📖 Quản Lý Lịch Sử Đặt &amp; Huỷ Phòng Toàn Hệ Thống
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
            Theo dõi danh sách khách hàng, tiền cọc 30% và nguyên nhân huỷ phòng từ chuỗi 10 khách sạn
          </p>
        </div>

        <button
          onClick={() => loadData(selectedHotel)}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            background: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          🔄 Làm mới dữ liệu
        </button>
      </div>

      {/* Thẻ chỉ số nhanh */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        <div style={statBox('#2563eb')}>
          <div style={{ fontSize: 13, color: '#64748b' }}>Đã Đặt (Chờ Nhận)</div>
          <div style={{ fontSize: 22, fontWeight: 'bold', color: '#1e40af', marginTop: 4 }}>{countBooked} đơn</div>
        </div>
        <div style={statBox('#16a34a')}>
          <div style={{ fontSize: 13, color: '#64748b' }}>Đang Sử Dụng (Ở)</div>
          <div style={{ fontSize: 22, fontWeight: 'bold', color: '#15803d', marginTop: 4 }}>{countUsing} phòng</div>
        </div>
        <div style={statBox('#8b5cf6')}>
          <div style={{ fontSize: 13, color: '#64748b' }}>Đã Trả Phòng</div>
          <div style={{ fontSize: 22, fontWeight: 'bold', color: '#6b21a8', marginTop: 4 }}>{countDone} đơn</div>
        </div>
        <div style={statBox('#ef4444')}>
          <div style={{ fontSize: 13, color: '#64748b' }}>Đã Huỷ Phòng</div>
          <div style={{ fontSize: 22, fontWeight: 'bold', color: '#991b1b', marginTop: 4 }}>
            {countCancelled} <small style={{ fontSize: 12, fontWeight: 'normal' }}>(Có lý do)</small>
          </div>
        </div>
      </div>

      {/* Thanh công cụ lọc */}
      <div
        style={{
          background: '#fff',
          padding: 16,
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          marginBottom: 20,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Khách sạn:</span>
          <select
            value={selectedHotel}
            onChange={(e) => handleHotelChange(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
          >
            <option value="all">Tất cả 10 khách sạn</option>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                #{h.id}. {h.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="booked">📅 Đã đặt mới</option>
            <option value="checked_in">🔑 Đang ở</option>
            <option value="checked_out">🚪 Đã trả phòng</option>
            <option value="cancelled">🛑 Đã huỷ</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: 220 }}>
          <input
            placeholder="Tìm theo Tên khách, SĐT, Số phòng hoặc Mã đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {loading && <p style={{ color: '#64748b' }}>Đang tải dữ liệu lịch sử đặt phòng...</p>}
      {error && <p style={{ color: '#dc2626', background: '#fee2e2', padding: 12, borderRadius: 8 }}>{error}</p>}

      {/* Bảng danh sách đơn đặt phòng */}
      {!loading && (
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={thStyle}>Mã Đơn</th>
                <th style={thStyle}>Khách Sạn</th>
                <th style={thStyle}>Khách Hàng</th>
                <th style={thStyle}>Số Điện Thoại</th>
                <th style={thStyle}>Phòng</th>
                <th style={thStyle}>Thời Gian</th>
                <th style={thStyle}>Tổng Tiền &amp; Cọc 30%</th>
                <th style={{ ...thStyle, width: '28%' }}>Trạng Thái &amp; Nguyên Nhân Huỷ</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                    Không tìm thấy đơn đặt phòng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const cfg = STATUS_MAP[b.status] || { label: b.status, bg: '#f1f5f9', color: '#334155', border: '#cbd5e1' };
                  const guestName = b.guest_name || b.full_name || 'Khách vãng lai';
                  const roomType = b.room_type || b.type || 'normal';
                  const depositVal = Math.round(Number(b.total_price) * 0.3);

                  return (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={tdStyle}>
                        <strong>#{b.id}</strong>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>
                          {b.hotel_name || `Khách sạn #${b.hotel_id}`}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 'bold', color: '#1e40af', fontSize: 14 }}>
                          👤 {guestName}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ color: '#475569', fontWeight: 600 }}>📞 {b.phone || '-'}</span>
                      </td>
                      <td style={tdStyle}>
                        <strong>Phòng {b.room_number}</strong>
                        <div>
                          <small style={{ color: roomType === 'vip' ? '#b45309' : '#64748b', fontWeight: 600 }}>
                            {roomType === 'vip' ? '★ VIP' : 'Thường'}
                          </small>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontSize: 13 }}>Nhận: <strong>{b.check_in}</strong></div>
                        <div style={{ fontSize: 13, color: '#64748b' }}>Trả: {b.check_out}</div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{formatVND(b.total_price)}</div>
                        <div style={{ fontSize: 12, marginTop: 4 }}>
                          {b.is_deposited ? (
                            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>
                              ✓ Đã cọc: {formatVND(depositVal)}
                            </span>
                          ) : (
                            <span style={{ color: '#d97706', fontWeight: 600 }}>
                              ⚠️ Chưa cọc: {formatVND(depositVal)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ marginBottom: 6 }}>
                          <span
                            style={{
                              background: cfg.bg,
                              color: cfg.color,
                              padding: '4px 10px',
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 'bold',
                              display: 'inline-block',
                              border: `1px solid ${cfg.border}`
                            }}
                          >
                            {cfg.label}
                          </span>
                        </div>

                        {/* HIỂN THỊ NGUYÊN NHÂN HUỶ NẾU ĐƠN BỊ HUỶ */}
                        {b.status === 'cancelled' && (
                          <div
                            style={{
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              borderRadius: 6,
                              padding: '6px 10px',
                              fontSize: 12,
                              color: '#991b1b',
                              lineHeight: 1.4
                            }}
                          >
                            <strong>🛑 Lý do huỷ:</strong>{' '}
                            <span>{b.cancel_reason || 'Khách không đồng ý cọc hoặc đã huỷ'}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle = { padding: '12px 14px', fontWeight: 600 };
const tdStyle = { padding: '12px 14px', verticalAlign: 'middle' };

function statBox(color) {
  return {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderLeft: `5px solid ${color}`,
    borderRadius: 8,
    padding: '12px 16px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  };
}