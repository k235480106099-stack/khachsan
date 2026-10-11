import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { cancelBooking } from '../services/api.js';

export default function CancelBooking() {
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const hotelId = searchParams.get('hotelId');
  const navigate = useNavigate();

  const [reasonOption, setReasonOption] = useState('Thay đổi lịch trình cá nhân');
  const [customReason, setCustomReason] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleCancel() {
    setError('');
    const finalReason = reasonOption === 'Khác' ? (customReason.trim() || 'Khách huỷ không nêu lý do') : reasonOption;
    try {
      await cancelBooking(bookingId, finalReason);
      setDone(true);
    } catch (err) {
      setError(err.message);
    }
  }

  if (done) {
    return (
      <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
        <h2 style={{ color: '#16a34a', margin: '0 0 12px' }}>Đã huỷ đặt phòng thành công</h2>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
          Đơn #{bookingId} đã được huỷ. Phòng đã được mở lại trên hệ thống.
        </p>
        <button
          onClick={() => navigate(`/history?hotelId=${hotelId || ''}`)}
          style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}
        >
          Quay lại lịch sử đặt phòng
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
      <h2 style={{ marginTop: 0, color: '#dc2626' }}>Huỷ đặt phòng #{bookingId}</h2>
      <p style={{ color: '#475569', fontSize: 14 }}>
        Bạn có chắc chắn muốn huỷ đơn đặt phòng này không? Vui lòng chọn lý do huỷ phòng bên dưới:
      </p>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#334155' }}>
          Nguyên nhân huỷ phòng:
        </label>
        <select
          value={reasonOption}
          onChange={(e) => setReasonOption(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
        >
          <option value="Thay đổi lịch trình cá nhân">Thay đổi lịch trình / kế hoạch cá nhân</option>
          <option value="Không đồng ý chuyển khoản tiền cọc">Không đồng ý chuyển khoản tiền cọc</option>
          <option value="Tìm được khách sạn hoặc phòng khác phù hợp hơn">Tìm được khách sạn hoặc phòng khác phù hợp hơn</option>
          <option value="Đặt nhầm ngày hoặc nhầm loại phòng">Đặt nhầm ngày hoặc nhầm loại phòng</option>
          <option value="Khác">Lý do khác (tự nhập)</option>
        </select>
      </div>

      {reasonOption === 'Khác' && (
        <div style={{ marginBottom: 16 }}>
          <textarea
            placeholder="Nhập chi tiết lý do huỷ..."
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, minHeight: 80, boxSizing: 'border-box' }}
          />
        </div>
      )}

      {error && <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ flex: 1, padding: '10px 16px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
        >
          Quay lại
        </button>
        <button
          onClick={handleCancel}
          style={{ flex: 1, background: '#dc2626', color: '#fff', padding: '10px 16px', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
        >
          Xác nhận huỷ
        </button>
      </div>
    </div>
  );
}