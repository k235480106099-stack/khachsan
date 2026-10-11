import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOverallStats, getAllHotels } from '../services/api.js';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function loadData() {
    setLoading(true);
    setError('');
    Promise.all([
      getOverallStats().catch((err) => {
        console.warn('Lỗi lấy thống kê:', err);
        return null;
      }),
      getAllHotels().catch((err) => {
        console.warn('Lỗi lấy danh sách khách sạn:', err);
        return [];
      })
    ])
      .then(([statsData, hotelsData]) => {
        setStats(statsData);
        setHotels(Array.isArray(hotelsData) ? hotelsData : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Không thể tải dữ liệu');
        setLoading(false);
      });
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>⏳ Đang tải dữ liệu toàn hệ thống...</div>;
  }

  if (error && !stats && hotels.length === 0) {
    return (
      <div style={{ padding: 24, background: '#fee2e2', color: '#dc2626', borderRadius: 8 }}>
        <h3>Có lỗi xảy ra:</h3>
        <p>{error}</p>
        <button
          onClick={loadData}
          style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  // Lấy dữ liệu từng khách sạn (từ stats.by_hotel hoặc từ danh sách hotels)
  const hotelList = (stats && Array.isArray(stats.by_hotel) && stats.by_hotel.length > 0)
    ? stats.by_hotel
    : hotels.map((h) => ({
        hotel_id: h.id,
        hotel_name: h.name,
        address: h.address,
        total_rooms: 0,
        total_available: 0,
        total_using: 0,
        total_cleaning: 0,
        total_booked: 0,
        total_checked_out: 0,
        total_cancelled: 0
      }));

  const totalHotels = stats?.total_hotels ?? hotels.length ?? 10;
  const totalStaff = stats?.total_staff ?? 40;
  const bookings = stats?.bookings || { total: 0, booked: 0, using: 0, checked_out: 0, cancelled: 0 };
  const rooms = stats?.rooms || { total: 0, available: 0, using: 0, cleaning: 0 };

  return (
    <div>
      {/* Tiêu đề & nút làm mới */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontSize: 24, color: '#0f172a' }}>
            📊 Tổng Quan Toàn Hệ Thống 10 Khách Sạn
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
            Bảng điều hành dữ liệu phòng, nhân sự và đơn đặt phòng trên toàn bộ chi nhánh chuỗi khách sạn
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

      {/* 4 Thẻ chỉ số tổng hợp */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={cardStyle('#3b82f6')}>
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>🏨 Tổng Số Khách Sạn</div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1e40af', marginTop: 4 }}>
            {totalHotels} <span style={{ fontSize: 14, fontWeight: 'normal' }}>chi nhánh</span>
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
            Hoạt động tại Hà Nội, Đà Nẵng, TP.HCM...
          </div>
        </div>

        <div style={cardStyle('#10b981')}>
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>👷 Nhân Sự &amp; Lao Công</div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#15803d', marginTop: 4 }}>
            {totalStaff} <span style={{ fontSize: 14, fontWeight: 'normal' }}>nhân viên</span>
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
            Phân bổ ca trực ngày và ca đêm tại 10 KS
          </div>
        </div>

        <div style={cardStyle('#f59e0b')}>
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>🛏️ Tổng Số Phòng</div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#b45309', marginTop: 4 }}>
            {rooms.total} <span style={{ fontSize: 14, fontWeight: 'normal' }}>phòng</span>
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
            Còn trống: <strong style={{ color: '#16a34a' }}>{rooms.available}</strong> | Đang ở: <strong style={{ color: '#dc2626' }}>{rooms.using}</strong> | Dọn dẹp: <strong style={{ color: '#d97706' }}>{rooms.cleaning}</strong>
          </div>
        </div>

        <div style={cardStyle('#8b5cf6')}>
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>📋 Đơn Đặt Phòng</div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#6b21a8', marginTop: 4 }}>
            {bookings.total} <span style={{ fontSize: 14, fontWeight: 'normal' }}>giao dịch</span>
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
            Đang ở: <strong style={{ color: '#16a34a' }}>{bookings.using}</strong> | Đã trả: <strong style={{ color: '#6b21a8' }}>{bookings.checked_out}</strong> | Đã huỷ: <strong style={{ color: '#dc2626' }}>{bookings.cancelled}</strong>
          </div>
        </div>
      </div>

      {/* Bảng chi tiết 10 khách sạn */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, color: '#0f172a' }}>Danh Sách &amp; Tình Trạng Hoạt Động 10 Khách Sạn</h3>
            <small style={{ color: '#64748b' }}>Bấm vào khách sạn để xem chi tiết phòng, đơn đặt hoặc chuyển sang web nghiệp vụ</small>
          </div>
          <Link
            to="/hotels"
            style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}
          >
            Xem tất cả khách sạn →
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={thStyle}>STT</th>
                <th style={thStyle}>Khách Sạn</th>
                <th style={thStyle}>Địa Chỉ</th>
                <th style={thStyle}>Tổng Phòng</th>
                <th style={thStyle}>Còn Trống</th>
                <th style={thStyle}>Đang Ở</th>
                <th style={thStyle}>Đang Dọn</th>
                <th style={thStyle}>Đã Trả / Huỷ</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Thao Tác Nhanh</th>
              </tr>
            </thead>
            <tbody>
              {hotelList.map((row, idx) => (
                <tr key={row.hotel_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tdStyle}>
                    <strong>#{row.hotel_id}</strong>
                  </td>
                  <td style={tdStyle}>
                    <Link
                      to={`/hotels/${row.hotel_id}`}
                      style={{ color: '#1e40af', fontWeight: 'bold', textDecoration: 'none' }}
                    >
                      🏨 {row.hotel_name}
                    </Link>
                  </td>
                  <td style={{ ...tdStyle, color: '#64748b', fontSize: 13, maxWidth: 220 }}>
                    {row.address || 'Đang cập nhật'}
                  </td>
                  <td style={tdStyle}>
                    <strong>{row.total_rooms ?? '-'}</strong> phòng
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: '#16a34a', fontWeight: 'bold' }}>
                      {row.total_available ?? '-'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: '#dc2626', fontWeight: 600 }}>
                      {row.total_using ?? '-'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: '#d97706', fontWeight: 600 }}>
                      {row.total_cleaning ?? '-'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 12 }}>
                      Trả: <strong>{row.total_checked_out ?? 0}</strong> | Huỷ: <strong style={{ color: '#dc2626' }}>{row.total_cancelled ?? 0}</strong>
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <Link
                        to={`/bookings?hotelId=${row.hotel_id}`}
                        style={actionLinkStyle('#eff6ff', '#2563eb', '#bfdbfe')}
                      >
                        📖 Lịch sử
                      </Link>
                      <Link
                        to={`/drinks?hotelId=${row.hotel_id}`}
                        style={actionLinkStyle('#fff7ed', '#ea580c', '#fed7aa')}
                      >
                        🥤 Đồ uống
                      </Link>
                      <Link
                        to={`/staff?hotelId=${row.hotel_id}`}
                        style={actionLinkStyle('#f0fdf4', '#16a34a', '#bbf7d0')}
                      >
                        👷 Ca trực
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const thStyle = { padding: '12px 14px', fontWeight: 600, whiteSpace: 'nowrap' };
const tdStyle = { padding: '12px 14px', verticalAlign: 'middle' };

function cardStyle(color) {
  return {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderLeft: `5px solid ${color}`,
    borderRadius: 10,
    padding: '16px 20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  };
}

function actionLinkStyle(bg, color, border) {
  return {
    background: bg,
    color: color,
    border: `1px solid ${border}`,
    padding: '4px 10px',
    borderRadius: 6,
    textDecoration: 'none',
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap'
  };
}