import { useEffect, useState } from 'react';
import {
  getBookingsByHotel,
  checkInBooking,
  checkOutBooking,
  cancelBookingByStaff,
  remindDeposit,
  getCurrentUser
} from '../services/api.js';
import { useHotel } from '../context/HotelContext.jsx';

const STATUS_MAP = {
  booked: { label: 'Đã đặt (Chờ nhận)', bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  checked_in: { label: 'Đang ở (sử dụng)', bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  using: { label: 'Đang ở (sử dụng)', bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  checked_out: { label: 'Đã trả phòng', bg: '#f3e8ff', color: '#6b21a8', border: '#d8b4fe' },
  cancelled: { label: 'Đã huỷ phòng', bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' }
};

export default function CheckInOut() {
  const currentUser = getCurrentUser();
  const { hotelId, currentHotel } = useHotel();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal huỷ phòng
  const [cancelModal, setCancelModal] = useState({ open: false, bookingId: null, reason: '' });
  // Modal nhắc cọc
  const [remindModal, setRemindModal] = useState({ open: false, bookingId: null, message: '' });

  function loadBookings() {
    if (!hotelId) return;
    setLoading(true);
    setError('');
    getBookingsByHotel(hotelId)
      .then((data) => {
        setBookings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Không thể tải danh sách đơn đặt');
        setLoading(false);
      });
  }

  useEffect(() => {
    loadBookings();
  }, [hotelId]);

  async function handleCheckin(id) {
    try {
      await checkInBooking(id);
      loadBookings();
    } catch (err) {
      alert('Lỗi nhận phòng: ' + err.message);
    }
  }

  async function handleCheckout(id) {
    try {
      await checkOutBooking(id);
      loadBookings();
    } catch (err) {
      alert('Lỗi trả phòng: ' + err.message);
    }
  }

  async function handleConfirmCancel() {
    if (!cancelModal.reason.trim()) {
      alert('Vui lòng nhập lý do huỷ phòng!');
      return;
    }
    try {
      await cancelBookingByStaff(cancelModal.bookingId, cancelModal.reason.trim());
      setCancelModal({ open: false, bookingId: null, reason: '' });
      loadBookings();
    } catch (err) {
      alert('Lỗi huỷ phòng: ' + err.message);
    }
  }

  async function handleConfirmRemind() {
    const msg = remindModal.message.trim() || 'Kính mời quý khách chuyển khoản tiền cọc 30% để khách sạn giữ phòng ạ!';
    try {
      await remindDeposit(remindModal.bookingId, msg);
      setRemindModal({ open: false, bookingId: null, message: '' });
      alert('Đã gửi thông báo nhắc cọc đến khách hàng!');
      loadBookings();
    } catch (err) {
      alert('Lỗi nhắc cọc: ' + err.message);
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
      const matchRoom = String(b.room_number).includes(term);
      const matchId = String(b.id).includes(term);
      if (!matchName && !matchPhone && !matchRoom && !matchId) return false;
    }
    return true;
  });

  const countBooked = bookings.filter((b) => b.status === 'booked').length;
  const countUsing = bookings.filter((b) => b.status === 'checked_in' || b.status === 'using').length;
  const countDone = bookings.filter((b) => b.status === 'checked_out').length;
  const countCancel = bookings.filter((b) => b.status === 'cancelled').length;

  return (
    <div>
      {/* Tiêu đề & nút làm mới */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 24, color: '#0f172a' }}>
            🔑 Nghiệp Vụ Nhận / Trả Phòng &amp; Quản Lý Cọc — {currentHotel?.name}
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
            Kiểm tra tiền cọc 30%, nhắc nhở khách chuyển khoản, xử lý Check-in / Check-out và huỷ phòng có lý do
          </p>
        </div>

        <button
          onClick={loadBookings}
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
          🔄 Làm mới
        </button>
      </div>

      {/* Thẻ thống kê */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        <div style={statBox('#2563eb')}>
          <div style={{ fontSize: 13, color: '#64748b' }}>Chờ Nhận Phòng</div>
          <div style={{ fontSize: 22, fontWeight: 'bold', color: '#1e40af', marginTop: 4 }}>{countBooked} đơn</div>
        </div>
        <div style={statBox('#16a34a')}>
          <div style={{ fontSize: 13, color: '#64748b' }}>Khách Đang Ở</div>
          <div style={{ fontSize: 22, fontWeight: 'bold', color: '#15803d', marginTop: 4 }}>{countUsing} phòng</div>
        </div>
        <div style={statBox('#8b5cf6')}>
          <div style={{ fontSize: 13, color: '#64748b' }}>Đã Trả Phòng</div>
          <div style={{ fontSize: 22, fontWeight: 'bold', color: '#6b21a8', marginTop: 4 }}>{countDone} đơn</div>
        </div>
        <div style={statBox('#ef4444')}>
          <div style={{ fontSize: 13, color: '#64748b' }}>Đã Huỷ Phòng</div>
          <div style={{ fontSize: 22, fontWeight: 'bold', color: '#991b1b', marginTop: 4 }}>{countCancel} đơn</div>
        </div>
      </div>

      {/* Thanh bộ lọc */}
      <div
        style={{
          background: '#fff',
          padding: 14,
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          marginBottom: 20,
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
          >
            <option value="all">Tất cả ({bookings.length})</option>
            <option value="booked">📅 Chờ nhận phòng ({countBooked})</option>
            <option value="checked_in">🔑 Đang ở ({countUsing})</option>
            <option value="checked_out">🚪 Đã trả ({countDone})</option>
            <option value="cancelled">🛑 Đã huỷ ({countCancel})</option>
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

      {loading && <p style={{ color: '#64748b' }}>Đang tải danh sách đặt phòng...</p>}
      {error && <p style={{ color: '#dc2626', background: '#fee2e2', padding: 12, borderRadius: 8 }}>{error}</p>}

      {/* Bảng danh sách đơn đặt */}
      {!loading && (
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={thStyle}>Mã Đơn</th>
                <th style={thStyle}>Phòng</th>
                <th style={thStyle}>Khách Hàng</th>
                <th style={thStyle}>Thời Gian</th>
                <th style={thStyle}>Tiền Phòng &amp; Cọc 30%</th>
                <th style={{ ...thStyle, width: '22%' }}>Trạng Thái &amp; Lý Do Huỷ</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Thao Tác Nghiệp Vụ</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                    Không tìm thấy đơn đặt phòng nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const cfg = STATUS_MAP[b.status] || { label: b.status, bg: '#f1f5f9', color: '#334155', border: '#cbd5e1' };
                  const depositAmount = Math.round(Number(b.total_price) * 0.3);
                  const isBooked = b.status === 'booked';
                  const isInUse = b.status === 'checked_in' || b.status === 'using';

                  return (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={tdStyle}>
                        <strong>#{b.id}</strong>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 'bold', fontSize: 15, color: '#0f172a' }}>
                          Phòng {b.room_number}
                        </div>
                        <small style={{ color: b.room_type === 'vip' ? '#b45309' : '#64748b', fontWeight: 600 }}>
                          {b.room_type === 'vip' ? '★ VIP' : 'Thường'}
                        </small>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600 }}>{b.guest_name || b.full_name}</div>
                        <div style={{ color: '#64748b', fontSize: 13 }}>📞 {b.phone}</div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontSize: 13 }}>Nhận: <strong>{b.check_in}</strong></div>
                        <div style={{ fontSize: 13, color: '#64748b' }}>Trả: {b.check_out}</div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 'bold' }}>{formatVND(b.total_price)}</div>
                        <div style={{ fontSize: 12, marginTop: 4 }}>
                          {b.is_deposited ? (
                            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>
                              ✓ Đã cọc: {formatVND(depositAmount)}
                            </span>
                          ) : (
                            <span style={{ color: '#d97706', fontWeight: 600 }}>
                              ⚠️ Chưa cọc: {formatVND(depositAmount)}
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
                            <strong>🛑 Lý do huỷ:</strong> {b.cancel_reason || 'Khách không đồng ý cọc hoặc đã huỷ'}
                          </div>
                        )}

                        {isBooked && b.is_reminded && (
                          <div style={{ fontSize: 11, color: '#b45309', marginTop: 4 }}>
                            📢 Đã gửi thông báo nhắc cọc
                          </div>
                        )}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 6, minWidth: 150 }}>
                          {isBooked && (
                            currentUser?.role === 'cleaner' ? (
                              <span style={{ color: '#94a3b8', fontSize: 12, fontStyle: 'italic' }}>
                                Chỉ lễ tân được nhận/huỷ phòng
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleCheckin(b.id)}
                                  style={{
                                    background: '#16a34a',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '6px 12px',
                                    borderRadius: 6,
                                    fontWeight: 'bold',
                                    fontSize: 12,
                                    cursor: 'pointer'
                                  }}
                                >
                                  🔑 Nhận Phòng (Check-in)
                                </button>

                                {!b.is_deposited && (
                                  <button
                                    onClick={() => setRemindModal({ open: true, bookingId: b.id, message: '' })}
                                    style={{
                                      background: '#fff',
                                      color: '#d97706',
                                      border: '1px solid #fcd34d',
                                      padding: '5px 10px',
                                      borderRadius: 6,
                                      fontWeight: 600,
                                      fontSize: 12,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    📢 Nhắc khách cọc tiền
                                  </button>
                                )}

                                <button
                                  onClick={() => setCancelModal({ open: true, bookingId: b.id, reason: '' })}
                                  style={{
                                    background: '#fff',
                                    color: '#dc2626',
                                    border: '1px solid #fca5a5',
                                    padding: '5px 10px',
                                    borderRadius: 6,
                                    fontWeight: 600,
                                    fontSize: 12,
                                    cursor: 'pointer'
                                  }}
                                >
                                  🛑 Huỷ phòng (Không cọc)
                                </button>
                              </>
                            )
                          )}

                          {isInUse && (
                            currentUser?.role === 'cleaner' ? (
                              <span style={{ color: '#94a3b8', fontSize: 12, fontStyle: 'italic' }}>
                                Chỉ lễ tân được trả phòng
                              </span>
                            ) : (
                              <button
                                onClick={() => handleCheckout(b.id)}
                                style={{
                                  background: '#7c3aed',
                                  color: '#fff',
                                  border: 'none',
                                  padding: '8px 14px',
                                  borderRadius: 6,
                                  fontWeight: 'bold',
                                  fontSize: 12,
                                  cursor: 'pointer'
                                }}
                              >
                                🚪 Trả Phòng (Check-out)
                              </button>
                            )
                          )}

                          {b.status === 'checked_out' && (
                            <span style={{ color: '#6b21a8', fontSize: 12, fontWeight: 'bold' }}>
                              ✓ Đã hoàn tất trả phòng
                            </span>
                          )}

                          {b.status === 'cancelled' && (
                            <span style={{ color: '#991b1b', fontSize: 12 }}>
                              Đơn đã đóng
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= MODAL HUỶ PHÒNG KÈM LÝ DO ================= */}
      {cancelModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              maxWidth: 480,
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
            }}
          >
            <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#dc2626' }}>
              🛑 Xác Nhận Huỷ Phòng Đơn #{cancelModal.bookingId}
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
              Vui lòng chọn hoặc nhập nguyên nhân huỷ phòng để lưu vào lịch sử Web Tổng:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              <button
                type="button"
                onClick={() => setCancelModal((prev) => ({ ...prev, reason: 'Khách không đồng ý chuyển khoản tiền cọc 30%' }))}
                style={quickReasonBtnStyle}
              >
                👉 "Khách không đồng ý chuyển khoản tiền cọc 30%"
              </button>
              <button
                type="button"
                onClick={() => setCancelModal((prev) => ({ ...prev, reason: 'Đã quá hạn giữ phòng nhưng khách không liên lạc được' }))}
                style={quickReasonBtnStyle}
              >
                👉 "Quá hạn cọc nhưng không liên lạc được khách"
              </button>
              <button
                type="button"
                onClick={() => setCancelModal((prev) => ({ ...prev, reason: 'Khách báo thay đổi lịch trình đột xuất' }))}
                style={quickReasonBtnStyle}
              >
                👉 "Khách báo thay đổi lịch trình đột xuất"
              </button>
            </div>

            <textarea
              placeholder="Hoặc nhập lý do huỷ cụ thể tại đây..."
              rows={3}
              value={cancelModal.reason}
              onChange={(e) => setCancelModal((prev) => ({ ...prev, reason: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box', marginBottom: 16 }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setCancelModal({ open: false, bookingId: null, reason: '' })}
                style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#dc2626', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Huỷ Phòng Ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL NHẮC CỌC ================= */}
      {remindModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              maxWidth: 480,
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
            }}
          >
            <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#d97706' }}>
              📢 Gửi Thông Báo Nhắc Cọc Cho Khách (Đơn #{remindModal.bookingId})
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
              Thông báo sẽ được ghi lại trong nhật ký giao dịch của đơn phòng:
            </p>

            <textarea
              placeholder="Kính mời quý khách chuyển khoản tiền cọc 30% để khách sạn giữ phòng..."
              rows={3}
              value={remindModal.message}
              onChange={(e) => setRemindModal((prev) => ({ ...prev, message: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box', marginBottom: 16 }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setRemindModal({ open: false, bookingId: null, message: '' })}
                style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleConfirmRemind}
                style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#d97706', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Gửi Nhắc Cọc
              </button>
            </div>
          </div>
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

const quickReasonBtnStyle = {
  background: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#991b1b',
  padding: '6px 10px',
  borderRadius: 6,
  fontSize: 12,
  cursor: 'pointer',
  textAlign: 'left'
};