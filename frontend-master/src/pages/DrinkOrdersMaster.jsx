import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllHotels, getAllDrinkOrders, getDrinkOrderMessages } from '../services/api.js';

const STATUS_MAP = {
  pending: { label: '⏳ Chờ xác nhận', bg: '#fef3c7', color: '#b45309', border: '#fcd34d' },
  confirmed: { label: '👨‍🍳 Đã nhận đơn & Chuẩn bị', bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' },
  delivering: { label: '🛵 Đang mang lên phòng', bg: '#e0e7ff', color: '#4338ca', border: '#a5b4fc' },
  completed: { label: '✅ Đã giao thành công', bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  cancelled: { label: '❌ Đã huỷ', bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' }
};

export default function DrinkOrdersMaster() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlHotelId = searchParams.get('hotelId') || 'all';

  const [hotels, setHotels] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(urlHotelId);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal xem chi tiết tin nhắn trao đổi
  const [chatModal, setChatModal] = useState({
    open: false,
    order: null,
    messages: []
  });

  function loadData() {
    setLoading(true);
    Promise.all([getAllHotels(), getAllDrinkOrders()])
      .then(([hotelsData, ordersData]) => {
        setHotels(hotelsData);
        setOrders(ordersData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (urlHotelId) setSelectedHotel(urlHotelId);
  }, [urlHotelId]);

  function handleHotelChange(newHotelId) {
    setSelectedHotel(newHotelId);
    if (newHotelId === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ hotelId: newHotelId });
    }
  }

  async function openChatModal(order) {
    setChatModal({ open: true, order, messages: order.messages || [] });
    try {
      const msgs = await getDrinkOrderMessages(order.id);
      setChatModal((prev) => ({ ...prev, messages: msgs }));
    } catch {
      // Giữ tin nhắn cũ
    }
  }

  const formatVND = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  // Lọc dữ liệu
  const filteredOrders = orders.filter((o) => {
    if (selectedHotel !== 'all' && String(o.hotel_id) !== String(selectedHotel)) return false;
    if (statusFilter === 'has_message') {
      if (!o.messages || o.messages.length === 0) return false;
    } else if (statusFilter !== 'all' && o.status !== statusFilter) {
      return false;
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = o.guest_name?.toLowerCase().includes(term);
      const matchPhone = o.phone?.includes(term);
      const matchRoom = String(o.room_number).includes(term);
      const matchId = String(o.id).includes(term);
      const matchHotel = o.hotel_name?.toLowerCase().includes(term);
      if (!matchName && !matchPhone && !matchRoom && !matchId && !matchHotel) return false;
    }
    return true;
  });

  // Tính thống kê
  const totalOrdersCount = orders.length;
  const totalRevenue = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + Number(o.total_price), 0);
  const countPending = orders.filter((o) => o.status === 'pending').length;
  const countDelivering = orders.filter((o) => o.status === 'delivering' || o.status === 'confirmed').length;
  const countCompleted = orders.filter((o) => o.status === 'completed').length;
  const countHasMessage = orders.filter((o) => o.messages && o.messages.length > 0).length;

  return (
    <div>
      {/* Tiêu đề */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 24, color: '#0f172a' }}>
            🥤 Quản Lý &amp; Lịch Sử Gọi Đồ Uống Toàn Hệ Thống
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
            Theo dõi realtime các đơn gọi đồ uống tại phòng, doanh thu và phản hồi từ khách tại 10 khách sạn thành viên
          </p>
        </div>

        <button
          onClick={loadData}
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

      {/* Thẻ chỉ số tổng quan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 22 }}>
        <div style={cardStyle('#3b82f6')}>
          <div style={{ fontSize: 13, color: '#64748b' }}>Tổng Số Đơn Đã Đặt</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1e40af', marginTop: 4 }}>
            {totalOrdersCount} đơn
          </div>
        </div>

        <div style={cardStyle('#10b981')}>
          <div style={{ fontSize: 13, color: '#64748b' }}>Doanh Thu Đã Hoàn Tất</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#15803d', marginTop: 4 }}>
            {formatVND(totalRevenue)}
          </div>
        </div>

        <div style={cardStyle('#f59e0b')}>
          <div style={{ fontSize: 13, color: '#64748b' }}>Đang Xử Lý / Giao</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#b45309', marginTop: 4 }}>
            {countPending + countDelivering} đơn
          </div>
        </div>

        <div style={cardStyle('#8b5cf6')}>
          <div style={{ fontSize: 13, color: '#64748b' }}>Đã Giao Thành Công</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#6b21a8', marginTop: 4 }}>
            {countCompleted} đơn
          </div>
        </div>

        <div style={cardStyle('#ef4444', countHasMessage > 0)}>
          <div style={{ fontSize: 13, color: '#64748b' }}>Khách Nhắn Tin Giục</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#dc2626', marginTop: 4 }}>
            {countHasMessage} đơn {countHasMessage > 0 ? '🚨' : ''}
          </div>
        </div>
      </div>

      {/* Bộ lọc */}
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
                {h.name}
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
            <option value="pending">⏳ Chờ tiếp tân xác nhận</option>
            <option value="confirmed">👨‍🍳 Đang chuẩn bị</option>
            <option value="delivering">🛵 Đang mang lên phòng</option>
            <option value="completed">✅ Đã giao thành công</option>
            <option value="cancelled">❌ Đã huỷ</option>
            <option value="has_message">🚨 Chỉ đơn có tin nhắn giục</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: 240 }}>
          <input
            placeholder="Tìm theo Khách sạn, Số phòng, Tên khách, SĐT hoặc Mã đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {loading && <p style={{ color: '#64748b' }}>Đang tải danh sách đơn toàn hệ thống...</p>}
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      {/* Bảng danh sách đơn gọi đồ uống */}
      {!loading && (
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={thStyle}>Mã Đơn</th>
                <th style={thStyle}>Khách Sạn</th>
                <th style={thStyle}>Phòng</th>
                <th style={thStyle}>Khách Hàng</th>
                <th style={thStyle}>Đồ Uống &amp; Số Lượng</th>
                <th style={thStyle}>Tổng Tiền</th>
                <th style={thStyle}>Trạng Thái</th>
                <th style={{ ...thStyle, width: '22%' }}>Tin Nhắn Giục / Phản Hồi</th>
                <th style={thStyle}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                    Không tìm thấy đơn gọi đồ uống nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const cfg = STATUS_MAP[order.status] || STATUS_MAP.pending;
                  const hasGuestMsg = order.messages && order.messages.some((m) => m.sender_type === 'guest');
                  const latestMsg = order.messages && order.messages[order.messages.length - 1];

                  return (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: hasGuestMsg ? '#fff9f9' : '#fff'
                      }}
                    >
                      <td style={tdStyle}>
                        <strong>#{order.id}</strong>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>
                          {order.hotel_name || `KS #${order.hotel_id}`}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            background: '#1e3a8a',
                            color: '#fff',
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontWeight: 'bold',
                            fontSize: 13
                          }}
                        >
                          P.{order.room_number}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600 }}>{order.guest_name}</div>
                        {order.phone && <div style={{ color: '#64748b', fontSize: 12 }}>📞 {order.phone}</div>}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {order.items?.map((it) => (
                            <div key={it.id} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>• {it.drink_name}</span>
                              <strong style={{ color: '#2563eb' }}>×{it.quantity}</strong>
                            </div>
                          ))}
                        </div>
                        {order.note && (
                          <div style={{ fontSize: 12, color: '#b45309', marginTop: 4, fontStyle: 'italic' }}>
                            Ghi chú: {order.note}
                          </div>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <strong style={{ color: '#0f172a', fontSize: 15 }}>
                          {formatVND(order.total_price)}
                        </strong>
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            background: cfg.bg,
                            color: cfg.color,
                            border: `1px solid ${cfg.border}`,
                            padding: '4px 10px',
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 'bold',
                            display: 'inline-block'
                          }}
                        >
                          {cfg.label}
                        </span>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                          {order.created_at}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        {hasGuestMsg ? (
                          <div
                            style={{
                              background: '#fee2e2',
                              border: '1px solid #fecaca',
                              borderRadius: 6,
                              padding: '6px 10px',
                              fontSize: 12,
                              color: '#991b1b',
                              lineHeight: 1.4
                            }}
                          >
                            <strong>🚨 Khách giục:</strong> "{latestMsg?.message}"
                          </div>
                        ) : order.messages && order.messages.length > 0 ? (
                          <div style={{ fontSize: 12, color: '#475569' }}>
                            💬 {latestMsg?.message}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: 12 }}>Chưa có tin nhắn</span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => openChatModal(order)}
                          style={{
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            padding: '6px 12px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 600,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          💬 Xem trao đổi ({order.messages?.length || 0})
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= MODAL XEM CHI TIẾT TIN NHẮN ================= */}
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
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: '#0f172a' }}>
                  Hộp Thoại Giữa Khách &amp; Lễ Tân — Đơn #{chatModal.order.id}
                </h3>
                <small style={{ color: '#64748b' }}>
                  {chatModal.order.hotel_name} • Phòng {chatModal.order.room_number} • Khách: {chatModal.order.guest_name}
                </small>
              </div>
              <button
                onClick={() => setChatModal({ open: false, order: null, messages: [] })}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 180 }}>
              {chatModal.messages.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', margin: 'auto' }}>
                  Không có tin nhắn nào được ghi nhận cho đơn này.
                </p>
              ) : (
                chatModal.messages.map((m) => {
                  const isStaff = m.sender_type === 'staff';
                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: isStaff ? 'flex-end' : 'flex-start',
                        background: isStaff ? '#dbeafe' : '#fef2f2',
                        border: isStaff ? '1px solid #bfdbfe' : '1px solid #fecaca',
                        color: isStaff ? '#1e40af' : '#991b1b',
                        padding: '8px 14px',
                        borderRadius: 10,
                        maxWidth: '85%',
                        fontSize: 13
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 2 }}>
                        {m.sender_name || (isStaff ? 'Lễ tân' : 'Khách phòng')} • {m.created_at}
                      </div>
                      <div>{m.message}</div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <button
                onClick={() => setChatModal({ open: false, order: null, messages: [] })}
                style={{ padding: '8px 16px', background: '#e2e8f0', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
              >
                Đóng
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

function cardStyle(color, alert) {
  return {
    background: alert ? '#fef2f2' : '#fff',
    border: alert ? '2px solid #ef4444' : '1px solid #e2e8f0',
    borderLeft: `5px solid ${color}`,
    borderRadius: 8,
    padding: '14px 18px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  };
}
