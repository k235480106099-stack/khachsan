import { useEffect, useState } from 'react';
import { useHotel } from '../context/HotelContext.jsx';
import {
  getDrinkOrdersByHotel,
  updateDrinkOrderStatus,
  sendDrinkOrderMessage,
  getDrinkOrderMessages,
  getCurrentUser
} from '../services/api.js';

const STATUS_MAP = {
  pending: { label: '⏳ Chờ xác nhận', bg: '#fef3c7', color: '#b45309', border: '#fcd34d' },
  confirmed: { label: '👨‍🍳 Đã nhận đơn & Chuẩn bị', bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' },
  delivering: { label: '🛵 Đang mang lên phòng', bg: '#e0e7ff', color: '#4338ca', border: '#a5b4fc' },
  completed: { label: '✅ Đã giao thành công', bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  cancelled: { label: '❌ Đã huỷ', bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' }
};

export default function DrinkOrdersManagement() {
  const { hotelId, currentHotel } = useHotel();
  const currentUser = getCurrentUser();

  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal chat trao đổi tin nhắn với khách
  const [chatModal, setChatModal] = useState({
    open: false,
    order: null,
    messages: [],
    replyText: '',
    sending: false
  });

  function loadOrders() {
    getDrinkOrdersByHotel(hotelId)
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }

  // Tải dữ liệu ban đầu và tự động làm mới mỗi 4 giây (polling realtime)
  useEffect(() => {
    setLoading(true);
    loadOrders();

    const interval = setInterval(() => {
      getDrinkOrdersByHotel(hotelId)
        .then((data) => setOrders(data))
        .catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, [hotelId]);

  const formatVND = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  // Xử lý chuyển trạng thái đơn hàng
  async function handleStatusChange(orderId, newStatus) {
    try {
      await updateDrinkOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (err) {
      alert('Lỗi cập nhật: ' + err.message);
    }
  }

  // Mở modal chat với khách
  async function openChatModal(order) {
    setChatModal({
      open: true,
      order,
      messages: order.messages || [],
      replyText: '',
      sending: false
    });

    try {
      const msgs = await getDrinkOrderMessages(order.id);
      setChatModal((prev) => ({ ...prev, messages: msgs }));
    } catch {
      // Giữ nguyên tin nhắn hiện có
    }
  }

  // Gửi tin nhắn trả lời khách
  async function handleSendReply(customReply) {
    const text = customReply || chatModal.replyText;
    if (!text || !text.trim() || !chatModal.order) return;

    setChatModal((prev) => ({ ...prev, sending: true }));
    try {
      const staffName = currentUser?.full_name || 'Lễ tân';
      await sendDrinkOrderMessage(chatModal.order.id, text.trim(), staffName);

      const msgs = await getDrinkOrderMessages(chatModal.order.id);
      setChatModal((prev) => ({
        ...prev,
        messages: msgs,
        replyText: '',
        sending: false
      }));

      loadOrders();
    } catch (err) {
      alert('Lỗi gửi tin nhắn: ' + err.message);
      setChatModal((prev) => ({ ...prev, sending: false }));
    }
  }

  // Lọc danh sách theo trạng thái
  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'has_message') return (o.messages && o.messages.length > 0);
    return o.status === statusFilter;
  });

  // Thống kê nhanh
  const countPending = orders.filter((o) => o.status === 'pending').length;
  const countConfirmed = orders.filter((o) => o.status === 'confirmed').length;
  const countDelivering = orders.filter((o) => o.status === 'delivering').length;
  const countCompleted = orders.filter((o) => o.status === 'completed').length;
  const countHasMessage = orders.filter((o) => o.messages && o.messages.length > 0).length;

  return (
    <div>
      {/* Tiêu đề trang */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 24, color: '#0f172a' }}>
            🥤 Quản Lý Đơn Gọi Đồ Uống Tận Phòng (Room Service)
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
            Tiếp nhận yêu cầu từ khách tại <strong>{currentHotel?.name}</strong> • Tự động cập nhật mỗi 4 giây
          </p>
        </div>

        <button
          onClick={loadOrders}
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 20 }}>
        <div style={statBox('#f59e0b', countPending > 0)}>
          <div style={{ fontSize: 13, color: '#64748b' }}>Chờ Tiếp Nhận</div>
          <div style={{ fontSize: 22, fontWeight: 'bold', color: '#b45309', marginTop: 4 }}>
            {countPending} {countPending > 0 ? '🔔' : ''}
          </div>
        </div>
        <div style={statBox('#3b82f6')}>
          <div style={{ fontSize: 13, color: '#64748b' }}>Đang Chuẩn Bị</div>
          <div style={{ fontSize: 22, fontWeight: 'bold', color: '#1d4ed8', marginTop: 4 }}>{countConfirmed}</div>
        </div>
        <div style={statBox('#6366f1')}>
          <div style={{ fontSize: 13, color: '#64748b' }}>Đang Mang Lên</div>
          <div style={{ fontSize: 22, fontWeight: 'bold', color: '#4338ca', marginTop: 4 }}>{countDelivering}</div>
        </div>
        <div style={statBox('#10b981')}>
          <div style={{ fontSize: 13, color: '#64748b' }}>Đã Giao Xong</div>
          <div style={{ fontSize: 22, fontWeight: 'bold', color: '#15803d', marginTop: 4 }}>{countCompleted}</div>
        </div>
        <div style={statBox('#ef4444', countHasMessage > 0)}>
          <div style={{ fontSize: 13, color: '#64748b' }}>Tin Nhắn / Giục Đơn</div>
          <div style={{ fontSize: 22, fontWeight: 'bold', color: '#dc2626', marginTop: 4 }}>
            {countHasMessage} {countHasMessage > 0 ? '💬' : ''}
          </div>
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
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setStatusFilter('all')}
            style={filterBtnStyle(statusFilter === 'all')}
          >
            Tất cả đơn ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            style={filterBtnStyle(statusFilter === 'pending', '#b45309')}
          >
            Chờ xác nhận ({countPending})
          </button>
          <button
            onClick={() => setStatusFilter('confirmed')}
            style={filterBtnStyle(statusFilter === 'confirmed', '#1d4ed8')}
          >
            Đang chuẩn bị ({countConfirmed})
          </button>
          <button
            onClick={() => setStatusFilter('delivering')}
            style={filterBtnStyle(statusFilter === 'delivering', '#4338ca')}
          >
            Đang giao ({countDelivering})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            style={filterBtnStyle(statusFilter === 'completed', '#15803d')}
          >
            Đã giao ({countCompleted})
          </button>
          <button
            onClick={() => setStatusFilter('has_message')}
            style={filterBtnStyle(statusFilter === 'has_message', '#dc2626')}
          >
            💬 Có tin nhắn giục ({countHasMessage})
          </button>
        </div>

        <small style={{ color: '#64748b' }}>
          Đang hiển thị {filteredOrders.length} đơn
        </small>
      </div>

      {loading && <p style={{ color: '#64748b' }}>Đang tải danh sách đơn...</p>}
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      {/* ================= DANH SÁCH CÁC ĐƠN ĐỒ UỐNG ================= */}
      {!loading && filteredOrders.length === 0 && (
        <div style={{ background: '#fff', padding: 40, borderRadius: 10, textAlign: 'center', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
          Hiện chưa có đơn gọi đồ uống nào trong danh mục này.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredOrders.map((order) => {
          const cfg = STATUS_MAP[order.status] || STATUS_MAP.pending;
          const hasGuestMessage = order.messages && order.messages.some((m) => m.sender_type === 'guest');
          const latestMsg = order.messages && order.messages[order.messages.length - 1];

          return (
            <div
              key={order.id}
              style={{
                background: '#fff',
                borderRadius: 12,
                border: hasGuestMessage ? '2px solid #ef4444' : `1px solid ${cfg.border}`,
                borderLeft: `6px solid ${hasGuestMessage ? '#ef4444' : cfg.color}`,
                padding: 20,
                boxShadow: hasGuestMessage ? '0 4px 14px rgba(239,68,68,0.15)' : '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              {/* Header của thẻ đơn */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      background: '#1e3a8a',
                      color: '#fff',
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontWeight: 'bold',
                      fontSize: 18,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      lineHeight: 1.2
                    }}
                  >
                    <span style={{ fontSize: 11, color: '#93c5fd', textTransform: 'uppercase' }}>PHÒNG</span>
                    <span>{order.room_number}</span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 'bold', color: '#0f172a' }}>
                        Đơn #{order.id}
                      </span>
                      <span style={{ fontSize: 13, color: '#64748b' }}>
                        Khách: <strong>{order.guest_name}</strong> {order.phone ? `(📞 ${order.phone})` : ''}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                      Đặt lúc: {order.created_at}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      background: cfg.bg,
                      color: cfg.color,
                      border: `1px solid ${cfg.border}`,
                      padding: '6px 14px',
                      borderRadius: 20,
                      fontWeight: 'bold',
                      fontSize: 13
                    }}
                  >
                    {cfg.label}
                  </span>
                </div>
              </div>

              {/* Danh sách các món nước được gọi */}
              <div
                style={{
                  background: '#f8fafc',
                  padding: 14,
                  borderRadius: 8,
                  marginBottom: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: '#fff',
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: '1px solid #e2e8f0',
                        fontSize: 13
                      }}
                    >
                      <img
                        src={item.image_url}
                        alt=""
                        style={{ width: 28, height: 28, objectFit: 'contain' }}
                        onError={(e) => { e.target.src = '/drinks/teaplus.webp'; }}
                      />
                      <span>
                        <strong>{item.drink_name}</strong>
                      </span>
                      <span
                        style={{
                          background: '#eff6ff',
                          color: '#2563eb',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontWeight: 'bold'
                        }}
                      >
                        × {item.quantity}
                      </span>
                      <span style={{ color: '#dc2626', fontWeight: 600 }}>
                        {formatVND(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Tổng thu tiền tại phòng:</div>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1e3a8a' }}>
                    {formatVND(order.total_price)}
                  </div>
                </div>
              </div>

              {/* Ghi chú của khách */}
              {order.note && (
                <div style={{ fontSize: 13, color: '#b45309', background: '#fffbeb', padding: '8px 12px', borderRadius: 6, marginBottom: 12 }}>
                  📝 <strong>Ghi chú từ khách:</strong> {order.note}
                </div>
              )}

              {/* ================= CẢNH BÁO TIN NHẮN GIỤC TỪ KHÁCH ================= */}
              {hasGuestMessage && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 8,
                    padding: '10px 14px',
                    marginBottom: 14,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>🚨</span>
                    <div>
                      <strong style={{ color: '#b91c1c', fontSize: 13 }}>
                        KHÁCH HÀNG NHẮN TIN GIỤC / PHẢN HỒI ({order.messages?.length} tin nhắn):
                      </strong>
                      <div style={{ color: '#7f1d1d', fontSize: 13, marginTop: 2 }}>
                        "{latestMsg?.message}" <small style={{ color: '#991b1b' }}>({latestMsg?.created_at})</small>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => openChatModal(order)}
                    style={{
                      background: '#dc2626',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: 12,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    💬 Trả lời ngay
                  </button>
                </div>
              )}

              {/* Thanh thao tác của Lễ tân */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={() => openChatModal(order)}
                  style={{
                    background: '#fff',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    padding: '7px 14px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  💬 Tin nhắn với khách ({order.messages?.length || 0})
                </button>

                <div style={{ display: 'flex', gap: 8 }}>
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(order.id, 'confirmed')}
                        style={{ ...actionBtnStyle, background: '#2563eb', color: '#fff' }}
                      >
                        👨‍🍳 Xác Nhận &amp; Chuẩn Bị
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id, 'delivering')}
                        style={{ ...actionBtnStyle, background: '#4338ca', color: '#fff' }}
                      >
                        🛵 Đang Mang Lên Phòng
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Huỷ đơn đồ uống này?')) {
                            handleStatusChange(order.id, 'cancelled');
                          }
                        }}
                        style={{ ...actionBtnStyle, background: 'transparent', color: '#dc2626', border: '1px solid #fca5a5' }}
                      >
                        Huỷ đơn
                      </button>
                    </>
                  )}

                  {order.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(order.id, 'delivering')}
                        style={{ ...actionBtnStyle, background: '#4338ca', color: '#fff' }}
                      >
                        🛵 Bắt Đầu Mang Lên Phòng
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id, 'completed')}
                        style={{ ...actionBtnStyle, background: '#16a34a', color: '#fff' }}
                      >
                        ✅ Đã Giao Thành Công
                      </button>
                    </>
                  )}

                  {order.status === 'delivering' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'completed')}
                      style={{ ...actionBtnStyle, background: '#16a34a', color: '#fff' }}
                    >
                      ✅ Xác Nhận ĐÃ GIAO XONG LÊN PHÒNG
                    </button>
                  )}

                  {order.status === 'completed' && (
                    <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                      ✓ Đã hoàn tất phục vụ
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= MODAL CHAT TRẢ LỜI TIN NHẮN KHÁCH ================= */}
      {chatModal.open && chatModal.order && (
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
              maxWidth: 600,
              width: '100%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
            }}
          >
            {/* Header modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 12, marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: '#0f172a' }}>
                  💬 Trao Đổi Với Phòng {chatModal.order.room_number} (Đơn #{chatModal.order.id})
                </h3>
                <small style={{ color: '#64748b' }}>
                  Khách: {chatModal.order.guest_name} | {currentHotel?.name}
                </small>
              </div>
              <button
                onClick={() => setChatModal({ open: false, order: null, messages: [], replyText: '', sending: false })}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {/* Khung tin nhắn */}
            <div
              style={{
                flex: 1,
                minHeight: 220,
                maxHeight: 320,
                overflowY: 'auto',
                background: '#f8fafc',
                padding: 14,
                borderRadius: 8,
                marginBottom: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}
            >
              {chatModal.messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', margin: 'auto' }}>
                  Chưa có tin nhắn nào được trao đổi.
                </div>
              ) : (
                chatModal.messages.map((m) => {
                  const isStaff = m.sender_type === 'staff';
                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: isStaff ? 'flex-end' : 'flex-start',
                        background: isStaff ? '#2563eb' : '#fff',
                        color: isStaff ? '#fff' : '#0f172a',
                        border: isStaff ? 'none' : '1px solid #e2e8f0',
                        padding: '8px 14px',
                        borderRadius: 10,
                        maxWidth: '80%',
                        fontSize: 13,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 'bold', opacity: 0.8, marginBottom: 2 }}>
                        {m.sender_name || (isStaff ? 'Lễ tân' : 'Khách')} • {m.created_at}
                      </div>
                      <div>{m.message}</div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Mẫu trả lời nhanh */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => handleSendReply('Dạ lễ tân đã chuẩn bị xong, nhân viên đang mang lên phòng cho quý khách ngay đây ạ!')}
                style={quickReplyStyle}
              >
                🚀 "Đang mang lên phòng ngay đây ạ"
              </button>
              <button
                type="button"
                onClick={() => handleSendReply('Dạ xin lỗi quý khách vì sự chậm trễ, đồ uống sẽ đến phòng trong 3 phút nữa ạ!')}
                style={quickReplyStyle}
              >
                ⏱️ "Sẽ đến trong 3 phút nữa"
              </button>
              <button
                type="button"
                onClick={() => handleSendReply('Dạ lễ tân đã ghi nhận yêu cầu thêm đá & ly của quý khách rồi ạ!')}
                style={quickReplyStyle}
              >
                🧊 "Đã ghi nhận thêm đá & ly"
              </button>
            </div>

            {/* Ô nhập tin nhắn */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                placeholder="Nhập nội dung trả lời khách..."
                value={chatModal.replyText}
                onChange={(e) => setChatModal((prev) => ({ ...prev, replyText: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
              <button
                type="button"
                onClick={() => handleSendReply()}
                disabled={chatModal.sending || !chatModal.replyText.trim()}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: 14
                }}
              >
                {chatModal.sending ? 'Đang gửi...' : 'Gửi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function statBox(color, alert) {
  return {
    background: alert ? '#fef2f2' : '#fff',
    border: alert ? '2px solid #ef4444' : '1px solid #e2e8f0',
    borderLeft: `5px solid ${color}`,
    borderRadius: 8,
    padding: '12px 16px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  };
}

function filterBtnStyle(active, activeColor = '#2563eb') {
  return {
    padding: '6px 14px',
    borderRadius: 20,
    border: '1px solid #cbd5e1',
    background: active ? activeColor : '#fff',
    color: active ? '#fff' : '#334155',
    fontWeight: active ? 'bold' : 500,
    fontSize: 13,
    cursor: 'pointer'
  };
}

const actionBtnStyle = {
  border: 'none',
  padding: '7px 14px',
  borderRadius: 6,
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: 13
};

const quickReplyStyle = {
  background: '#eff6ff',
  border: '1px solid #bfdbfe',
  color: '#1e40af',
  padding: '5px 10px',
  borderRadius: 6,
  fontSize: 12,
  cursor: 'pointer',
  fontWeight: 500
};
