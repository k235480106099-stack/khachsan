const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Có lỗi xảy ra, vui lòng thử lại');
  }
  return data;
}

// ----- Khách sạn -----
export function getAllHotels() {
  return request('/hotels');
}

export function getHotelById(hotelId) {
  return request(`/hotels/${hotelId}`);
}

// ----- Phòng -----
export function getRoomsByHotel(hotelId) {
  return request(`/rooms/hotel/${hotelId}`);
}

// ----- Đặt phòng -----
export function createBooking(payload) {
  return request('/bookings', { method: 'POST', body: JSON.stringify(payload) });
}

export function confirmDeposit(bookingId, depositAmount) {
  return request(`/bookings/${bookingId}/deposit`, {
    method: 'PATCH',
    body: JSON.stringify({ deposit_amount: depositAmount })
  });
}

export function cancelBooking(bookingId, reason = '') {
  return request(`/bookings/${bookingId}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ reason })
  });
}

export function getBookingHistoryByGuest(phone) {
  return request(`/bookings/guest/${phone}`);
}

// ----- Đồ uống & Phục vụ phòng -----
export function getDrinkMenu() {
  return request('/drinks/menu');
}

export function createDrinkOrder(payload) {
  return request('/drinks/orders', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function getDrinkOrder(orderId) {
  return request(`/drinks/orders/${orderId}`);
}

export function sendOrderReminder(orderId, message, senderName = '') {
  return request(`/drinks/orders/${orderId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message, sender_name: senderName, sender_type: 'guest' })
  });
}

export function getOrderMessages(orderId) {
  return request(`/drinks/orders/${orderId}/messages`);
}