import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { getHotelById, getAllHotels } from '../services/api.js';
import MapEmbed from '../components/MapEmbed.jsx';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawHotelId = searchParams.get('hotelId');
  const hotelId = rawHotelId || '1';

  const [hotels, setHotels] = useState([]);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tải danh sách 10 khách sạn
  useEffect(() => {
    getAllHotels()
      .then((data) => setHotels(Array.isArray(data) ? data : []))
      .catch((err) => console.warn('Lỗi tải danh sách KS:', err));
  }, []);

  // Tải chi tiết khách sạn đang chọn
  useEffect(() => {
    setLoading(true);
    setError('');
    getHotelById(hotelId)
      .then((data) => {
        setHotel(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Không thể tải thông tin khách sạn');
        setLoading(false);
      });
  }, [hotelId]);

  function handleSelectHotel(id) {
    setSearchParams({ hotelId: String(id) });
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Thanh chọn nhanh 10 Khách sạn */}
      <div
        style={{
          background: '#fff',
          padding: '16px 20px',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          marginBottom: 24,
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 'bold', color: '#1e3a8a' }}>
            🏨 Chọn Khách Sạn Để Đặt Phòng (Chuỗi 10 Chi Nhánh):
          </span>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Đang xem: <strong>{hotel?.name || `Khách sạn #${hotelId}`}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
          {hotels.map((h) => {
            const isSelected = String(h.id) === String(hotelId);
            return (
              <button
                key={h.id}
                onClick={() => handleSelectHotel(h.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  background: isSelected ? '#eff6ff' : '#fff',
                  color: isSelected ? '#1e40af' : '#334155',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontSize: 13,
                  transition: 'all 0.15s'
                }}
              >
                #{h.id}. {h.name}
              </button>
            );
          })}
        </div>
      </div>

      {loading && <p style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>Đang tải thông tin khách sạn...</p>}
      {error && <p style={{ color: '#dc2626', background: '#fee2e2', padding: 12, borderRadius: 8 }}>{error}</p>}

      {!loading && hotel && (
        <div style={{ background: '#fff', padding: 28, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 16, marginBottom: 20 }}>
            <span style={{ background: '#1e3a8a', color: '#fff', fontSize: 12, padding: '3px 8px', borderRadius: 4, fontWeight: 'bold' }}>
              CHI NHÁNH #{hotel.id}
            </span>
            <h1 style={{ margin: '8px 0 4px', fontSize: 26, color: '#0f172a' }}>{hotel.name}</h1>
            <p style={{ margin: '0 0 8px', color: '#475569', fontSize: 14 }}>📍 {hotel.address}</p>
            <p style={{ margin: 0, color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{hotel.description}</p>
          </div>

          {/* Bản đồ định vị */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 16, color: '#334155' }}>Vị trí trên Google Maps:</h3>
            <MapEmbed mapUrl={hotel.map_url} address={hotel.address} />
          </div>

          {/* Các nút hành động chính */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginTop: 24 }}>
            <Link
              to={`/rooms?hotelId=${hotel.id}`}
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '14px 18px',
                background: '#2563eb',
                color: '#fff',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: 15,
                boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
              }}
            >
              🛏️ Xem Danh Sách Phòng &amp; Đặt Phòng
            </Link>

            <Link
              to={`/drinks?hotelId=${hotel.id}`}
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '14px 18px',
                background: '#ea580c',
                color: '#fff',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: 15,
                boxShadow: '0 2px 4px rgba(234,88,12,0.2)'
              }}
            >
              🥤 Gọi Đồ Uống Tận Phòng (Room Service)
            </Link>

            <Link
              to={`/rules?hotelId=${hotel.id}`}
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '14px 18px',
                background: '#f8fafc',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 15
              }}
            >
              📋 Nội Quy Khách Sạn
            </Link>

            <Link
              to={`/history?hotelId=${hotel.id}`}
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '14px 18px',
                background: '#f8fafc',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 15
              }}
            >
              🔍 Tra Cứu / Huỷ Phòng
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}