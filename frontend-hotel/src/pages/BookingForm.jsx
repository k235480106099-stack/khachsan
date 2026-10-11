import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { createBooking, confirmDeposit, getRoomsByHotel } from '../services/api.js';

export default function BookingForm() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const hotelId = searchParams.get('hotelId') || '1';
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    check_in: '',
    check_out: ''
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [depositConfirmed, setDepositConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Tải thông tin phòng để tính giá và hiển thị
  useEffect(() => {
    getRoomsByHotel(hotelId)
      .then((rooms) => {
        const found = rooms.find((r) => String(r.id) === String(roomId));
        if (found) setRoom(found);
      })
      .catch((err) => console.error(err));
  }, [hotelId, roomId]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Tính số đêm và tiền tạm tính
  let stayNights = 1;
  let estimatedTotal = room ? Number(room.price) : 0;
  let estimatedDeposit = Math.round(estimatedTotal * 0.3);

  if (form.check_in && form.check_out) {
    const start = new Date(form.check_in);
    const end = new Date(form.check_out);
    const diff = Math.max(0, end - start);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    stayNights = Math.max(1, days);
    estimatedTotal = (room ? Number(room.price) : 0) * stayNights;
    estimatedDeposit = Math.round(estimatedTotal * 0.3);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await createBooking({ room_id: Number(roomId), ...form });
      setBookingResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmDeposit() {
    if (!bookingResult?.bookingId) return;
    try {
      await confirmDeposit(bookingResult.bookingId, bookingResult.deposit_amount);
      setDepositConfirmed(true);
    } catch (err) {
      alert(err.message);
    }
  }

  function handleCopySyntax() {
    const text = `COC ${bookingResult?.bookingId} ${form.phone}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const formatVND = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  // ==================== BƯỚC 2: MÀN HÌNH QUÉT MÃ QR ĐẶT CỌC ====================
  if (bookingResult) {
    const depositAmount = bookingResult.deposit_amount || Math.round(bookingResult.total_price * 0.3);
    const transferSyntax = `COC ${bookingResult.bookingId} ${form.phone}`;

    return (
      <div style={{ maxWidth: 760, margin: '0 auto', background: '#fff', borderRadius: 16, padding: '32px 28px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24, borderBottom: '1px solid #f1f5f9', paddingBottom: 20 }}>
          <span style={{ fontSize: 48 }}>💳</span>
          <h2 style={{ margin: '8px 0 6px', color: '#1e3a8a', fontSize: 24 }}>Thanh Toán Tiền Cọc Phòng</h2>
          <p style={{ margin: 0, color: '#4b5563', fontSize: 14 }}>
            Đơn đặt phòng <strong>#{bookingResult.bookingId}</strong> đã được tạo. Quý khách vui lòng quét mã QR bên dưới để cọc <strong>30%</strong> giữ phòng.
          </p>
        </div>

        {depositConfirmed ? (
          <div style={{ background: '#ecfdf5', border: '2px solid #10b981', borderRadius: 12, padding: 24, textAlign: 'center', marginBottom: 24 }}>
            <span style={{ fontSize: 48 }}>🎉</span>
            <h3 style={{ color: '#047857', margin: '8px 0' }}>Xác Nhận Đặt Cọc Thành Công!</h3>
            <p style={{ color: '#065f46', fontSize: 14, margin: '4px 0 16px' }}>
              Khách sạn đã ghi nhận tiền cọc của bạn. Nhân viên lễ tân sẽ liên hệ kiểm tra và giữ phòng sẵn sàng khi bạn đến nhận phòng.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => navigate(`/rooms?hotelId=${hotelId}`)}
                style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}
              >
                Quay lại danh sách phòng
              </button>
              <Link
                to={`/history?hotelId=${hotelId}`}
                style={{ background: '#f3f4f6', color: '#1f2937', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}
              >
                Tra cứu đơn đặt phòng
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28, alignItems: 'center' }}>
            {/* Cột 1: Mã QR thanh toán */}
            <div style={{ textAlign: 'center', background: '#f8fafc', padding: 20, borderRadius: 12, border: '2px dashed #3b82f6' }}>
              <div style={{ fontWeight: 'bold', color: '#1e3a8a', marginBottom: 12, fontSize: 15 }}>
                📱 QUÉT MÃ QR ĐỂ CHUYỂN KHOẢN CỌC
              </div>

              <div style={{ background: '#fff', padding: 12, borderRadius: 10, display: 'inline-block', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <img
                  src="/qr-deposit.png"
                  alt="Mã QR thanh toán đặt cọc"
                  style={{ width: 220, height: 220, objectFit: 'contain', display: 'block' }}
                />
              </div>

              <p style={{ fontSize: 12, color: '#64748b', margin: '12px 0 0' }}>
                Hỗ trợ: Mọi App Ngân Hàng (Vietcombank, MB, Techcombank, ...) &amp; Ví MoMo
              </p>
            </div>

            {/* Cột 2: Chi tiết tiền cọc & Hướng dẫn */}
            <div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: '#166534', marginBottom: 4 }}>Số tiền cọc cần chuyển (30%):</div>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: '#15803d' }}>
                  {formatVND(depositAmount)}
                </div>
                <small style={{ color: '#166534' }}>
                  (Tổng giá phòng: {formatVND(bookingResult.total_price)} — Còn lại thanh toán khi nhận phòng)
                </small>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, marginBottom: 18, fontSize: 13 }}>
                <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Mã đặt phòng:</span>
                  <strong>#{bookingResult.bookingId}</strong>
                </div>
                <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Khách hàng:</span>
                  <strong>{form.full_name} ({form.phone})</strong>
                </div>
                <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Phòng đặt:</span>
                  <strong>Phòng {bookingResult.room_number} ({bookingResult.room_type === 'vip' ? 'VIP' : 'Thường'})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: 8 }}>
                  <span style={{ color: '#64748b' }}>Nội dung chuyển khoản:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <code style={{ background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: 4, fontWeight: 'bold' }}>
                      {transferSyntax}
                    </code>
                    <button
                      onClick={handleCopySyntax}
                      style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}
                    >
                      {copied ? '✓ Đã chép' : 'Sao chép'}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleConfirmDeposit}
                style={{
                  width: '100%',
                  background: '#15803d',
                  color: '#fff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: 8,
                  fontWeight: 'bold',
                  fontSize: 16,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(21, 128, 61, 0.3)'
                }}
              >
                ✅ Tôi Đã Chuyển Khoản Cọc Xong
              </button>

              <button
                onClick={() => navigate(`/rooms?hotelId=${hotelId}`)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  color: '#6b7280',
                  border: 'none',
                  marginTop: 10,
                  padding: '8px',
                  cursor: 'pointer',
                  fontSize: 13
                }}
              >
                Để sau / Quay lại danh sách phòng
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==================== BƯỚC 1: FORM ĐIỀN THÔNG TIN ĐẶT PHÒNG ====================
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', background: '#fff', borderRadius: 16, padding: '28px 32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
      <div style={{ marginBottom: 20 }}>
        <Link to={`/rooms?hotelId=${hotelId}`} style={{ color: '#2563eb', textDecoration: 'none', fontSize: 13 }}>
          ← Quay lại danh sách phòng
        </Link>
        <h2 style={{ margin: '8px 0 4px', color: '#0f172a' }}>
          Đặt Phòng #{room ? room.room_number : roomId} {room?.type === 'vip' ? '⭐ (VIP)' : '(Thường)'}
        </h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
          Điền thông tin lưu trú của bạn. Sau khi bấm xác nhận, hệ thống sẽ mở mã QR thanh toán cọc 30% giữ phòng.
        </p>
      </div>

      {room && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, color: '#64748b' }}>Đơn giá:</div>
            <div style={{ fontSize: 16, fontWeight: 'bold', color: '#1e3a8a' }}>{formatVND(room.price)} / đêm</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: '#64748b' }}>Thời gian tính:</div>
            <div style={{ fontSize: 14, fontWeight: 'bold' }}>{stayNights} đêm</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: '#64748b' }}>Tiền cọc giữ phòng (30%):</div>
            <div style={{ fontSize: 16, fontWeight: 'bold', color: '#15803d' }}>{formatVND(estimatedDeposit)}</div>
          </div>
        </div>
      )}

      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
            Họ và tên khách hàng *
          </label>
          <input
            name="full_name"
            placeholder="Ví dụ: Nguyễn Văn An"
            value={form.full_name}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
            Số điện thoại nhận xác nhận *
          </label>
          <input
            name="phone"
            placeholder="Ví dụ: 0912345678"
            value={form.phone}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
            Email liên hệ (không bắt buộc)
          </label>
          <input
            name="email"
            type="email"
            placeholder="Ví dụ: an.nguyen@gmail.com"
            value={form.email}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
              Ngày nhận phòng *
            </label>
            <input
              type="datetime-local"
              name="check_in"
              value={form.check_in}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
              Ngày trả phòng *
            </label>
            <input
              type="datetime-local"
              name="check_out"
              value={form.check_out}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
        </div>

        {/* Thông báo cọc phòng */}
        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: 12, fontSize: 13, color: '#92400e', marginTop: 4 }}>
          ℹ️ <strong>Quy định đặt phòng:</strong> Sau khi gửi thông tin, quý khách sẽ quét mã QR ngân hàng để thanh toán tiền cọc <strong>30% ({formatVND(estimatedDeposit)})</strong> để được giữ phòng chính thức.
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: 8,
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            padding: '14px',
            borderRadius: 8,
            fontWeight: 'bold',
            fontSize: 16,
            cursor: 'pointer'
          }}
        >
          {submitting ? 'Đang khởi tạo đơn...' : 'Tiếp Tục Đặt Cọc & Hoàn Tất Giữ Phòng →'}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #cbd5e1',
  boxSizing: 'border-box',
  fontSize: 14
};