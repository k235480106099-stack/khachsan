const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('staff_token') || localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {})
    },
    ...options
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Có lỗi xảy ra');
  }
  return data;
}

// ----- Xác thực đăng nhập -----
export async function login(username, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  localStorage.setItem('staff_token', data.token);
  localStorage.setItem('staff_user', JSON.stringify(data.user));
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

export function logout() {
  localStorage.removeItem('staff_token');
  localStorage.removeItem('staff_user');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('active_hotel_id');
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('staff_user') || localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ----- Danh sách Khách sạn -----
export function getAllHotels() {
  return request('/hotels');
}

// ----- Lịch trực Lễ tân -----
export function getStaffByHotel(hotelId) {
  return request(`/staff/hotel/${hotelId}`);
}

export function assignStaffShift(payload) {
  return request('/staff', { method: 'POST', body: JSON.stringify(payload) });
}

export function deleteStaffShift(id) {
  return request(`/staff/${id}`, { method: 'DELETE' });
}

// ----- Lịch trực Lao công -----
export function getCleanersByHotel(hotelId) {
  return request(`/staff/cleaners/hotel/${hotelId}`);
}

export function assignCleanerShift(payload) {
  return request('/staff/cleaners', { method: 'POST', body: JSON.stringify(payload) });
}

export function deleteCleanerShift(id) {
  return request(`/staff/cleaners/${id}`, { method: 'DELETE' });
}

// ----- Trạng thái phòng & Check-in / Check-out -----
export function getRoomsByHotel(hotelId) {
  return request(`/rooms/hotel/${hotelId}`);
}

export function updateRoomStatus(roomId, status) {
  return request(`/rooms/${roomId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}

export function getBookingsByHotel(hotelId) {
  return request(`/bookings/hotel/${hotelId}`);
}

export function checkInBooking(bookingId) {
  return request(`/bookings/${bookingId}/checkin`, { method: 'PATCH' });
}

export function checkOutBooking(bookingId) {
  return request(`/bookings/${bookingId}/checkout`, { method: 'PATCH' });
}

export const checkinBooking = checkInBooking;
export const checkoutBooking = checkOutBooking;
export const getBookingHistoryByHotel = getBookingsByHotel;

// Huỷ phòng do khách không đồng ý cọc hoặc theo yêu cầu
export function cancelBookingByStaff(bookingId, reason) {
  return request(`/bookings/${bookingId}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ reason })
  });
}

// Nhắc cọc cho khách
export function remindDeposit(bookingId, message) {
  return request(`/bookings/${bookingId}/remind`, {
    method: 'PATCH',
    body: JSON.stringify({ message })
  });
}

// ----- Quản lý phục vụ đồ uống tại phòng -----
export function getDrinkOrdersByHotel(hotelId) {
  return request(`/drinks/orders/hotel/${hotelId}`);
}

export function updateDrinkOrderStatus(orderId, status) {
  return request(`/drinks/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}

export function sendDrinkOrderMessage(orderId, message, senderName = 'Tiếp tân') {
  return request(`/drinks/orders/${orderId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message, sender_name: senderName, sender_type: 'staff' })
  });
}

export function getDrinkOrderMessages(orderId) {
  return request(`/drinks/orders/${orderId}/messages`);
}