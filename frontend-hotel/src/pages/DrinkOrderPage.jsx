import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getDrinkMenu, createDrinkOrder, getDrinkOrder, sendOrderReminder } from '../services/api.js';

const STATUS_CONFIG = {
  pending: { label: '⏳ Chờ tiếp tân xác nhận', bg: '#fef3c7', color: '#b45309', step: 1 },
  confirmed: { label: '👨‍🍳 Tiếp tân đã nhận & Chuẩn bị', bg: '#dbeafe', color: '#1d4ed8', step: 2 },
  delivering: { label: '🛵 Đang mang lên phòng', bg: '#e0e7ff', color: '#4338ca', step: 3 },
  completed: { label: '✅ Đã giao thành công', bg: '#dcfce7', color: '#15803d', step: 4 },
  cancelled: { label: '❌ Đã huỷ', bg: '#fee2e2', color: '#b91c1c', step: 0 }
};

export default function DrinkOrderPage() {
  const [searchParams] = useSearchParams();
  const hotelId = searchParams.get('hotelId') || '1';

  const [drinks, setDrinks] = useState([]);
  const [cart, setCart] = useState({}); // { [drinkId]: quantity }
  const [roomNumber, setRoomNumber] = useState('');
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Đơn hàng đang theo dõi sau khi đặt
  const [activeOrder, setActiveOrder] = useState(null);
  const [reminderMsg, setReminderMsg] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  const formatVND = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  // Tải danh sách đồ uống
  useEffect(() => {
    getDrinkMenu()
      .then((data) => {
        setDrinks(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Tự động làm mới trạng thái đơn hàng mỗi 5 giây nếu đang có đơn hoạt động
  useEffect(() => {
    if (!activeOrder || activeOrder.status === 'completed' || activeOrder.status === 'cancelled') return;

    const interval = setInterval(() => {
      getDrinkOrder(activeOrder.id)
        .then((updated) => setActiveOrder(updated))
        .catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, [activeOrder]);

  function handleQuantityChange(drinkId, delta) {
    setCart((prev) => {
      const current = prev[drinkId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[drinkId];
        return copy;
      }
      return { ...prev, [drinkId]: next };
    });
  }

  // Tính tổng số lượng và tổng tiền
  const totalItemsCount = Object.values(cart).reduce((sum, q) => sum + q, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = drinks.find((d) => String(d.id) === String(id));
    return sum + (item ? item.price * qty : 0);
  }, 0);

  async function handleOrderSubmit(e) {
    e.preventDefault();
    if (!roomNumber.trim()) {
      alert('Vui lòng nhập số phòng bạn đang ở!');
      return;
    }
    if (totalItemsCount === 0) {
      alert('Vui lòng chọn ít nhất 1 loại đồ uống!');
      return;
    }

    setSubmitting(true);
    setError('');

    const items = Object.entries(cart).map(([drinkId, quantity]) => ({
      drink_id: Number(drinkId),
      quantity
    }));

    try {
      const res = await createDrinkOrder({
        hotel_id: Number(hotelId),
        room_number: roomNumber.trim(),
        guest_name: guestName.trim() || `Phòng ${roomNumber.trim()}`,
        phone: phone.trim(),
        note: note.trim(),
        items
      });

      setActiveOrder(res.order);
      setCart({});
      setSubmitting(false);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  // Gửi tin nhắn giục tiếp tân khi chờ lâu
  async function handleSendReminder(customText) {
    const textToSend = customText || reminderMsg;
    if (!textToSend || !textToSend.trim() || !activeOrder) return;

    setSendingMsg(true);
    try {
      await sendOrderReminder(
        activeOrder.id,
        textToSend.trim(),
        `Phòng ${activeOrder.room_number}`
      );
      // Tải lại đơn để thấy tin nhắn
      const updated = await getDrinkOrder(activeOrder.id);
      setActiveOrder(updated);
      setReminderMsg('');
      setSendingMsg(false);
    } catch (err) {
      alert('Lỗi gửi tin nhắn: ' + err.message);
      setSendingMsg(false);
    }
  }

  if (loading) return <p style={{ padding: 20, textAlign: 'center' }}>Đang tải menu đồ uống...</p>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 40 }}>
      {/* Tiêu đề */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 28, color: '#1e3a8a' }}>
          🥤 Dịch Vụ Gọi Đồ Uống Tận Phòng (Room Service)
        </h1>
        <p style={{ margin: 0, color: '#475569', fontSize: 15 }}>
          Chỉ cần chọn đồ uống &amp; nhập số phòng — Tiếp tân sẽ nhận đơn và giao lên tận phòng ngay cho bạn!
        </p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 8, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* ================= NẾU ĐANG CÓ ĐƠN HÀNG VỪA ĐẶT ================= */}
      {activeOrder && (
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '2px solid #3b82f6',
            padding: 24,
            marginBottom: 32,
            boxShadow: '0 4px 12px rgba(37,99,235,0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, borderBottom: '1px solid #e2e8f0', paddingBottom: 14, marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 13, background: '#eff6ff', color: '#2563eb', padding: '3px 8px', borderRadius: 4, fontWeight: 'bold' }}>
                ĐƠN ĐỒ UỐNG #{activeOrder.id}
              </span>
              <h2 style={{ margin: '6px 0 0', fontSize: 20, color: '#0f172a' }}>
                Phòng {activeOrder.room_number} — {activeOrder.hotel_name || `Khách sạn #${activeOrder.hotel_id}`}
              </h2>
            </div>

            <div style={{ textAlign: 'right' }}>
              {(() => {
                const cfg = STATUS_CONFIG[activeOrder.status] || STATUS_CONFIG.pending;
                return (
                  <span
                    style={{
                      background: cfg.bg,
                      color: cfg.color,
                      padding: '6px 14px',
                      borderRadius: 20,
                      fontWeight: 'bold',
                      fontSize: 14,
                      display: 'inline-block'
                    }}
                  >
                    {cfg.label}
                  </span>
                );
              })()}
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                Đặt lúc: {activeOrder.created_at}
              </div>
            </div>
          </div>

          {/* Chi tiết các món đã gọi */}
          <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: '#334155' }}>
              Danh sách đồ uống đã gọi:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {activeOrder.items?.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span>
                    • <strong>{item.drink_name}</strong> × {item.quantity}
                  </span>
                  <span style={{ fontWeight: 600 }}>{formatVND(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', marginTop: 10, paddingTop: 10, fontWeight: 'bold', fontSize: 16, color: '#1e3a8a' }}>
              <span>Tổng tiền thanh toán tại phòng:</span>
              <span>{formatVND(activeOrder.total_price)}</span>
            </div>
            {activeOrder.note && (
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 6, fontStyle: 'italic' }}>
                Ghi chú: {activeOrder.note}
              </div>
            )}
          </div>

          {/* ================= PHẦN NHẮN TIN GIỤC TIẾP TÂN NẾU CHỜ LÂU ================= */}
          <div
            style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 10,
              padding: 16,
              marginBottom: 16
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>📢</span>
              <div>
                <h4 style={{ margin: 0, color: '#92400e', fontSize: 15 }}>
                  Chưa thấy đồ uống giao lên? Nhắn tin giục Tiếp tân ngay:
                </h4>
                <small style={{ color: '#b45309' }}>
                  Tiếp tân sẽ lập tức thấy thông báo đỏ trên màn hình làm việc để kiểm tra và mang lên phòng.
                </small>
              </div>
            </div>

            {/* Các mẫu tin nhắn giục nhanh */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => handleSendReminder('Tôi đã chờ hơn 10 phút rồi chưa thấy nước, vui lòng mang lên gấp!')}
                style={quickBtnStyle}
              >
                ⏱️ "Đã chờ hơn 10 phút chưa thấy nước"
              </button>
              <button
                type="button"
                onClick={() => handleSendReminder('Nước đã chuẩn bị xong chưa ạ? Phòng đang cần gấp.')}
                style={quickBtnStyle}
              >
                🔔 "Nước đã xong chưa? Đang cần gấp"
              </button>
              <button
                type="button"
                onClick={() => handleSendReminder('Cho mình xin thêm ít đá lạnh và ly nhé!')}
                style={quickBtnStyle}
              >
                🧊 "Cho xin thêm đá lạnh &amp; ly"
              </button>
            </div>

            {/* Ô nhập tin nhắn tuỳ ý */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                placeholder="Nhập nội dung tin nhắn gửi tiếp tân..."
                value={reminderMsg}
                onChange={(e) => setReminderMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendReminder()}
                style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
              <button
                type="button"
                onClick={() => handleSendReminder()}
                disabled={sendingMsg || !reminderMsg.trim()}
                style={{
                  background: '#d97706',
                  color: '#fff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: 14
                }}
              >
                {sendingMsg ? 'Đang gửi...' : 'Gửi tiếp tân'}
              </button>
            </div>

            {/* Lịch sử tin nhắn trao đổi của đơn này */}
            {activeOrder.messages && activeOrder.messages.length > 0 && (
              <div style={{ marginTop: 14, borderTop: '1px solid #fef3c7', paddingTop: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#78350f', marginBottom: 6 }}>
                  Hộp tin nhắn trao đổi với tiếp tân:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 160, overflowY: 'auto' }}>
                  {activeOrder.messages.map((m) => {
                    const isStaff = m.sender_type === 'staff';
                    return (
                      <div
                        key={m.id}
                        style={{
                          alignSelf: isStaff ? 'flex-start' : 'flex-end',
                          background: isStaff ? '#dbeafe' : '#fef3c7',
                          color: isStaff ? '#1e3a8a' : '#78350f',
                          padding: '6px 12px',
                          borderRadius: 8,
                          maxWidth: '85%',
                          fontSize: 13
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 'bold', opacity: 0.8, marginBottom: 2 }}>
                          {m.sender_name || (isStaff ? 'Lễ tân' : 'Khách')} • {m.created_at}
                        </div>
                        <div>{m.message}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveOrder(null)}
            style={{
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
              padding: '8px 16px',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13
            }}
          >
            ➕ Đặt thêm đơn khác
          </button>
        </div>
      )}

      {/* ================= FORM CHỌN ĐỒ UỐNG VÀ ĐẶT ================= */}
      <form onSubmit={handleOrderSubmit}>
        {/* Thông tin phòng & khách */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            padding: 20,
            marginBottom: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <h3 style={{ margin: '0 0 16px', fontSize: 17, color: '#0f172a' }}>
            1. Điền thông tin phòng nhận đồ uống
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div>
              <label style={labelStyle}>
                Số phòng của bạn: <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                placeholder="Ví dụ: 101, 202, 301..."
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Họ và tên khách (Tùy chọn):</label>
              <input
                placeholder="Ví dụ: Nguyễn Văn A"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Số điện thoại (Tùy chọn):</label>
              <input
                placeholder="Số điện thoại liên hệ"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <label style={labelStyle}>Ghi chú thêm cho tiếp tân:</label>
            <input
              placeholder="Ví dụ: Cho nhiều đá, lấy thêm 2 ly, để trước cửa phòng..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Menu danh sách 5 món đồ uống */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 17, color: '#0f172a' }}>
            2. Chọn loại đồ uống &amp; số lượng ({drinks.length} loại nước sẵn có)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {drinks.map((drink) => {
              const qty = cart[drink.id] || 0;
              return (
                <div
                  key={drink.id}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    border: qty > 0 ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    overflow: 'hidden',
                    boxShadow: qty > 0 ? '0 4px 12px rgba(37,99,235,0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s'
                  }}
                >
                  <div
                    style={{
                      height: 190,
                      background: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 12,
                      borderBottom: '1px solid #f1f5f9'
                    }}
                  >
                    <img
                      src={drink.image_url}
                      alt={drink.name}
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.src = '/drinks/teaplus.webp';
                      }}
                    />
                  </div>

                  <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: 11, background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                        {drink.category}
                      </span>
                      <h4 style={{ margin: '8px 0 6px', fontSize: 16, color: '#0f172a' }}>{drink.name}</h4>
                      <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.4 }}>
                        {drink.description}
                      </p>
                    </div>

                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 17, fontWeight: 'bold', color: '#dc2626' }}>
                        {formatVND(drink.price)}
                      </div>

                      {/* Bộ điều khiển số lượng */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(drink.id, -1)}
                          disabled={qty === 0}
                          style={qtyBtnStyle(qty === 0)}
                        >
                          -
                        </button>
                        <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(drink.id, 1)}
                          style={qtyBtnStyle(false, true)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= THANH TỔNG TIỀN VÀ XÁC NHẬN ĐẶT ================= */}
        <div
          style={{
            position: 'sticky',
            bottom: 20,
            background: '#1e3a8a',
            color: '#fff',
            borderRadius: 14,
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 100
          }}
        >
          <div>
            <div style={{ fontSize: 14, color: '#bfdbfe' }}>
              Đã chọn: <strong>{totalItemsCount} món</strong> {roomNumber ? `| Phòng: ${roomNumber}` : ''}
            </div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>
              Tổng tiền: {formatVND(totalPrice)}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || totalItemsCount === 0}
            style={{
              background: totalItemsCount > 0 ? '#10b981' : '#64748b',
              color: '#fff',
              border: 'none',
              padding: '12px 28px',
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 'bold',
              cursor: totalItemsCount > 0 ? 'pointer' : 'not-allowed',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
            }}
          >
            {submitting ? 'Đang gửi đơn...' : '🚀 XÁC NHẬN ĐẶT ĐỒ UỐNG'}
          </button>
        </div>
      </form>
    </div>
  );
}

const labelStyle = { display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#334155' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' };

function qtyBtnStyle(disabled, isPlus) {
  return {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: 'none',
    background: disabled ? '#f1f5f9' : isPlus ? '#2563eb' : '#e2e8f0',
    color: disabled ? '#94a3b8' : isPlus ? '#fff' : '#0f172a',
    fontSize: 18,
    fontWeight: 'bold',
    cursor: disabled ? 'default' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
}

const quickBtnStyle = {
  background: '#fff',
  border: '1px solid #fcd34d',
  color: '#92400e',
  padding: '6px 12px',
  borderRadius: 6,
  fontSize: 12,
  cursor: 'pointer',
  fontWeight: 600
};
