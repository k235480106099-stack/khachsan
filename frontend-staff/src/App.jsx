import React from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import RoomStatusBoard from './pages/RoomStatusBoard.jsx';
import CheckInOut from './pages/CheckInOut.jsx';
import ShiftSchedule from './pages/ShiftSchedule.jsx';
import CleaningSchedule from './pages/CleaningSchedule.jsx';
import DrinkOrdersManagement from './pages/DrinkOrdersManagement.jsx';
import { getCurrentUser, logout } from './services/api.js';
import { HotelProvider, useHotel } from './context/HotelContext.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, maxWidth: 600, margin: '60px auto', background: '#fee2e2', borderRadius: 8, color: '#991b1b', fontFamily: 'sans-serif' }}>
          <h2>⚠️ Đã xảy ra lỗi giao diện</h2>
          <p>{this.state.error?.message || 'Có lỗi bất ngờ khi hiển thị'}</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
            >
              🔄 Tải lại trang
            </button>
            <button
              onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
              style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
            >
              🚪 Đăng nhập lại
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function RequireAuth({ children }) {
  const user = getCurrentUser();
  return user ? children : <Navigate to="/login" replace />;
}

function Layout({ children }) {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { hotelId, setHotelId, hotels, currentHotel } = useHotel();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', minHeight: '100vh', background: '#f8fafc' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px',
          background: '#1e3a8a',
          color: '#fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>🛎️ Cổng Tác Nghiệp Khách Sạn</h2>

          {/* Bộ chuyển đổi khách sạn trực tiếp không cần đăng xuất */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1e40af', padding: '4px 10px', borderRadius: 8 }}>
            <span style={{ fontSize: 13, color: '#93c5fd' }}>🏨 Đang làm việc tại:</span>
            <select
              value={hotelId}
              onChange={(e) => setHotelId(e.target.value)}
              style={{
                background: '#fff',
                color: '#0f172a',
                border: 'none',
                borderRadius: 4,
                padding: '6px 10px',
                fontWeight: 'bold',
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>
                  #{h.id}. {h.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 'bold' }}>{user.full_name || user.username}</div>
              <small style={{ color: '#93c5fd' }}>{user.role === 'cleaner' ? 'Lao công' : 'Lễ tân'}</small>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 14px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: 13
            }}
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <nav
        style={{
          display: 'flex',
          gap: 16,
          padding: '12px 24px',
          background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          alignItems: 'center'
        }}
      >
        <Link to="/" style={navLinkStyle}>📊 Trạng thái phòng</Link>
        <Link to="/checkinout" style={navLinkStyle}>🔑 Nhận / trả phòng (Check-in/out)</Link>
        <Link
          to="/drinks"
          style={{
            ...navLinkStyle,
            background: '#ea580c',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          🥤 Phục vụ đồ uống tại phòng
        </Link>
        <Link to="/shifts" style={navLinkStyle}>👨‍💼 Ca trực lễ tân</Link>
        <Link to="/cleaning" style={navLinkStyle}>🧹 Ca trực lao công</Link>
      </nav>

      <main style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>{children}</main>
    </div>
  );
}

const navLinkStyle = {
  textDecoration: 'none',
  color: '#334155',
  fontWeight: 600,
  fontSize: 14,
  padding: '6px 12px',
  borderRadius: 6
};

export default function App() {
  return (
    <ErrorBoundary>
      <HotelProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <RequireAuth>
                <Layout>
                  <Routes>
                    <Route path="/" element={<RoomStatusBoard />} />
                    <Route path="/checkinout" element={<CheckInOut />} />
                    <Route path="/drinks" element={<DrinkOrdersManagement />} />
                    <Route path="/shifts" element={<ShiftSchedule />} />
                    <Route path="/cleaning" element={<CleaningSchedule />} />
                  </Routes>
                </Layout>
              </RequireAuth>
            }
          />
        </Routes>
      </HotelProvider>
    </ErrorBoundary>
  );
}