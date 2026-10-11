import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api.js';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: 'admin', password: 'admin123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          maxWidth: 420,
          background: '#fff',
          borderRadius: 14,
          padding: '32px 32px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 42, marginBottom: 8 }}>👑</div>
          <h2 style={{ margin: '0 0 6px', color: '#0f172a', fontSize: 24 }}>Web Quản Lý Tổng</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
            Đăng nhập để điều hành chuỗi 10 chi nhánh
          </p>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 13 }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              Tài khoản Admin
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: 14 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              Mật khẩu
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: 14 }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 10,
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              padding: '14px',
              borderRadius: 8,
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: 15,
              transition: '0.2s'
            }}
          >
            {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
          </button>
        </form>

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f1f5f9', fontSize: 13, color: '#64748b', textAlign: 'center' }}>
          Tài khoản mặc định: <strong>admin</strong> / <strong>admin123</strong>
        </div>
      </div>
    </div>
  );
}