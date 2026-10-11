import { createContext, useContext, useState, useEffect } from 'react';
import { getAllHotels, getCurrentUser } from '../services/api.js';

const HotelContext = createContext();

export function HotelProvider({ children }) {
  const user = getCurrentUser();
  const initialHotelId = Number(localStorage.getItem('active_hotel_id')) || user?.hotel_id || 1;

  const [hotelId, setHotelIdState] = useState(initialHotelId);
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    getAllHotels()
      .then(setHotels)
      .catch((err) => console.error('Lỗi tải danh sách khách sạn:', err));
  }, []);

  function setHotelId(newId) {
    const numericId = Number(newId);
    setHotelIdState(numericId);
    localStorage.setItem('active_hotel_id', String(numericId));
  }

  const currentHotel = hotels.find((h) => h.id === hotelId) || { id: hotelId, name: `Khách sạn #${hotelId}` };

  return (
    <HotelContext.Provider value={{ hotelId, setHotelId, hotels, currentHotel }}>
      {children}
    </HotelContext.Provider>
  );
}

export function useHotel() {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
}
