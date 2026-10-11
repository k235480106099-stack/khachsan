import { Link, useLocation } from 'react-router-dom';

const MENU_ITEMS = [
  { path: '/', label: '📊 Tổng quan hệ thống', desc: 'Chỉ số realtime 10 khách sạn' },
  { path: '/hotels', label: '🏨 Danh sách 10 Khách sạn', desc: 'Chi tiết & liên kết web con' },
  { path: '/bookings', label: '📖 Lịch sử Đặt & Huỷ phòng', desc: 'Đồng bộ toàn bộ giao dịch' },
  { path: '/drinks', label: '🥤 Quản lý Gọi Đồ Uống', desc: 'Room service & giục đơn 10 KS' },
  { path: '/staff', label: '👷 Ca trực Nhân viên & Lao công', desc: 'Theo dõi ca ngày & ca đêm' }
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside
      style={{
        width: 260,
        minHeight: 'calc(100vh - 65px)',
        background: '#1e293b',
        color: '#fff',
        padding: '20px 12px',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ padding: '0 8px 16px 8px', borderBottom: '1px solid #334155', marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
          Menu Điều Hành
        </p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {MENU_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'block',
                padding: '10px 14px',
                borderRadius: 8,
                color: isActive ? '#fff' : '#cbd5e1',
                background: isActive ? '#2563eb' : 'transparent',
                textDecoration: 'none',
                fontWeight: isActive ? 'bold' : 'normal',
                transition: 'background 0.2s'
              }}
            >
              <div style={{ fontSize: 14 }}>{item.label}</div>
              <small style={{ fontSize: 11, color: isActive ? '#bfdbfe' : '#64748b' }}>{item.desc}</small>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
