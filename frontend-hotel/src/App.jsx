import { Routes, Route, Link, useSearchParams } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Rooms from './pages/Rooms.jsx';
import BookingForm from './pages/BookingForm.jsx';
import CancelBooking from './pages/CancelBooking.jsx';
import MyBookingHistory from './pages/MyBookingHistory.jsx';
import Rules from './pages/Rules.jsx';
import DrinkOrderPage from './pages/DrinkOrderPage.jsx';

export default function App() {
  const [searchParams] = useSearchParams();
  const hotelId = searchParams.get('hotelId') || '1';

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', minHeight: '100vh', background: '#f9fafb' }}>
      <header
        style={{
          background: '#1e3a8a',
          color: '#fff',
          padding: '14px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <Link to={`/?hotelId=${hotelId}`} style={{ color: '#fff', textDecoration: 'none', fontSize: 20, fontWeight: 'bold' }}>
          🏨 Hệ Thống Đặt Phòng Khách Sạn
        </Link>
        <nav style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <Link to={`/?hotelId=${hotelId}`} style={{ color: '#e0e7ff', textDecoration: 'none' }}>
            Trang chủ
          </Link>
          <Link to={`/rooms?hotelId=${hotelId}`} style={{ color: '#e0e7ff', textDecoration: 'none' }}>
            Chọn phòng
          </Link>
          <Link
            to={`/drinks?hotelId=${hotelId}`}
            style={{
              background: '#ea580c',
              color: '#fff',
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: 20,
              fontWeight: 'bold',
              fontSize: 13,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            🥤 Gọi Đồ Uống Tại Phòng
          </Link>
          <Link to={`/rules?hotelId=${hotelId}`} style={{ color: '#e0e7ff', textDecoration: 'none' }}>
            Nội quy
          </Link>
          <Link to={`/history?hotelId=${hotelId}`} style={{ color: '#fef08a', textDecoration: 'none', fontWeight: 'bold' }}>
            Tra cứu / Huỷ phòng
          </Link>
        </nav>
      </header>

      <main style={{ padding: '24px 20px', maxWidth: 1100, margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/drinks" element={<DrinkOrderPage />} />
          <Route path="/book/:roomId" element={<BookingForm />} />
          <Route path="/cancel/:bookingId" element={<CancelBooking />} />
          <Route path="/history" element={<MyBookingHistory />} />
          <Route path="/rules" element={<Rules />} />
        </Routes>
      </main>

      <footer style={{ textAlign: 'center', padding: '20px', color: '#6b7280', fontSize: 13, borderTop: '1px solid #e5e7eb', marginTop: 40 }}>
        © 2026 Chuỗi Hệ Thống Khách Sạn Thành Viên. Đầy đủ tiện nghi - Phục vụ chu đáo 24/7.
      </footer>
    </div>
  );
}
