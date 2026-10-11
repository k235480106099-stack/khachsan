import { useEffect, useState } from 'react';
import { getRoomsByHotel, updateRoomStatus } from '../services/api.js';
import { useHotel } from '../context/HotelContext.jsx';

const STATUS_LABEL = {
  available: 'Còn trống',
  booked: 'Đã đặt',
  using: 'Đang ở',
  cleaning: 'Đang dọn dẹp',
  maintenance: 'Bảo trì'
};

const STATUS_COLOR = {
  available: '#16a34a',
  booked: '#2563eb',
  using: '#dc2626',
  cleaning: '#d97706',
  maintenance: '#6b7280'
};

export default function RoomStatusBoard() {
  const { hotelId, currentHotel } = useHotel();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  function loadRooms() {
    if (!hotelId) return;
    setLoading(true);
    getRoomsByHotel(hotelId)
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.rooms || [];
        setRooms(list);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Không thể tải danh sách phòng');
        setLoading(false);
      });
  }

  useEffect(() => {
    loadRooms();
  }, [hotelId]);

  async function handleStatusChange(roomId, newStatus) {
    try {
      await updateRoomStatus(roomId, newStatus);
      loadRooms();
    } catch (err) {
      alert('Lỗi cập nhật trạng thái: ' + err.message);
    }
  }

  const availableCount = rooms.filter((r) => r.status === 'available').length;
  const usingCount = rooms.filter((r) => r.status === 'using' || r.status === 'booked').length;
  const cleaningCount = rooms.filter((r) => r.status === 'cleaning').length;

  const filteredRooms = rooms.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div>
      {/* Tiêu đề */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 24, color: '#0f172a' }}>
            📊 Bảng Trạng Thái Phòng — {currentHotel?.name || `Khách sạn #${hotelId}`}
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
            Theo dõi realtime phòng trống, khách đang ở và dọn dẹp vệ sinh
          </p>
        </div>

        <button
          onClick={loadRooms}
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
          <div style={{ fontSize: 13, color: '#64748b' }}>Tổng Số Phòng</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1e40af', marginTop: 4 }}>
            {rooms.length} phòng
          </div>
        </div>

        <div style={statBox('#16a34a')}>
          <div style={{ fontSize: 13, color: '#64748b' }}>Còn Trống Sẵn Sàng</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#15803d', marginTop: 4 }}>
            {availableCount} phòng
          </div>
        </div>

        <div style={statBox('#dc2626')}>
          <div style={{ fontSize: 13, color: '#64748b' }}>Đang Có Khách Ở</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#991b1b', marginTop: 4 }}>
            {usingCount} phòng
          </div>
        </div>

        <div style={statBox('#d97706')}>
          <div style={{ fontSize: 13, color: '#64748b' }}>Đang Dọn Dẹp</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#b45309', marginTop: 4 }}>
            {cleaningCount} phòng
          </div>
        </div>
      </div>

      {/* Bộ lọc */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilter('all')}
          style={filterTabStyle(filter === 'all', '#1e3a8a')}
        >
          Tất cả ({rooms.length})
        </button>
        <button
          onClick={() => setFilter('available')}
          style={filterTabStyle(filter === 'available', '#16a34a')}
        >
          Còn trống ({availableCount})
        </button>
        <button
          onClick={() => setFilter('using')}
          style={filterTabStyle(filter === 'using', '#dc2626')}
        >
          Đang ở ({usingCount})
        </button>
        <button
          onClick={() => setFilter('cleaning')}
          style={filterTabStyle(filter === 'cleaning', '#d97706')}
        >
          Dọn dẹp ({cleaningCount})
        </button>
      </div>

      {loading && <p style={{ color: '#64748b' }}>Đang tải trạng thái phòng...</p>}
      {error && <p style={{ color: '#dc2626', background: '#fee2e2', padding: 12, borderRadius: 8 }}>{error}</p>}

      {/* Lưới các phòng */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {filteredRooms.map((room) => {
            const statusKey = room.status || 'available';
            const color = STATUS_COLOR[statusKey] || '#64748b';
            const label = STATUS_LABEL[statusKey] || statusKey;

            return (
              <div
                key={room.id}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  border: `2px solid ${color}`,
                  padding: 16,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: 160
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 20, fontWeight: 'bold', color: '#0f172a' }}>
                      Phòng {room.room_number}
                    </span>
                    <span
                      style={{
                        background: room.type === 'vip' ? '#fef3c7' : '#f1f5f9',
                        color: room.type === 'vip' ? '#b45309' : '#475569',
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontWeight: 'bold'
                      }}
                    >
                      {room.type === 'vip' ? '★ VIP' : 'Thường'}
                    </span>
                  </div>

                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
                    Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.price)} / đêm
                  </div>
                </div>

                <div>
                  <div style={{ marginBottom: 10 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 'bold',
                        color: '#fff',
                        background: color
                      }}
                    >
                      {label}
                    </span>
                  </div>

                  {/* Nhanh chuyển đổi trạng thái */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <select
                      value={statusKey}
                      onChange={(e) => handleStatusChange(room.id, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <option value="available">🟢 Đổi sang: Còn trống</option>
                      <option value="using">🔴 Đổi sang: Đang ở</option>
                      <option value="cleaning">🟡 Đổi sang: Đang dọn</option>
                      <option value="maintenance">⚪ Đổi sang: Bảo trì</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

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

function filterTabStyle(active, activeColor) {
  return {
    padding: '6px 14px',
    borderRadius: 20,
    border: active ? `2px solid ${activeColor}` : '1px solid #cbd5e1',
    background: active ? activeColor : '#fff',
    color: active ? '#fff' : '#334155',
    fontWeight: active ? 'bold' : 'normal',
    cursor: 'pointer',
    fontSize: 13
  };
}