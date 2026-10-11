import { useEffect, useState } from 'react';
import { getCleanersByHotel, assignCleanerShift, deleteCleanerShift } from '../services/api.js';
import { useHotel } from '../context/HotelContext.jsx';

const SHIFT_LABEL = { day: 'Ca ngày', night: 'Ca đêm' };

export default function CleaningSchedule() {
  const { hotelId, currentHotel } = useHotel();
  const [cleaners, setCleaners] = useState([]);
  const [form, setForm] = useState({ full_name: '', shift: 'day', work_date: '' });
  const [error, setError] = useState('');

  async function loadCleaners() {
    if (!hotelId) return;
    try {
      const data = await getCleanersByHotel(hotelId);
      setCleaners(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadCleaners();
  }, [hotelId]);

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    try {
      await assignCleanerShift({ ...form, hotel_id: hotelId });
      setForm({ full_name: '', shift: 'day', work_date: '' });
      loadCleaners();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteCleanerShift(id);
      loadCleaners();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0' }}>Lịch Trực Lao Công — {currentHotel?.name}</h2>
          <p style={{ margin: 0, color: '#666', fontSize: 14 }}>Phân ca ngày và ca đêm cho nhân viên dọn dẹp vệ sinh phòng</p>
        </div>
        <button onClick={loadCleaners} style={{ padding: '8px 16px', borderRadius: 6, cursor: 'pointer', background: '#fff', border: '1px solid #ccc' }}>
          🔄 Làm mới
        </button>
      </div>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', background: '#fff', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
        <input
          placeholder="Họ tên lao công"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          required
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', flex: 1, minWidth: 180 }}
        />
        <select
          value={form.shift}
          onChange={(e) => setForm({ ...form, shift: e.target.value })}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}
        >
          <option value="day">☀️ Ca ngày (06:00 - 18:00)</option>
          <option value="night">🌙 Ca đêm (18:00 - 06:00)</option>
        </select>
        <input
          type="date"
          value={form.work_date}
          onChange={(e) => setForm({ ...form, work_date: e.target.value })}
          required
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}
        />
        <button type="submit" style={{ background: '#059669', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' }}>
          ➕ Xếp ca
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
              <th style={cellStyle}>Họ tên lao công</th>
              <th style={cellStyle}>Ca trực</th>
              <th style={cellStyle}>Ngày làm</th>
              <th style={cellStyle}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {cleaners.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: 24, textAlign: 'center', color: '#999' }}>Chưa có lịch trực lao công nào tại khách sạn này.</td>
              </tr>
            ) : (
              cleaners.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={cellStyle}><strong>{c.full_name}</strong></td>
                  <td style={cellStyle}>
                    <span style={{ background: c.shift === 'day' ? '#fef3c7' : '#ede9fe', color: c.shift === 'day' ? '#b45309' : '#6d28d9', padding: '3px 8px', borderRadius: 4, fontWeight: 'bold', fontSize: 12 }}>
                      {SHIFT_LABEL[c.shift] || c.shift}
                    </span>
                  </td>
                  <td style={cellStyle}>{c.work_date}</td>
                  <td style={cellStyle}>
                    <button onClick={() => handleDelete(c.id)} style={{ color: '#ef4444', border: '1px solid #fca5a5', background: '#fff', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>
                      Xoá
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const cellStyle = { padding: '10px 14px' };