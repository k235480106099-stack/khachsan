import { Link } from 'react-router-dom';

export default function HotelCard({ hotel }) {
  return (
    <Link
      to={`/hotels/${hotel.id}`}
      style={{
        display: 'block',
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: 16,
        textDecoration: 'none',
        color: '#333',
        marginBottom: 12
      }}
    >
      <h3 style={{ margin: '0 0 4px' }}>{hotel.name}</h3>
      <p style={{ margin: 0, color: '#777' }}>{hotel.address}</p>
    </Link>
  );
}