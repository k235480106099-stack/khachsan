import { useEffect, useState } from 'react';
import { getAllHotels } from '../services/api.js';
import HotelCard from '../components/HotelCard.jsx';

export default function HotelList() {
  const [hotels, setHotels] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getAllHotels().then(setHotels).catch((err) => setError(err.message));
  }, []);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Danh sách 10 khách sạn</h2>
      {hotels.map((hotel) => (
        <HotelCard key={hotel.id} hotel={hotel} />
      ))}
    </div>
  );
}