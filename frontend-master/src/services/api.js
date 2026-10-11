const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
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

// ----- Đăng nhập -----
export async function login(username, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ----- Khách sạn -----
export function getAllHotels() {
  return request('/hotels');
}

export function getHotelById(id) {
  return request(`/hotels/${id}`);
}

// ----- Dashboard -----
export function getOverallStats() {
  return request('/dashboard/overview');
}

export function getHotelStats(hotelId) {
  return request(`/dashboard/hotel/${hotelId}`);
}

// ----- Đặt phòng -----
export function getAllBookings() {
  return request('/bookings');
}

export function getBookingHistoryByHotel(hotelId) {
  return request(`/bookings/hotel/${hotelId}`);
}

export function getAllBookingLogs() {
  return request('/bookings/logs');
}

export function getBookingLogs(bookingId) {
  return request(`/bookings/${bookingId}/logs`);
}

// ----- Nhân viên / lao công -----
export function getAllStaffOverview() {
  return request('/staff/overview');
}

export function getStaffByHotel(hotelId) {
  return request(`/staff/hotel/${hotelId}`);
}

export function getCleanersByHotel(hotelId) {
  return request(`/staff/cleaners/hotel/${hotelId}`);
}

// ----- Dịch vụ gọi đồ uống tại phòng -----
export function getAllDrinkOrders() {
  return request('/drinks/orders');
}

export function getDrinkOrdersByHotel(hotelId) {
  return request(`/drinks/orders/hotel/${hotelId}`);
}

export function getDrinkOrderMessages(orderId) {
  return request(`/drinks/orders/${orderId}/messages`);
}