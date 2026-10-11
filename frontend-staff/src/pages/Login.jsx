import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api.js';

const HOTEL_LIST = [
  { id: 1, name: 'Khách sạn Ánh Dương Hà Nội' },
  { id: 2, name: 'Khách sạn Biển Xanh Đà Nẵng' },
  { id: 3, name: 'Khách sạn Sài Gòn Pearl TP.HCM' },
  { id: 4, name: 'Khách sạn Ngàn Hoa Đà Lạt' },
  { id: 5, name: 'Khách sạn Cát Vàng Nha Trang' },
  { id: 6, name: 'Khách sạn Hoàng Cung Huế' },
  { id: 7, name: 'Khách sạn Đảo Ngọc Phú Quốc' },
  { id: 8, name: 'Khách sạn Hạ Long Bay View' },
  { id: 9, name: 'Khách sạn Phố Hội Cổ An' },
  { id: 10, name: 'Khách sạn Tây Đô Cần Thơ' }
];

export default function Login() {
  const navigate = useNavigate();
  const [selectedHotel, setSelectedHotel] = useState(1);
  const [selectedRole, setSelectedRole] = useState('staff'); // staff or cleaner or admin
  const [form, setForm] = useState({ username: 'staff_1', password: '123456' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Khi người dùng chọn khách sạn hoặc vai trò từ menu chọn nhanh
  function handleQuickSelect(hotelId, role) {
    setSelectedHotel(hotelId);
    setSelectedRole(role);
    if (role === 'admin') {
      setForm({ username: 'admin', password: 'admin123' });
    } else if (role === 'cleaner') {
      setForm({ username: `cleaner_${hotelId}`, password: '123456' });
    } else {
      setForm({ username: `staff_${hotelId}`, password: '123456' });
    }
  }

  async function executeLogin(username, password, hotelId) {
    setError('');
    setLoading(true);
    try {
      const data = await login(username, password);
      // Lưu lại khách sạn được chọn
      localStorage.setItem('active_hotel_id', String(data.user.hotel_id || hotelId || 1));
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    executeLogin(form.username, form.password, selectedHotel);
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#0f172a',
        fontFamily: 'Segoe UI, sans-serif',
        padding: 20
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#fff',
          borderRadius: 14,
          padding: '28px 32px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 38, marginBottom: 4 }}>🏨</div>
          <h2 style={{ margin: '0 0 6px', color: '#1e3a8a', fontSize: 22 }}>Đăng Nhập Cả 10 Khách Sạn</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>
            Dành cho Lễ tân &amp; Lao công tại 10 chi nhánh khách sạn
          </p>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
            ❌ {error}
          </div>
        )}

        {/* Khung chọn nhanh khách sạn 1..10 */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 'bold', color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>⚡ Chọn nhanh Khách sạn muốn đăng nhập:</span>
          </div>

          <select
            value={selectedHotel}
            onChange={(e) => handleQuickSelect(Number(e.target.value), selectedRole)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, marginBottom: 10 }}
          >
            {HOTEL_LIST.map((h) => (
              <option key={h.id} value={h.id}>
                #{h.id}. {h.name}
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleQuickSelect(selectedHotel, 'staff')}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 6,
                border: '1px solid',
                borderColor: selectedRole === 'staff' ? '#2563eb' : '#cbd5e1',
                background: selectedRole === 'staff' ? '#eff6ff' : '#fff',
                color: selectedRole === 'staff' ? '#1d4ed8' : '#475569',
                fontWeight: selectedRole === 'staff' ? 'bold' : 'normal',
                cursor: 'pointer',
                fontSize: 12
              }}
            >
              👨‍💼 Lễ tân (staff_{selectedHotel})
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect(selectedHotel, 'cleaner')}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 6,
                border: '1px solid',
                borderColor: selectedRole === 'cleaner' ? '#059669' : '#cbd5e1',
                background: selectedRole === 'cleaner' ? '#ecfdf5' : '#fff',
                color: selectedRole === 'cleaner' ? '#047857' : '#475569',
                fontWeight: selectedRole === 'cleaner' ? 'bold' : 'normal',
                cursor: 'pointer',
                fontSize: 12
              }}
            >
              🧹 Lao công (cleaner_{selectedHotel})
            </button>
          </div>
        </div>

        {/* Form đăng nhập */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
              Tên tài khoản
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
              Mật khẩu
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 6,
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              padding: '12px',
              borderRadius: 6,
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: 15
            }}
          >
            {loading ? 'Đang xác thực...' : `Đăng Nhập Vào Khách Sạn #${selectedHotel}`}
          </button>
        </form>

        {/* Danh sách ghi nhớ tài khoản */}
        <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid #f1f5f9', fontSize: 12, color: '#64748b' }}>
          <strong>💡 Quy ước tài khoản 10 khách sạn:</strong>
          <ul style={{ margin: '6px 0 0', paddingLeft: 18, lineHeight: 1.6 }}>
            <li>Khách sạn 1 đến 10: <code>staff_1</code> .. <code>staff_10</code> (Mật khẩu: <code>123456</code>)</li>
            <li>Lao công 1 đến 10: <code>cleaner_1</code> .. <code>cleaner_10</code> (Mật khẩu: <code>123456</code>)</li>
            <li>Quản trị toàn quyền: <code>admin</code> (Mật khẩu: <code>admin123</code>)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}