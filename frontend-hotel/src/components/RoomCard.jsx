import { Link } from 'react-router-dom';

export default function RoomCard({ room, hotelId }) {
  const isVip = room.type === 'vip';
  const isFull = room.is_full || room.status !== 'available';

  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(room.price);

  return (
    <div
      style={{
        border: isVip ? '2px solid #f59e0b' : '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 16,
        background: '#fff',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Phòng {room.room_number}</h3>
          <span
            style={{
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 'bold',
              textTransform: 'uppercase',
              background: isVip ? '#fef3c7' : '#e0f2fe',
              color: isVip ? '#b45309' : '#0369a1'
            }}
          >
            {isVip ? '⭐ PHÒNG VIP' : 'PHÒNG THƯỜNG'}
          </span>
        </div>

        <p style={{ color: '#4b5563', fontSize: 14, margin: '8px 0' }}>
          {room.description || (isVip ? 'Phòng VIP đầy đủ tiện nghi hạng sang' : 'Phòng tiêu chuẩn thoáng mát')}
        </p>

        <p style={{ fontSize: 20, fontWeight: 'bold', color: isVip ? '#b45309' : '#1e3a8a', margin: '12px 0' }}>
          {formattedPrice} <span style={{ fontSize: 13, fontWeight: 'normal', color: '#6b7280' }}>/ đêm</span>
        </p>
      </div>

      <div style={{ marginTop: 12 }}>
        {isFull ? (
          <div
            style={{
              background: '#fee2e2',
              color: '#dc2626',
              fontWeight: 'bold',
              padding: '10px 16px',
              borderRadius: 6,
              textAlign: 'center',
              letterSpacing: 1
            }}
          >
            🚫 HẾT PHÒNG (FULL)
          </div>
        ) : (
          <Link
            to={`/book/${room.id}?hotelId=${hotelId}`}
            style={{
              display: 'block',
              textAlign: 'center',
              background: isVip ? '#d97706' : '#2563eb',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: 6,
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            Đặt phòng ngay
          </Link>
        )}
      </div>
    </div>
  );
}
