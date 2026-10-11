import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import HotelList from './pages/HotelList.jsx';
import HotelDetail from './pages/HotelDetail.jsx';
import BookingHistoryAll from './pages/BookingHistoryAll.jsx';
import StaffOverview from './pages/StaffOverview.jsx';
import DrinkOrdersMaster from './pages/DrinkOrdersMaster.jsx';
import { getCurrentUser } from './services/api.js';

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

// Chặn truy cập nếu chưa đăng nhập
function RequireAuth({ children }) {
  const user = getCurrentUser();
  return user ? children : <Navigate to="/login" replace />;
}

// Khung giao diện chung: Navbar trên cùng + Sidebar bên trái
function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 24, minWidth: 0 }}>{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/hotels" element={<HotelList />} />
                  <Route path="/hotels/:id" element={<HotelDetail />} />
                  <Route path="/bookings" element={<BookingHistoryAll />} />
                  <Route path="/drinks" element={<DrinkOrdersMaster />} />
                  <Route path="/staff" element={<StaffOverview />} />
                </Routes>
              </Layout>
            </RequireAuth>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
}