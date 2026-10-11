import { useEffect, useState } from 'react';
import { getStaffByHotel, assignStaffShift, deleteStaffShift } from '../services/api.js';
import { useHotel } from '../context/HotelContext.jsx';

const SHIFT_LABEL = { day: 'Ca ngày', night: 'Ca đêm' };

export default function ShiftSchedule() {
  const { hotelId, currentHotel } = useHotel();
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({ full_name: '', shift: 'day', work_date: '' });
  const [error, setError] = useState('');

  async function loadStaff() {
    if (!hotelId) return;
    try {
      const data = await getStaffByHotel(hotelId);
      setStaff(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadStaff();
  }, [hotelId]);

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    try {
      await assignStaffShift({ ...form, hotel_id: hotelId });
      setForm({ full_name: '', shift: 'day', work_date: '' });
      loadStaff();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteStaffShift(id);
      loadStaff();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0' }}>Lịch Trực Lễ Tân — {currentHotel?.name}</h2>
          <p style={{ margin: 0, color: '#666', fontSize: 14 }}>Phân ca ngày và ca đêm cho lễ tân khách sạn</p>
        </div>
        <button onClick={loadStaff} style={{ padding: '8px 16px', borderRadius: 6, cursor: 'pointer', background: '#fff', border: '1px solid #ccc' }}>
          🔄 Làm mới
        </button>
      </div>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', background: '#fff', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
        <input
          placeholder="Họ tên nhân viên"
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
        <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' }}>
          ➕ Xếp ca
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
              <th style={cellStyle}>Họ tên</th>
              <th style={cellStyle}>Ca trực</th>
              <th style={cellStyle}>Ngày làm</th>
              <th style={cellStyle}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: 24, textAlign: 'center', color: '#999' }}>Chưa có lịch trực lễ tân nào tại khách sạn này.</td>
              </tr>
            ) : (
              staff.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={cellStyle}><strong>{s.full_name}</strong></td>
                  <td style={cellStyle}>
                    <span style={{ background: s.shift === 'day' ? '#fef3c7' : '#ede9fe', color: s.shift === 'day' ? '#b45309' : '#6d28d9', padding: '3px 8px', borderRadius: 4, fontWeight: 'bold', fontSize: 12 }}>
                      {SHIFT_LABEL[s.shift] || s.shift}
                    </span>
                  </td>
                  <td style={cellStyle}>{s.work_date}</td>
                  <td style={cellStyle}>
                    <button onClick={() => handleDelete(s.id)} style={{ color: '#ef4444', border: '1px solid #fca5a5', background: '#fff', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>
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