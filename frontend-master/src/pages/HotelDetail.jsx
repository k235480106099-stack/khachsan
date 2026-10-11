import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getHotelById, getHotelStats } from '../services/api.js';

const HOTEL_WEB_URL = import.meta.env.VITE_HOTEL_WEB_URL || 'http://localhost:3001';

export default function HotelDetail() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getHotelById(id), getHotelStats(id)])
      .then(([hotelData, statsData]) => {
        setHotel(hotelData);
        setStats(statsData);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!hotel || !stats) return <p>Đang tải...</p>;

  return (
    <div>
      <h2>{hotel.name}</h2>
      <p>{hotel.address}</p>

      <a href={`${HOTEL_WEB_URL}/?hotelId=${id}`} target="_blank" rel="noreferrer">
        Mở trang web khách sạn này ↗
      </a>

      <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
        <StatBlock title="Phòng">
          <p>Tổng: {stats.rooms.total_rooms}</p>
          <p>Thường: {stats.rooms.total_normal}</p>
          <p>VIP: {stats.rooms.total_vip}</p>
          <p>Còn trống: {stats.rooms.total_available}</p>
        </StatBlock>

        <StatBlock title="Đặt phòng">
          <p>Đã đặt: {stats.bookings.total_booked}</p>
          <p>Đang sử dụng: {stats.bookings.total_using}</p>
          <p>Đã trả: {stats.bookings.total_checked_out}</p>
          <p>Đã huỷ: {stats.bookings.total_cancelled}</p>
        </StatBlock>
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 16 }}>
        <Link to={`/bookings?hotelId=${id}`}>Xem lịch sử đặt phòng</Link>
        <Link to={`/staff?hotelId=${id}`}>Xem ca trực nhân viên</Link>
      </div>
    </div>
  );
}

function StatBlock({ title, children }) {
  return (
    <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, flex: 1 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </div>
  );
}