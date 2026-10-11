import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/api.js';

export default function Navbar() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 28px',
        background: '#0f172a',
        color: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 24 }}>🏢</span>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, letterSpacing: 0.5 }}>HỆ THỐNG QUẢN LÝ TỔNG 10 KHÁCH SẠN</h2>
          <small style={{ color: '#94a3b8' }}>Trung tâm điều hành dữ liệu chuỗi khách sạn</small>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {user && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold', fontSize: 14 }}>{user.full_name || user.username}</div>
            <span style={{ fontSize: 11, background: '#3b82f6', padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
              {user.role}
            </span>
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
            fontSize: 13,
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
