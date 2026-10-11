export default function MapEmbed({ mapUrl, address }) {
  const fallbackUrl = address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    : null;

  const url = mapUrl || fallbackUrl;

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden', marginTop: 16 }}>
      <div style={{ background: '#f5f5f5', padding: '10px 16px', borderBottom: '1px solid #eee' }}>
        <strong>📍 Bản đồ chỉ đường dẫn đến khách sạn</strong>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: '#666' }}>{address || 'Đang cập nhật địa chỉ'}</p>
      </div>

      {url ? (
        <iframe
          title="Bản đồ khách sạn"
          src={url}
          width="100%"
          height="320"
          style={{ border: 0, display: 'block' }}
          allowFullScreen=""
          loading="lazy"
        />
      ) : (
        <div style={{ padding: 32, textAlign: 'center', color: '#999' }}>
          Chưa có dữ liệu bản đồ cho khách sạn này
        </div>
      )}
    </div>
  );
}
