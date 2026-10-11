import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getRoomsByHotel } from '../services/api.js';
import RoomCard from '../components/RoomCard.jsx';

export default function Rooms() {
  const [searchParams] = useSearchParams();
  const hotelId = searchParams.get('hotelId') || '1';
  const [rooms, setRooms] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getRoomsByHotel(hotelId)
      .then((data) => {
        setRooms(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [hotelId]);

  if (loading) return <div style={{ padding: 24, textAlign: 'center' }}>Đang tải danh sách phòng...</div>;
  if (error) return <div style={{ padding: 24, color: 'red' }}>{error}</div>;

  const filteredRooms = rooms.filter((r) => {
    if (filter === 'normal') return r.type === 'normal';
    if (filter === 'vip') return r.type === 'vip';
    return true;
  });

  const normalRooms = rooms.filter((r) => r.type === 'normal');
  const vipRooms = rooms.filter((r) => r.type === 'vip');

  const isNormalFull = normalRooms.length > 0 && normalRooms.every((r) => r.status !== 'available');
  const isVipFull = vipRooms.length > 0 && vipRooms.every((r) => r.status !== 'available');

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0' }}>Danh Sách Phòng Khách Sạn</h2>
          <Link to={`/?hotelId=${hotelId}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
            ← Quay lại trang chủ khách sạn
          </Link>
        </div>

        {/* Bộ lọc loại phòng */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid #ccc',
              background: filter === 'all' ? '#1e3a8a' : '#fff',
              color: filter === 'all' ? '#fff' : '#333',
              cursor: 'pointer'
            }}
          >
            Tất cả ({rooms.length})
          </button>
          <button
            onClick={() => setFilter('normal')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid #ccc',
              background: filter === 'normal' ? '#1e3a8a' : '#fff',
              color: filter === 'normal' ? '#fff' : '#333',
              cursor: 'pointer'
            }}
          >
            Phòng Thường {isNormalFull && '🔴 (FULL)'}
          </button>
          <button
            onClick={() => setFilter('vip')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid #ccc',
              background: filter === 'vip' ? '#d97706' : '#fff',
              color: filter === 'vip' ? '#fff' : '#333',
              cursor: 'pointer'
            }}
          >
            Phòng VIP {isVipFull && '🔴 (FULL)'}
          </button>
        </div>
      </div>

      {/* Cảnh báo FULL phòng */}
      {(isNormalFull || isVipFull) && (
        <div
          style={{
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 20,
            color: '#be123c',
            display: 'flex',
            gap: 16
          }}
        >
          {isNormalFull && <span>⚠️ <strong>Thông báo:</strong> Hiện tại loại <strong>Phòng Thường</strong> đã HẾT PHÒNG (FULL).</span>}
          {isVipFull && <span>⚠️ <strong>Thông báo:</strong> Hiện tại loại <strong>Phòng VIP</strong> đã HẾT PHÒNG (FULL).</span>}
        </div>
      )}

      {/* Grid danh sách phòng */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {filteredRooms.map((room) => (
          <RoomCard key={room.id} room={room} hotelId={hotelId} />
        ))}
      </div>
    </div>
  );
}
