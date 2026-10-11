import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllHotels, getAllStaffOverview, getStaffByHotel, getCleanersByHotel } from '../services/api.js';

const SHIFT_MAP = {
  day: { label: '☀️ Ca Ngày (06:00 - 18:00)', bg: '#fef3c7', color: '#b45309' },
  night: { label: '🌙 Ca Đêm (18:00 - 06:00)', bg: '#ede9fe', color: '#6d28d9' }
};

export default function StaffOverview() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlHotelId = searchParams.get('hotelId') || 'all';

  const [staffList, setStaffList] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [hotelFilter, setHotelFilter] = useState(urlHotelId);
  const [roleFilter, setRoleFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAccountModal, setShowAccountModal] = useState(false);

  function loadData() {
    setLoading(true);
    setError('');

    Promise.all([
      getAllHotels().catch(() => []),
      getAllStaffOverview().catch(async () => {
        // Fallback: nếu /staff/overview bị lỗi thì load qua từng khách sạn
        const hList = await getAllHotels().catch(() => []);
        const all = [];
        for (const h of hList) {
          const [s, c] = await Promise.all([
            getStaffByHotel(h.id).catch(() => []),
            getCleanersByHotel(h.id).catch(() => [])
          ]);
          all.push(...(s || []).map((x) => ({ ...x, hotel_name: h.name, role: 'receptionist' })));
          all.push(...(c || []).map((x) => ({ ...x, hotel_name: h.name, role: 'cleaner' })));
        }
        return all;
      })
    ])
      .then(([hotelsData, staffData]) => {
        setHotels(Array.isArray(hotelsData) ? hotelsData : []);
        setStaffList(Array.isArray(staffData) ? staffData : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Không thể tải dữ liệu ca trực');
        setLoading(false);
      });
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (urlHotelId) {
      setHotelFilter(urlHotelId);
    }
  }, [urlHotelId]);

  function handleHotelChange(newVal) {
    setHotelFilter(newVal);
    if (newVal === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ hotelId: newVal });
    }
  }

  const filtered = staffList.filter((s) => {
    if (hotelFilter !== 'all' && String(s.hotel_id) !== String(hotelFilter)) return false;
    if (roleFilter !== 'all' && s.role !== roleFilter) return false;
    if (shiftFilter !== 'all' && s.shift !== shiftFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = (s.full_name || '').toLowerCase().includes(term);
      const matchHotel = (s.hotel_name || '').toLowerCase().includes(term);
      const matchPhone = (s.phone || '').includes(term);
      if (!matchName && !matchHotel && !matchPhone) return false;
    }
    return true;
  });

  const countReceptionist = staffList.filter((s) => s.role === 'receptionist').length;
  const countCleaner = staffList.filter((s) => s.role === 'cleaner').length;
  const countDay = staffList.filter((s) => s.shift === 'day').length;
  const countNight = staffList.filter((s) => s.shift === 'night').length;

  return (
    <div>
      {/* Tiêu đề & nút hành động */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontSize: 24, color: '#0f172a' }}>
            Theo Dõi Ca Trực Nhân Viên &amp; Lao Công Toàn Hệ Thống
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
            Quản lý phân ca Lễ tân và Lao công (Ca ngày, Ca đêm) của 10 khách sạn
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowAccountModal(!showAccountModal)}
            style={{
              background: '#047857',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '9px 16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            🔑 Danh Sách Tài Khoản 10 KS
          </button>
          <button
            onClick={loadData}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '9px 16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            🔄 Làm mới danh sách
          </button>
        </div>
      </div>

      {/* Hướng dẫn tài khoản 10 khách sạn */}
      {showAccountModal && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: 10,
            padding: 16,
            marginBottom: 20,
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, color: '#166534', fontSize: 16 }}>
              📋 Danh sách tài khoản đăng nhập Web Nhân Viên (Cổng 3002) cho cả 10 Khách Sạn:
            </h3>
            <button
              onClick={() => setShowAccountModal(false)}
              style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#166534' }}
            >
              ✕ Đóng
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {hotels.map((h) => (
              <div
                key={h.id}
                style={{
                  background: '#fff',
                  border: '1px solid #bbf7d0',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: 13
                }}
              >
                <div style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: 4 }}>
                  #{h.id}. {h.name}
                </div>
                <div style={{ color: '#1e40af' }}>
                  👨‍💼 Lễ tân: <code>staff_{h.id}</code> / pass: <code>123456</code>
                </div>
                <div style={{ color: '#047857' }}>
                  🧹 Lao công: <code>cleaner_{h.id}</code> / pass: <code>123456</code>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: '#4b5563' }}>
            💡 Quản trị viên Web Tổng (Cổng 3000): tài khoản <code>admin</code> / mật khẩu <code>admin123</code>.
          </div>
        </div>
      )}

      {/* Thẻ đếm nhân sự */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div style={statBoxStyle}>
          <div style={{ fontSize: 12, color: '#64748b' }}>Tổng nhân sự 10 KS</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a' }}>{staffList.length} người</div>
        </div>
        <div style={statBoxStyle}>
          <div style={{ fontSize: 12, color: '#64748b' }}>👨‍💼 Nhân viên lễ tân</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#2563eb' }}>{countReceptionist} người</div>
        </div>
        <div style={statBoxStyle}>
          <div style={{ fontSize: 12, color: '#64748b' }}>🧹 Lao công dọn phòng</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#059669' }}>{countCleaner} người</div>
        </div>
        <div style={statBoxStyle}>
          <div style={{ fontSize: 12, color: '#64748b' }}>☀️ Đang trực Ca Ngày</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#d97706' }}>{countDay} ca</div>
        </div>
        <div style={statBoxStyle}>
          <div style={{ fontSize: 12, color: '#64748b' }}>🌙 Đang trực Ca Đêm</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#7c3aed' }}>{countNight} ca</div>
        </div>
      </div>

      {/* Bộ lọc 3 tiêu chí: Khách sạn, Vị trí, Ca trực + Tìm kiếm */}
      <div
        style={{
          background: '#fff',
          padding: '12px 16px',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          marginBottom: 16,
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <strong style={{ fontSize: 13, color: '#334155' }}>🏨 Khách sạn:</strong>
          <select
            value={hotelFilter}
            onChange={(e) => handleHotelChange(e.target.value)}
            style={selectStyle}
          >
            <option value="all">Tất cả 10 khách sạn ({staffList.length})</option>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                #{h.id} - {h.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <strong style={{ fontSize: 13, color: '#334155' }}>💼 Vị trí:</strong>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={selectStyle}>
            <option value="all">Tất cả vị trí</option>
            <option value="receptionist">👨‍💼 Nhân viên lễ tân</option>
            <option value="cleaner">🧹 Lao công dọn phòng</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <strong style={{ fontSize: 13, color: '#334155' }}>⏰ Ca trực:</strong>
          <select value={shiftFilter} onChange={(e) => setShiftFilter(e.target.value)} style={selectStyle}>
            <option value="all">Tất cả ca trực</option>
            <option value="day">☀️ Ca ngày (06:00 - 18:00)</option>
            <option value="night">🌙 Ca đêm (18:00 - 06:00)</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <input
            placeholder="🔍 Tìm tên nhân viên, SĐT, khách sạn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '7px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginLeft: 'auto', fontSize: 13, color: '#64748b' }}>
          Đang hiển thị: <strong>{filtered.length}</strong> / {staffList.length} nhân sự
        </div>
      </div>

      {loading && <p style={{ color: '#64748b' }}>Đang tải lại dữ liệu nhân sự...</p>}
      {error && <p style={{ color: '#dc2626', background: '#fee2e2', padding: 12, borderRadius: 8 }}>{error}</p>}

      {/* Bảng danh sách nhân sự */}
      {!loading && (
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                <th style={thStyle}>STT</th>
                <th style={thStyle}>Khách Sạn</th>
                <th style={thStyle}>Họ và Tên</th>
                <th style={thStyle}>Vị Trí Công Việc</th>
                <th style={thStyle}>Ca Trực Phân Công</th>
                <th style={thStyle}>Ngày Trực Làm Việc</th>
                <th style={thStyle}>Số Điện Thoại</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: 36, textAlign: 'center', color: '#94a3b8' }}>
                    Không tìm thấy dữ liệu ca trực nào theo bộ lọc.
                  </td>
                </tr>
              ) : (
                filtered.map((s, index) => {
                  const shiftInfo = SHIFT_MAP[s.shift] || { label: s.shift, bg: '#eee', color: '#333' };
                  const isCleaner = s.role === 'cleaner';

                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ ...tdStyle, color: '#94a3b8', fontSize: 13 }}>{index + 1}</td>
                      <td style={tdStyle}>
                        <strong style={{ color: '#0f172a' }}>{s.hotel_name || `Khách sạn #${s.hotel_id}`}</strong>
                      </td>
                      <td style={tdStyle}>
                        <strong style={{ color: '#1e293b' }}>{s.full_name}</strong>
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            background: isCleaner ? '#ecfdf5' : '#eff6ff',
                            color: isCleaner ? '#047857' : '#1d4ed8',
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontWeight: '600',
                            fontSize: 12,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          {isCleaner ? '🧹 Lao công dọn phòng' : '👤 Nhân viên lễ tân'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            background: shiftInfo.bg,
                            color: shiftInfo.color,
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontWeight: '600',
                            fontSize: 12,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          {shiftInfo.label}
                        </span>
                      </td>
                      <td style={tdStyle}>{s.work_date}</td>
                      <td style={tdStyle}>
                        <span style={{ color: '#475569', fontFamily: 'monospace' }}>
                          {s.phone || '0901.xxx.xxx'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle = { padding: '12px 16px', fontWeight: 600 };
const tdStyle = { padding: '12px 16px', verticalAlign: 'middle' };
const selectStyle = { padding: '7px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 };
const statBoxStyle = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' };